import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    serverTimestamp,
    onSnapshot,
    arrayUnion,
    increment
} from 'firebase/firestore';
import db from '@/db';

export const ROOM_STATUS = {
    WAITING: 'waiting',
    IN_PROGRESS: 'in_progress',
    FINISHED: 'finished'
};

export const ROOM_TYPES = {
    PUBLIC: 'public',
    PRIVATE: 'private'
};

export async function createGameRoom(hostUserId, hostUsername, roomType = ROOM_TYPES.PUBLIC, maxPlayers = 50) {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const roomData = {
        roomId,
        hostUserId,
        hostUsername,
        roomType,
        maxPlayers,
        currentPlayers: 1,
        status: ROOM_STATUS.WAITING,
        players: {
            [hostUserId]: {
                userId: hostUserId,
                username: hostUsername,
                joinedAt: Date.now(),
                ready: true,
                isHost: true
            }
        },
        leaderboard: {},
        startTime: null,
        endTime: null,
        createdAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'gameRooms', roomId), roomData);
    return roomId;
}

export async function joinGameRoom(roomId, userId, username) {
    const roomRef = doc(db, 'gameRooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
        throw new Error('Room not found');
    }
    
    const roomData = roomSnap.data();
    
    if (roomData.status !== ROOM_STATUS.WAITING) {
        throw new Error('Game already started');
    }
    
    if (roomData.currentPlayers >= roomData.maxPlayers) {
        throw new Error('Room is full');
    }
    
    await updateDoc(roomRef, {
        [`players.${userId}`]: {
            userId,
            username,
            joinedAt: Date.now(),
            ready: false,
            isHost: false
        },
        currentPlayers: increment(1)
    });
    
    return roomData;
}

export async function leaveGameRoom(roomId, userId) {
    const roomRef = doc(db, 'gameRooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) return;
    
    const roomData = roomSnap.data();
    const players = { ...roomData.players };
    delete players[userId];
    
    const newPlayerCount = Object.keys(players).length;
    
    if (newPlayerCount === 0) {
        // Delete room if empty
        await updateDoc(roomRef, {
            status: ROOM_STATUS.FINISHED
        });
    } else {
        // If host left, assign new host
        let updates = {
            players,
            currentPlayers: newPlayerCount
        };
        
        if (roomData.players[userId]?.isHost) {
            const newHostId = Object.keys(players)[0];
            players[newHostId].isHost = true;
            updates.hostUserId = newHostId;
            updates.hostUsername = players[newHostId].username;
        }
        
        await updateDoc(roomRef, updates);
    }
}

export async function startGame(roomId) {
    const roomRef = doc(db, 'gameRooms', roomId);
    
    await updateDoc(roomRef, {
        status: ROOM_STATUS.IN_PROGRESS,
        startTime: Date.now(),
        endTime: Date.now() + (15 * 60 * 1000) // 15 minutes
    });
}

export async function updatePlayerScore(roomId, userId, carbonScore, profit, portfolio) {
    const roomRef = doc(db, 'gameRooms', roomId);
    
    await updateDoc(roomRef, {
        [`leaderboard.${userId}`]: {
            userId,
            carbonScore,
            profit,
            portfolio,
            lastUpdate: Date.now()
        }
    });
}

export async function finishGame(roomId) {
    const roomRef = doc(db, 'gameRooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) return;
    
    const roomData = roomSnap.data();
    const leaderboard = roomData.leaderboard || {};
    
    // Calculate final rankings
    const rankings = Object.values(leaderboard)
        .sort((a, b) => b.carbonScore - a.carbonScore)
        .map((player, index) => ({
            ...player,
            rank: index + 1
        }));
    
    // Update user stats
    for (const player of rankings) {
        const userRef = doc(db, 'users', player.userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const userData = userSnap.data();
            const isWin = player.rank <= 3;
            
            await updateDoc(userRef, {
                totalGames: increment(1),
                wins: isWin ? increment(1) : userData.wins || 0,
                carbonScore: increment(player.carbonScore),
                highestRank: !userData.highestRank || player.rank < parseInt(userData.highestRank.split('/')[0]) 
                    ? `${player.rank}/${rankings.length}` 
                    : userData.highestRank,
                carbonCredits: increment(isWin ? 50 : 10),
                level: Math.floor((userData.totalGames + 1) / 5) + 1
            });
        }
    }
    
    await updateDoc(roomRef, {
        status: ROOM_STATUS.FINISHED,
        finalRankings: rankings
    });
    
    return rankings;
}

export async function getAvailableRooms() {
    const roomsQuery = query(
        collection(db, 'gameRooms'),
        where('status', '==', ROOM_STATUS.WAITING),
        where('roomType', '==', ROOM_TYPES.PUBLIC),
        orderBy('createdAt', 'desc'),
        limit(20)
    );
    
    const snapshot = await getDocs(roomsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export function subscribeToRoom(roomId, callback) {
    const roomRef = doc(db, 'gameRooms', roomId);
    return onSnapshot(roomRef, (snapshot) => {
        if (snapshot.exists()) {
            callback({ id: snapshot.id, ...snapshot.data() });
        }
    });
}

export async function getGlobalLeaderboard(limitCount = 100) {
    const usersQuery = query(
        collection(db, 'users'),
        orderBy('carbonScore', 'desc'),
        limit(limitCount)
    );
    
    const snapshot = await getDocs(usersQuery);
    return snapshot.docs.map((doc, index) => ({
        rank: index + 1,
        userId: doc.id,
        ...doc.data()
    }));
}

export async function saveGameHistory(userId, gameData) {
    const historyRef = doc(collection(db, 'gameHistory'));
    
    await setDoc(historyRef, {
        userId,
        roomId: gameData.roomId,
        rank: gameData.rank,
        totalPlayers: gameData.totalPlayers,
        carbonScore: gameData.carbonScore,
        profit: gameData.profit,
        trades: gameData.trades,
        playedAt: serverTimestamp()
    });
}
