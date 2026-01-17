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
} from '@chakra-ui/react';
import { FaUsers, FaLock, FaGlobe, FaPlay, FaTrophy } from 'react-icons/fa';
import { TimeIcon } from '@chakra-ui/icons';
import Protect from '@/components/Protect';
import Nav from '@/components/Nav';
import LeftNav from '@/components/LeftNav';
import { useAuth } from '@/contexts/AuthContext';
import { createGameRoom, getAvailableRooms, joinGameRoom, ROOM_TYPES } from '@/utils/gameRoom';

const Lobby = () => {
    const { user } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [roomType, setRoomType] = useState(ROOM_TYPES.PUBLIC);
    const [maxPlayers, setMaxPlayers] = useState(50);

    useEffect(() => {
        loadRooms();
        const interval = setInterval(loadRooms, 5000);
        return () => clearInterval(interval);
    }, []);

    const loadRooms = async () => {
        try {
            const availableRooms = await getAvailableRooms();
            setRooms(availableRooms);
        } catch (error) {
            console.error('Failed to load rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async () => {
        if (!user) return;
        
        setCreating(true);
        try {
            const roomId = await createGameRoom(
                user.uid,
                user.username,
                roomType,
                maxPlayers
            );
            
            toast({
                title: 'Room created!',
                description: 'Waiting for players to join...',
                status: 'success',
                duration: 3000,
            });
            
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
            onClose();
        }
    };

    const handleJoinRoom = async (roomId) => {
        if (!user) return;
        
        try {
            await joinGameRoom(roomId, user.uid, user.username);
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

    const handleQuickPlay = async () => {
        if (!user) return;
        
        if (rooms.length > 0) {
            const room = rooms[0];
            await handleJoinRoom(room.roomId);
        } else {
            const roomId = await createGameRoom(user.uid, user.username, ROOM_TYPES.PUBLIC, 50);
            router.push(`/room/${roomId}`);
        }
    };

    return (
        <Protect>
            <Head>
                <title>Game Lobby - Terrader</title>
            </Head>
            
            <Box px={{ base: 6, md: 12, lg: 20 }} pt={10} minH="100vh">
                <Nav />
                <LeftNav />

                <Box mt={12} px={{ base: 4, md: 12, lg: 32 }}>
                    <VStack spacing={8} align="stretch">
                        <HStack justify="space-between">
                            <Heading size="xl">Game Lobby</Heading>
                            <HStack spacing={4}>
                                <Button
                                    leftIcon={<Icon as={FaPlay} />}
                                    colorScheme="green"
                                    size="lg"
                                    onClick={handleQuickPlay}
                                >
                                    Quick Play
                                </Button>
                                <Button
                                    leftIcon={<Icon as={FaUsers} />}
                                    colorScheme="blue"
                                    size="lg"
                                    onClick={onOpen}
                                >
                                    Create Room
                                </Button>
                            </HStack>
                        </HStack>

                        <Box
                            bg="glass"
                            p={6}
                            borderRadius="xl"
                            borderWidth={2}
                            borderColor="blue.400"
                        >
                            <HStack spacing={4}>
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

                        <Box>
                            <Heading size="md" mb={4}>
                                Available Rooms ({rooms.length})
                            </Heading>
                            
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
                                        No rooms available. Create one to start playing!
                                    </Text>
                                </Box>
                            ) : (
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                    {rooms.map((room) => (
                                        <Box
                                            key={room.roomId}
                                            bg="brandBlack.100"
                                            p={6}
                                            borderRadius="xl"
                                            borderWidth={2}
                                            borderColor="whiteAlpha.200"
                                            _hover={{
                                                borderColor: 'green.400',
                                                transform: 'translateY(-4px)',
                                            }}
                                            transition="all 0.3s"
                                        >
                                            <VStack align="stretch" spacing={4}>
                                                <HStack justify="space-between">
                                                    <HStack>
                                                        <Icon
                                                            as={room.roomType === ROOM_TYPES.PUBLIC ? FaGlobe : FaLock}
                                                            color={room.roomType === ROOM_TYPES.PUBLIC ? 'green.400' : 'orange.400'}
                                                        />
                                                        <Text fontWeight="bold" fontSize="lg">
                                                            Room #{room.roomId.slice(-6)}
                                                        </Text>
                                                    </HStack>
                                                    <Badge colorScheme="green">
                                                        {room.status}
                                                    </Badge>
                                                </HStack>

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
                                                    onClick={() => handleJoinRoom(room.roomId)}
                                                    isDisabled={room.currentPlayers >= room.maxPlayers}
                                                >
                                                    {room.currentPlayers >= room.maxPlayers ? 'Full' : 'Join Room'}
                                                </Button>
                                            </VStack>
                                        </Box>
                                    ))}
                                </SimpleGrid>
                            )}
                        </Box>
                    </VStack>
                </Box>
            </Box>

            <Modal isOpen={isOpen} onClose={onClose}>
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
                                    <option value={ROOM_TYPES.PUBLIC}>Public</option>
                                    <option value={ROOM_TYPES.PRIVATE}>Private</option>
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
        </Protect>
    );
};

export default Lobby;
