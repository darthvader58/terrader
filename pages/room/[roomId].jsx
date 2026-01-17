import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
    Box,
    Button,
    VStack,
    HStack,
    Heading,
    Text,
    SimpleGrid,
    Badge,
    Icon,
    useToast,
    Avatar,
    Divider,
    Spinner,
    Center,
    InputGroup,
    Input,
    InputRightElement,
    IconButton,
    useClipboard,
} from '@chakra-ui/react';
import { FaPlay, FaCrown, FaUser, FaCopy, FaCheck } from 'react-icons/fa';
import { ArrowBackIcon } from '@chakra-ui/icons';
import Protect from '@/components/Protect';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToRoom, leaveGameRoom, startGame, ROOM_STATUS, ROOM_TYPES } from '@/utils/gameRoom';

const GameRoom = () => {
    const { user } = useAuth();
    const router = useRouter();
    const { roomId } = router.query;
    const toast = useToast();
    
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!roomId || !user) return;

        const unsubscribe = subscribeToRoom(roomId, (roomData) => {
            setRoom(roomData);
            setLoading(false);
            
            if (roomData.status === ROOM_STATUS.IN_PROGRESS) {
                router.push(`/play?roomId=${roomId}`);
            } else if (roomData.status === ROOM_STATUS.FINISHED) {
                router.push(`/results?roomId=${roomId}`);
            }
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [roomId, user, router]);

    const handleLeaveRoom = async () => {
        if (!user || !roomId) return;
        
        try {
            await leaveGameRoom(roomId, user.uid);
            router.push('/lobby');
        } catch (error) {
            console.error('Failed to leave room:', error);
        }
    };

    const handleStartGame = async () => {
        if (!user || !roomId) return;
        
        if (room.currentPlayers < 2) {
            toast({
                title: 'Need more players',
                description: 'At least 2 players required to start',
                status: 'warning',
                duration: 3000,
            });
            return;
        }
        
        try {
            await startGame(roomId);
            toast({
                title: 'Game starting!',
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: 'Failed to start game',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        }
    };

    if (loading) {
        return (
            <Protect>
                <Center h="100vh">
                    <Spinner size="xl" color="green.400" />
                </Center>
            </Protect>
        );
    }

    if (!room) {
        return (
            <Protect>
                <Center h="100vh">
                    <VStack spacing={4}>
                        <Text fontSize="xl">Room not found</Text>
                        <Button onClick={() => router.push('/lobby')}>
                            Back to Lobby
                        </Button>
                    </VStack>
                </Center>
            </Protect>
        );
    }

    const players = Object.values(room.players || {});
    const isHost = room.hostUserId === user?.uid;
    const { hasCopied, onCopy } = useClipboard(room.inviteCode || '');

    return (
        <Protect>
            <Head>
                <title>Game Room - Terrader</title>
            </Head>
            
            <Box minH="100vh" p={8}>
                <VStack spacing={8} maxW="1200px" mx="auto">
                    <HStack w="100%" justify="space-between">
                        <Button
                            leftIcon={<ArrowBackIcon />}
                            variant="ghost"
                            onClick={handleLeaveRoom}
                        >
                            Leave Room
                        </Button>
                        <Badge colorScheme="green" fontSize="lg" px={4} py={2}>
                            {room.status}
                        </Badge>
                    </HStack>

                    <Box
                        w="100%"
                        bg="glass"
                        p={8}
                        borderRadius="xl"
                        borderWidth={2}
                        borderColor="green.400"
                    >
                        <VStack spacing={6}>
                            <Heading size="xl">
                                {room.roomType === ROOM_TYPES.GLOBAL ? 'Global Room' : `Room #${roomId?.slice(-6)}`}
                            </Heading>
                            
                            {/* Only show invite code if it's a private room AND user is in the room */}
                            {room.inviteCode && room.roomType === ROOM_TYPES.PRIVATE && room.players[user?.uid] && (
                                <Box w="100%" maxW="md">
                                    <VStack spacing={2}>
                                        <Badge colorScheme="orange" fontSize="sm" px={3} py={1}>
                                            Private Room
                                        </Badge>
                                        <Text fontSize="sm" color="gray.400" textAlign="center">
                                            Share this code with friends to invite them:
                                        </Text>
                                        <InputGroup size="lg">
                                            <Input
                                                value={room.inviteCode}
                                                isReadOnly
                                                textAlign="center"
                                                fontSize="2xl"
                                                letterSpacing="wider"
                                                fontWeight="bold"
                                                bg="brandBlack.200"
                                                borderColor="orange.400"
                                                borderWidth={2}
                                            />
                                            <InputRightElement>
                                                <IconButton
                                                    icon={hasCopied ? <FaCheck /> : <FaCopy />}
                                                    onClick={onCopy}
                                                    colorScheme={hasCopied ? 'green' : 'orange'}
                                                    aria-label="Copy invite code"
                                                />
                                            </InputRightElement>
                                        </InputGroup>
                                        <Text fontSize="xs" color="orange.300">
                                            This code is private and expires in 24 hours
                                        </Text>
                                    </VStack>
                                </Box>
                            )}
                            
                            <HStack spacing={8}>
                                <VStack>
                                    <Text fontSize="sm" color="gray.400">
                                        Players
                                    </Text>
                                    <Text fontSize="3xl" fontWeight="bold">
                                        {room.currentPlayers}/{room.maxPlayers}
                                    </Text>
                                </VStack>
                                <Divider orientation="vertical" h="60px" />
                                <VStack>
                                    <Text fontSize="sm" color="gray.400">
                                        Host
                                    </Text>
                                    <Text fontSize="lg" fontWeight="bold">
                                        {room.hostUsername}
                                    </Text>
                                </VStack>
                                {room.roomType === ROOM_TYPES.GLOBAL && room.autoStartTimer && (
                                    <>
                                        <Divider orientation="vertical" h="60px" />
                                        <VStack>
                                            <Text fontSize="sm" color="gray.400">
                                                Starting in
                                            </Text>
                                            <Text fontSize="2xl" fontWeight="bold" color="yellow.400">
                                                {Math.max(0, Math.floor((room.autoStartTimer - Date.now()) / 1000))}s
                                            </Text>
                                        </VStack>
                                    </>
                                )}
                            </HStack>

                            {isHost && room.status === ROOM_STATUS.WAITING && room.roomType !== ROOM_TYPES.GLOBAL && (
                                <Button
                                    leftIcon={<Icon as={FaPlay} />}
                                    colorScheme="green"
                                    size="lg"
                                    w="300px"
                                    onClick={handleStartGame}
                                    isDisabled={room.currentPlayers < 2}
                                >
                                    Start Game
                                </Button>
                            )}

                            {!isHost && room.status === ROOM_STATUS.WAITING && room.roomType !== ROOM_TYPES.GLOBAL && (
                                <Text color="gray.400" fontSize="lg">
                                    Waiting for host to start the game...
                                </Text>
                            )}

                            {room.roomType === ROOM_TYPES.GLOBAL && room.status === ROOM_STATUS.WAITING && (
                                <Text color="gray.400" fontSize="lg">
                                    Game will start automatically when {room.autoStartThreshold} players join...
                                </Text>
                            )}
                        </VStack>
                    </Box>

                    <Box w="100%">
                        <Heading size="md" mb={4}>
                            Players in Room
                        </Heading>
                        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
                            {players.map((player) => (
                                <Box
                                    key={player.userId}
                                    bg="brandBlack.100"
                                    p={4}
                                    borderRadius="lg"
                                    borderWidth={2}
                                    borderColor={player.userId === user?.uid ? 'green.400' : 'whiteAlpha.200'}
                                >
                                    <HStack spacing={3}>
                                        <Avatar
                                            size="sm"
                                            name={player.username}
                                            bg="green.400"
                                        />
                                        <VStack align="start" spacing={0} flex={1}>
                                            <HStack>
                                                <Text fontWeight="bold" fontSize="sm">
                                                    {player.username}
                                                </Text>
                                                {player.isHost && (
                                                    <Icon as={FaCrown} color="yellow.400" boxSize={3} />
                                                )}
                                            </HStack>
                                            {player.userId === user?.uid && (
                                                <Badge colorScheme="green" fontSize="xs">
                                                    You
                                                </Badge>
                                            )}
                                        </VStack>
                                    </HStack>
                                </Box>
                            ))}
                        </SimpleGrid>
                    </Box>

                    <Box
                        w="100%"
                        bg="brandBlack.100"
                        p={6}
                        borderRadius="xl"
                        borderWidth={2}
                        borderColor="blue.400"
                    >
                        <VStack spacing={3}>
                            <Heading size="sm" color="blue.400">
                                Game Rules
                            </Heading>
                            <Text fontSize="sm" color="gray.300" textAlign="center">
                                • Game Duration: 15 minutes
                            </Text>
                            <Text fontSize="sm" color="gray.300" textAlign="center">
                                • Starting Balance: $500
                            </Text>
                            <Text fontSize="sm" color="gray.300" textAlign="center">
                                • Ranking based on Carbon Score (sustainable trading)
                            </Text>
                            <Text fontSize="sm" color="gray.300" textAlign="center">
                                • Top 3 players earn bonus credits!
                            </Text>
                        </VStack>
                    </Box>
                </VStack>
            </Box>
        </Protect>
    );
};

export default GameRoom;
