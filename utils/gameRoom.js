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
    increment,
    deleteDoc
} from 'firebase/firestore';
import db from '@/db';

export const ROOM_STATUS = {
    WAITING: 'waiting',
    IN_PROGRESS: 'in_progress',
    FINISHED: 'finished'
};

export const ROOM_TYPES = {
    PUBLIC: 'public',
    PRIVATE: 'private',
    GLOBAL: 'global'
};

// Generate a shareable invite code
export function generateInviteCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create or get the current global room
export async function getOrCreateGlobalRoom() {
    const globalRoomsQuery = query(
        collection(db, 'gameRooms'),
        where('roomType', '==', ROOM_TYPES.GLOBAL),
        where('status', '==', ROOM_STATUS.WAITING),
        orderBy('createdAt', 'desc'),
        limit(1)
    );
    
    const snapshot = await getDocs(globalRoomsQuery);
    
    // If a waiting global room exists and isn't full, return it
    if (!snapshot.empty) {
        const room = snapshot.docs[0];
        const roomData = room.data();
        
        if (roomData.currentPlayers < roomData.maxPlayers) {
            return { roomId: room.id, ...roomData };
        }
    }
    
    // Create a new global room
    const roomId = `global_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const roomData = {
        roomId,
        hostUserId: 'system',
        hostUsername: 'System',
        roomType: ROOM_TYPES.GLOBAL,
        maxPlayers: 100,
        currentPlayers: 0,
        status: ROOM_STATUS.WAITING,
        players: {},
        leaderboard: {},
        startTime: null,
        endTime: null,
        createdAt: serverTimestamp(),
        autoStart: true,
        autoStartThreshold: 10, // Auto-start when 10 players join
        autoStartTimer: null,
    };
    
    await setDoc(doc(db, 'gameRooms', roomId), roomData);
    return { roomId, ...roomData };
}

// Check and auto-start global rooms
export async function checkAutoStartGlobalRoom(roomId) {
    const roomRef = doc(db, 'gameRooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) return;
    
    const roomData = roomSnap.data();
    
    if (roomData.roomType === ROOM_TYPES.GLOBAL && 
        roomData.status === ROOM_STATUS.WAITING &&
        roomData.currentPlayers >= roomData.autoStartThreshold) {
        
        // Set a 30-second countdown before auto-start
        if (!roomData.autoStartTimer) {
            const startTime = Date.now() + 30000; // 30 seconds from now
            await updateDoc(roomRef, {
                autoStartTimer: startTime
            });
            
            // Schedule the actual start
            setTimeout(async () => {
                const updatedSnap = await getDoc(roomRef);
                if (updatedSnap.exists() && updatedSnap.data().status === ROOM_STATUS.WAITING) {
                    await startGame(roomId);
                }
            }, 30000);
        }
    }
}

export async function createGameRoom(hostUserId, hostUsername, roomType = ROOM_TYPES.PUBLIC, maxPlayers = 50) {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const inviteCode = roomType === ROOM_TYPES.PRIVATE ? generateInviteCode() : null;
    
    const roomData = {
        roomId,
        hostUserId,
        hostUsername,
        roomType,
        maxPlayers,
        currentPlayers: 1,
        status: ROOM_STATUS.WAITING,
        inviteCode, // Store in room for host/players to see
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
    
    // Store invite code mapping for private rooms (separate collection for security)
    if (inviteCode) {
        await setDoc(doc(db, 'inviteCodes', inviteCode), {
            roomId,
            hostUserId, // Track who created it
            createdAt: serverTimestamp(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        });
    }
    
    return { roomId, inviteCode };
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
    
    // Check if player is already in the room
    if (roomData.players[userId]) {
        return roomData;
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
    
    // Check for auto-start in global rooms
    if (roomData.roomType === ROOM_TYPES.GLOBAL) {
        await checkAutoStartGlobalRoom(roomId);
    }
    
    return roomData;
}

export async function joinRoomByInviteCode(inviteCode, userId, username) {
    const inviteRef = doc(db, 'inviteCodes', inviteCode);
    const inviteSnap = await getDoc(inviteRef);
    
    if (!inviteSnap.exists()) {
        throw new Error('Invalid invite code');
    }
    
    const inviteData = inviteSnap.data();
    
    if (inviteData.expiresAt < Date.now()) {
        await deleteDoc(inviteRef);
        throw new Error('Invite code expired');
    }
    
    return await joinGameRoom(inviteData.roomId, userId, username);
}

export async function leaveGameRoom(roomId, userId) {
    const roomRef = doc(db, 'gameRooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) return;
    
    const roomData = roomSnap.data();
    const players = { ...roomData.players };
    delete players[userId];
    
    const newPlayerCount = Object.keys(players).length;
    
    // Don't delete global rooms, just remove the player
    if (newPlayerCount === 0 && roomData.roomType !== ROOM_TYPES.GLOBAL) {
        await updateDoc(roomRef, {
            status: ROOM_STATUS.FINISHED
        });
    } else {
        let updates = {
            players,
            currentPlayers: newPlayerCount
        };
        
        // If host left and it's not a global room, assign new host
        if (roomData.players[userId]?.isHost && roomData.roomType !== ROOM_TYPES.GLOBAL) {
            const newHostId = Object.keys(players)[0];
            if (newHostId) {
                players[newHostId].isHost = true;
                updates.hostUserId = newHostId;
                updates.hostUsername = players[newHostId].username;
            }
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
    
    // If this was a global room, create a new one
    const roomSnap = await getDoc(roomRef);
    if (roomSnap.exists() && roomSnap.data().roomType === ROOM_TYPES.GLOBAL) {
        await getOrCreateGlobalRoom();
    }
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
            const creditsEarned = isWin ? 50 : 10;
            
            await updateDoc(userRef, {
                totalGames: increment(1),
                wins: isWin ? increment(1) : userData.wins || 0,
                carbonScore: increment(player.carbonScore),
                highestRank: !userData.highestRank || player.rank < parseInt(userData.highestRank.split('/')[0]) 
                    ? `${player.rank}/${rankings.length}` 
                    : userData.highestRank,
                carbonCredits: increment(creditsEarned),
                level: Math.floor(((userData.totalGames || 0) + 1) / 5) + 1
            });
            
            // Save to game history
            await saveGameHistory(player.userId, {
                roomId,
                rank: player.rank,
                totalPlayers: rankings.length,
                carbonScore: player.carbonScore,
                profit: player.profit,
                creditsEarned,
                roomType: roomData.roomType
            });
        }
    }
    
    await updateDoc(roomRef, {
        status: ROOM_STATUS.FINISHED,
        finalRankings: rankings,
        finishedAt: serverTimestamp()
    });
    
    return rankings;
}

export async function getAvailableRooms() {
    // Only show public and global rooms - private rooms are invite-only
    const roomsQuery = query(
        collection(db, 'gameRooms'),
        where('status', '==', ROOM_STATUS.WAITING),
        where('roomType', 'in', [ROOM_TYPES.PUBLIC, ROOM_TYPES.GLOBAL]),
        orderBy('createdAt', 'desc'),
        limit(20)
    );
    
    const snapshot = await getDocs(roomsQuery);
    
    // Filter out any rooms with invite codes (extra security layer)
    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(room => !room.inviteCode); // Ensure no private rooms leak through
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
        creditsEarned: gameData.creditsEarned,
        roomType: gameData.roomType,
        playedAt: serverTimestamp()
    });
}

export async function getUserGameHistory(userId, limitCount = 10) {
    console.log('Fetching game history for userId:', userId);
    
    try {
        // Try with orderBy first (requires index)
        const historyQuery = query(
            collection(db, 'gameHistory'),
            where('userId', '==', userId),
            orderBy('playedAt', 'desc'),
            limit(limitCount)
        );
        
        const snapshot = await getDocs(historyQuery);
        const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Game history fetched (with index):', games.length, 'games');
        return games;
    } catch (error) {
        console.log('Index query failed, using fallback:', error.message);
        
        // If index doesn't exist, fall back to simple query without orderBy
        try {
            const simpleQuery = query(
                collection(db, 'gameHistory'),
                where('userId', '==', userId),
                limit(limitCount)
            );
            
            const snapshot = await getDocs(simpleQuery);
            const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            console.log('Game history fetched (fallback):', games.length, 'games');
            
            // Sort in memory
            return games.sort((a, b) => {
                const aTime = a.playedAt?.toMillis?.() || 0;
                const bTime = b.playedAt?.toMillis?.() || 0;
                return bTime - aTime;
            });
        } catch (fallbackError) {
            console.error('Fallback query also failed:', fallbackError);
            throw fallbackError;
        }
    }
}

// Quick Play - Join random public room or create one with bots
export async function quickPlay(userId, username) {
    // Try to find an available public room
    const publicRoomsQuery = query(
        collection(db, 'gameRooms'),
        where('status', '==', ROOM_STATUS.WAITING),
        where('roomType', '==', ROOM_TYPES.PUBLIC),
        limit(5)
    );
    
    const snapshot = await getDocs(publicRoomsQuery);
    
    // Find a room that's not full
    for (const roomDoc of snapshot.docs) {
        const roomData = roomDoc.data();
        if (roomData.currentPlayers < roomData.maxPlayers) {
            try {
                await joinGameRoom(roomDoc.id, userId, username);
                return { roomId: roomDoc.id, joined: true };
            } catch (error) {
                continue; // Try next room if this one failed
            }
        }
    }
    
    // No available rooms, create one with bots
    const roomId = `quick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate bot names
    const botNames = [
        'EcoBot', 'GreenAI', 'TerraBot', 'CarbonZero', 'NatureAI',
        'EcoTrader', 'GreenMind', 'TerraMax', 'CarbonPro', 'NatureBot',
        'EcoMaster', 'GreenGenius', 'TerraPro', 'CarbonElite', 'NaturePro'
    ];
    
    const players = {
        [userId]: {
            userId,
            username,
            joinedAt: Date.now(),
            ready: true,
            isHost: true,
            isBot: false
        }
    };
    
    // Add 10-15 bots initially (will be competitive)
    const numBots = Math.floor(Math.random() * 6) + 10; // 10-15 bots
    for (let i = 0; i < numBots; i++) {
        const botId = `bot_${i}_${Date.now()}`;
        players[botId] = {
            userId: botId,
            username: botNames[i % botNames.length] + (i >= botNames.length ? ` ${Math.floor(i/botNames.length) + 1}` : ''),
            joinedAt: Date.now(),
            ready: true,
            isHost: false,
            isBot: true
        };
    }
    
    const waitTime = 5000 + Math.random() * 5000; // 5-10 seconds wait
    
    const roomData = {
        roomId,
        hostUserId: userId,
        hostUsername: username,
        roomType: ROOM_TYPES.PUBLIC,
        maxPlayers: 20, // Increased to accommodate more players
        currentPlayers: Object.keys(players).length,
        status: ROOM_STATUS.WAITING,
        players,
        leaderboard: {},
        startTime: null,
        endTime: null,
        createdAt: serverTimestamp(),
        hasBots: true,
        autoStartTimer: Date.now() + waitTime,
        waitingForPlayers: true
    };
    
    await setDoc(doc(db, 'gameRooms', roomId), roomData);
    
    // Wait 5-10 seconds for other players to join
    setTimeout(async () => {
        const roomSnap = await getDoc(doc(db, 'gameRooms', roomId));
        if (roomSnap.exists() && roomSnap.data().status === ROOM_STATUS.WAITING) {
            // Update room to indicate waiting is over
            await updateDoc(doc(db, 'gameRooms', roomId), {
                waitingForPlayers: false
            });
            
            // Start the game
            await startGame(roomId);
        }
    }, waitTime);
    
    return { roomId, joined: false, withBots: true, waitTime: Math.floor(waitTime / 1000) };
}

// Clean up old finished rooms (call this periodically)
export async function cleanupOldRooms() {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    const oldRoomsQuery = query(
        collection(db, 'gameRooms'),
        where('status', '==', ROOM_STATUS.FINISHED),
        where('finishedAt', '<', cutoffTime)
    );
    
    const snapshot = await getDocs(oldRoomsQuery);
    
    for (const doc of snapshot.docs) {
        await deleteDoc(doc.ref);
    }
}
