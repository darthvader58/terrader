import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
    Box,
    Button,
    VStack,
    HStack,
    Flex,
    Heading,
    Text,
    SimpleGrid,
    Badge,
    Icon,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useDisclosure,
    FormControl,
    FormLabel,
    Input,
    Select,
    Spinner,
    Center,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    InputGroup,
    InputRightElement,
    useClipboard,
} from '@chakra-ui/react';
import { FaUsers, FaLock, FaGlobe, FaPlay, FaTrophy, FaCopy, FaCheck } from 'react-icons/fa';
import { TimeIcon } from '@chakra-ui/icons';
import Protect from '@/components/Protect';
import Nav from '@/components/Nav';
import LeftNav from '@/components/LeftNav';
import { useAuth } from '@/contexts/AuthContext';
import { createGameRoom, getAvailableRooms, joinGameRoom, joinRoomByInviteCode, getOrCreateGlobalRoom, ROOM_TYPES } from '@/utils/gameRoom';

const Lobby = () => {
    const { user, refreshUserData } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { 
        isOpen: isInviteOpen, 
        onOpen: onInviteOpen, 
        onClose: onInviteClose 
    } = useDisclosure();
    
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [roomType, setRoomType] = useState(ROOM_TYPES.PUBLIC);
    const [maxPlayers, setMaxPlayers] = useState(50);
    const [inviteCode, setInviteCode] = useState('');
    const [createdInviteCode, setCreatedInviteCode] = useState('');
    const { hasCopied, onCopy } = useClipboard(createdInviteCode);

    useEffect(() => {
        loadRooms();
        const interval = setInterval(loadRooms, 5000);
        
        // Refresh user data when lobby loads to get latest credits
        if (refreshUserData) {
            refreshUserData();
        }
        
        return () => clearInterval(interval);
    }, []);

    const loadRooms = async () => {
        try {
            const availableRooms = await getAvailableRooms();
            // Extra client-side filter to ensure no private rooms are shown
            const publicRooms = availableRooms.filter(room => 
                room.roomType !== ROOM_TYPES.PRIVATE && !room.inviteCode
            );
            setRooms(publicRooms);
        } catch (error) {
            console.error('Failed to load rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async () => {
        if (!user) return;
        
        // Check if user has enough credits for non-private rooms (50 credit entry fee)
        if (roomType !== 'PRIVATE' && user.carbonCredits < 50) {
            toast({
                title: 'Insufficient credits',
                description: 'You need 50 credits to create a public/global room.',
                status: 'error',
                duration: 4000,
            });
            return;
        }
        
        setCreating(true);
        try {
            // Deduct 50 credits for non-private rooms
            if (roomType !== 'PRIVATE') {
                const { doc, updateDoc, increment } = await import('firebase/firestore');
                const { db } = await import('@/db');
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    carbonCredits: increment(-50)
                });
                
                // Refresh user data
                if (refreshUserData) {
                    await refreshUserData();
                }
            }
            
            const { roomId, inviteCode: code } = await createGameRoom(
                user.uid,
                user.username,
                roomType,
                maxPlayers
            );
            
            if (code) {
                setCreatedInviteCode(code);
                toast({
                    title: 'Private room created!',
                    description: `Your invite code: ${code} (copied to clipboard)`,
                    status: 'success',
                    duration: 8000,
                    isClosable: true,
                });
                // Auto-copy to clipboard
                navigator.clipboard.writeText(code);
            } else {
                toast({
                    title: 'Room created!',
                    description: '50 credits deducted. Waiting for players...',
                    status: 'success',
                    duration: 3000,
                });
            }
            
            onClose();
            router.push(`/room/${roomId}`);
        } catch (error) {
            toast({
                title: 'Failed to create room',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        } finally {
            setCreating(false);
        }
    };

    const handleJoinRoom = async (roomId) => {
        if (!user) return;
        
        // Check if user has enough credits (50 credit entry fee)
        if (user.carbonCredits < 50) {
            toast({
                title: 'Insufficient credits',
                description: 'You need 50 credits to join a game. Play more to earn credits!',
                status: 'error',
                duration: 4000,
            });
            return;
        }
        
        try {
            // Deduct 50 credits for entry
            const { doc, updateDoc, increment } = await import('firebase/firestore');
            const { db } = await import('@/db');
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                carbonCredits: increment(-50)
            });
            
            // Refresh user data
            if (refreshUserData) {
                await refreshUserData();
            }
            
            await joinGameRoom(roomId, user.uid, user.username);
            
            toast({
                title: 'Joined game!',
                description: '50 credits deducted as entry fee',
                status: 'success',
                duration: 2000,
            });
            
            router.push(`/room/${roomId}`);
        } catch (error) {
            toast({
                title: 'Failed to join room',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        }
    };

    const handleJoinByInviteCode = async () => {
        if (!user || !inviteCode) return;
        
        try {
            const roomData = await joinRoomByInviteCode(inviteCode.trim().toUpperCase(), user.uid, user.username);
            toast({
                title: 'Joined room!',
                status: 'success',
                duration: 2000,
            });
            router.push(`/room/${roomData.roomId}`);
        } catch (error) {
            toast({
                title: 'Failed to join',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        }
        onInviteClose();
    };

    const handleQuickPlay = async () => {
        if (!user) return;
        
        // Check if user has enough credits (50 credit entry fee)
        if (user.carbonCredits < 50) {
            toast({
                title: 'Insufficient credits',
                description: 'You need 50 credits to play. Complete games to earn credits!',
                status: 'error',
                duration: 4000,
            });
            return;
        }
        
        try {
            // Deduct 50 credits for entry
            const { doc, updateDoc, increment } = await import('firebase/firestore');
            const { db } = await import('@/db');
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                carbonCredits: increment(-50)
            });
            
            // Refresh user data
            if (refreshUserData) {
                await refreshUserData();
            }
            
            const { quickPlay } = await import('@/utils/gameRoom');
            const result = await quickPlay(user.uid, user.username);
            
            if (result.withBots) {
                toast({
                    title: 'Quick Play room created',
                    description: `Waiting ${result.waitTime || 8} seconds for other players to join. Game will start automatically.`,
                    status: 'info',
                    duration: 5000,
                });
            } else if (result.joined) {
                toast({
                    title: 'Matched with other players!',
                    description: `Joined an existing room. Game starts in ${result.waitTime || 5} seconds.`,
                    status: 'success',
                    duration: 3000,
                });
            }
            
            router.push(`/room/${result.roomId}`);
        } catch (error) {
            toast({
                title: 'Failed to start game',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        }
    };

    const getRoomTypeIcon = (type) => {
        switch (type) {
            case ROOM_TYPES.GLOBAL:
                return FaGlobe;
            case ROOM_TYPES.PRIVATE:
                return FaLock;
            default:
                return FaUsers;
        }
    };

    const getRoomTypeColor = (type) => {
        switch (type) {
            case ROOM_TYPES.GLOBAL:
                return 'blue.400';
            case ROOM_TYPES.PRIVATE:
                return 'orange.400';
            default:
                return 'green.400';
        }
    };

    return (
        <Protect>
            <Head>
                <title>Game Lobby - Terrader</title>
            </Head>
            
            <Box
                px={{ base: 4, md: 8, lg: 16 }}
                pt={{ base: 4, md: 8 }}
                pb={{ base: 24, lg: 10 }}
                minH="100vh"
            >
                <Nav />
                <LeftNav />

                <Box mt={{ base: 6, md: 10 }} px={{ base: 0, md: 4, lg: 16 }}>
                    <VStack spacing={8} align="stretch">
                        <VStack align="stretch" spacing={{ base: 5, md: 6 }}>
                            <VStack align="start" spacing={{ base: 2, md: 3 }}>
                                <Heading size={{ base: "lg", md: "xl" }}>Game Lobby</Heading>
                                <Text color="gray.300" fontSize={{ base: "sm", md: "md" }}>
                                    Join an active market, start a private room, or jump straight into a quick match.
                                </Text>
                            </VStack>
                            <Flex
                                justify="center"
                                align="center"
                                wrap="wrap"
                                columnGap={4}
                                rowGap={4}
                                w="100%"
                            >
                                <Button
                                    leftIcon={<Icon as={FaPlay} />}
                                    colorScheme="green"
                                    size="lg"
                                    onClick={handleQuickPlay}
                                    minW={{ base: "220px", md: "180px" }}
                                >
                                    Quick Play
                                </Button>
                                <Button
                                    colorScheme="purple"
                                    size="lg"
                                    onClick={onInviteOpen}
                                    minW={{ base: "220px", md: "180px" }}
                                >
                                    Join by Code
                                </Button>
                                <Button
                                    leftIcon={<Icon as={FaUsers} />}
                                    colorScheme="blue"
                                    size="lg"
                                    onClick={onOpen}
                                    minW={{ base: "220px", md: "180px" }}
                                >
                                    Create Room
                                </Button>
                            </Flex>
                        </VStack>

                        <Box
                            bg="glass"
                            backdropFilter="blur(15px)"
                            p={6}
                            borderRadius="xl"
                            borderWidth={2}
                            borderColor="blue.400"
                            boxShadow="0 8px 32px rgba(66, 153, 225, 0.2)"
                        >
                            <HStack spacing={4} align="start">
                                <Icon as={FaTrophy} color="yellow.400" boxSize={6} />
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="bold" fontSize="lg">
                                        Compete for the Top Spot!
                                    </Text>
                                    <Text fontSize="sm" color="gray.400">
                                        Join a room and compete with players worldwide. Top 3 players win bonus credits!
                                    </Text>
                                </VStack>
                            </HStack>
                        </Box>

                        <Tabs colorScheme="green" variant="enclosed">
                            <TabList overflowX="auto" overflowY="hidden" py={1}>
                                <Tab whiteSpace="nowrap">All Rooms ({rooms.length})</Tab>
                                <Tab>Global Rooms</Tab>
                                <Tab>Public Rooms</Tab>
                            </TabList>

                            <TabPanels>
                                <TabPanel px={0}>
                                    {loading ? (
                                        <Center py={20}>
                                            <Spinner size="xl" color="green.400" />
                                        </Center>
                                    ) : rooms.length === 0 ? (
                                        <Box
                                            bg="brandBlack.100"
                                            p={12}
                                            borderRadius="xl"
                                            textAlign="center"
                                        >
                                            <Icon as={FaUsers} boxSize={16} color="gray.500" mb={4} />
                                            <Text fontSize="lg" color="gray.400">
                                                No rooms available. Create one or use Quick Play!
                                            </Text>
                                        </Box>
                                    ) : (
                                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                            {rooms.map((room) => (
                                                <RoomCard
                                                    key={room.roomId}
                                                    room={room}
                                                    onJoin={handleJoinRoom}
                                                    getRoomTypeIcon={getRoomTypeIcon}
                                                    getRoomTypeColor={getRoomTypeColor}
                                                />
                                            ))}
                                        </SimpleGrid>
                                    )}
                                </TabPanel>

                                <TabPanel px={0}>
                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                        {rooms.filter(r => r.roomType === ROOM_TYPES.GLOBAL).map((room) => (
                                            <RoomCard
                                                key={room.roomId}
                                                room={room}
                                                onJoin={handleJoinRoom}
                                                getRoomTypeIcon={getRoomTypeIcon}
                                                getRoomTypeColor={getRoomTypeColor}
                                            />
                                        ))}
                                    </SimpleGrid>
                                </TabPanel>

                                <TabPanel px={0}>
                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                        {rooms.filter(r => r.roomType === ROOM_TYPES.PUBLIC).map((room) => (
                                            <RoomCard
                                                key={room.roomId}
                                                room={room}
                                                onJoin={handleJoinRoom}
                                                getRoomTypeIcon={getRoomTypeIcon}
                                                getRoomTypeColor={getRoomTypeColor}
                                            />
                                        ))}
                                    </SimpleGrid>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </VStack>
                </Box>
            </Box>

            {/* Create Room Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: "sm", md: "md" }}>
                <ModalOverlay />
                <ModalContent bg="brandBlack.200">
                    <ModalHeader>Create Game Room</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>Room Type</FormLabel>
                                <Select
                                    value={roomType}
                                    onChange={(e) => setRoomType(e.target.value)}
                                    bg="brandBlack.100"
                                >
                                    <option value={ROOM_TYPES.PUBLIC}>Public - Anyone can join</option>
                                    <option value={ROOM_TYPES.PRIVATE}>Private - Invite code required</option>
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Max Players</FormLabel>
                                <Select
                                    value={maxPlayers}
                                    onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                                    bg="brandBlack.100"
                                >
                                    <option value={10}>10 Players</option>
                                    <option value={25}>25 Players</option>
                                    <option value={50}>50 Players</option>
                                    <option value={100}>100 Players</option>
                                </Select>
                            </FormControl>

                            {roomType === ROOM_TYPES.PRIVATE && (
                                <Box
                                    w="100%"
                                    p={4}
                                    bg="blue.900"
                                    borderRadius="md"
                                    borderWidth={1}
                                    borderColor="blue.400"
                                >
                                    <Text fontSize="sm" color="gray.300">
                                        A unique invite code will be generated. Share it with friends to let them join!
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="green"
                            onClick={handleCreateRoom}
                            isLoading={creating}
                        >
                            Create Room
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Join by Invite Code Modal */}
            <Modal isOpen={isInviteOpen} onClose={onInviteClose} isCentered size={{ base: "sm", md: "md" }}>
                <ModalOverlay />
                <ModalContent bg="brandBlack.200">
                    <ModalHeader>Join by Invite Code</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Enter Invite Code</FormLabel>
                            <Input
                                placeholder="ABC123"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                bg="brandBlack.100"
                                size="lg"
                                textAlign="center"
                                fontSize="2xl"
                                letterSpacing="wider"
                                maxLength={6}
                            />
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onInviteClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="purple"
                            onClick={handleJoinByInviteCode}
                            isDisabled={inviteCode.length !== 6}
                        >
                            Join Room
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Protect>
    );
};

// Room Card Component
const RoomCard = ({ room, onJoin, getRoomTypeIcon, getRoomTypeColor }) => {
    return (
        <Box
            bg="brandBlack.100"
            backdropFilter="blur(10px)"
            p={{ base: 5, md: 6 }}
            borderRadius="xl"
            borderWidth={2}
            borderColor="whiteAlpha.200"
            boxShadow="0 4px 16px rgba(0, 0, 0, 0.2)"
            _hover={{
                borderColor: getRoomTypeColor(room.roomType),
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 24px ${getRoomTypeColor(room.roomType)}40`,
            }}
            transition="all 0.3s"
        >
            <VStack align="stretch" spacing={4}>
                <HStack justify="space-between" align="start" spacing={3}>
                    <HStack align="start">
                        <Icon
                            as={getRoomTypeIcon(room.roomType)}
                            color={getRoomTypeColor(room.roomType)}
                        />
                        <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }}>
                            {room.roomType === ROOM_TYPES.GLOBAL ? 'Global Room' : `Room #${room.roomId.slice(-6)}`}
                        </Text>
                    </HStack>
                    <Badge colorScheme="green">
                        {room.status}
                    </Badge>
                </HStack>

                {room.roomType === ROOM_TYPES.GLOBAL && room.autoStartTimer && (
                    <Badge colorScheme="yellow" fontSize="sm">
                        Starting in {Math.max(0, Math.floor((room.autoStartTimer - Date.now()) / 1000))}s
                    </Badge>
                )}

                <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.400">
                            Host:
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                            {room.hostUsername}
                        </Text>
                    </HStack>
                    <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.400">
                            Players:
                        </Text>
                        <Badge colorScheme="blue">
                            {room.currentPlayers}/{room.maxPlayers}
                        </Badge>
                    </HStack>
                </VStack>

                <Button
                    colorScheme="green"
                    w="100%"
                    onClick={() => onJoin(room.roomId)}
                    isDisabled={room.currentPlayers >= room.maxPlayers}
                >
                    {room.currentPlayers >= room.maxPlayers ? 'Full' : 'Join Room'}
                </Button>
            </VStack>
        </Box>
    );
};

export default Lobby;
