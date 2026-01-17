import { useState, useEffect } from 'react';
import Head from 'next/head';
import {
    Box,
    VStack,
    HStack,
    Heading,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Avatar,
    Icon,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Spinner,
    Center,
} from '@chakra-ui/react';
import { FaTrophy, FaMedal, FaAward } from 'react-icons/fa';
import Protect from '@/components/Protect';
import Nav from '@/components/Nav';
import LeftNav from '@/components/LeftNav';
import { useAuth } from '@/contexts/AuthContext';
import { getGlobalLeaderboard } from '@/utils/gameRoom';

const Leaderboard = () => {
    const { user } = useAuth();
    const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            const leaderboard = await getGlobalLeaderboard(100);
            setGlobalLeaderboard(leaderboard);
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Icon as={FaTrophy} color="yellow.400" boxSize={6} />;
            case 2:
                return <Icon as={FaMedal} color="gray.300" boxSize={6} />;
            case 3:
                return <Icon as={FaMedal} color="orange.400" boxSize={6} />;
            default:
                return null;
        }
    };

    const getRankBadge = (rank) => {
        if (rank <= 3) return 'gold';
        if (rank <= 10) return 'purple';
        if (rank <= 50) return 'blue';
        return 'gray';
    };

    return (
        <Protect>
            <Head>
                <title>Leaderboard - Terrader</title>
            </Head>
            
            <Box px={{ base: 6, md: 12, lg: 20 }} pt={10} minH="100vh">
                <Nav />
                <LeftNav />

                <Box mt={12} px={{ base: 4, md: 12, lg: 32 }}>
                    <VStack spacing={8} align="stretch">
                        <HStack justify="space-between">
                            <Heading size="xl">Global Leaderboard</Heading>
                            <Icon as={FaTrophy} color="yellow.400" boxSize={10} />
                        </HStack>

                        <Box
                            bg="glass"
                            backdropFilter="blur(15px)"
                            p={6}
                            borderRadius="xl"
                            borderWidth={2}
                            borderColor="yellow.400"
                            boxShadow="0 8px 32px rgba(236, 201, 75, 0.2)"
                        >
                            <Text fontSize="lg" textAlign="center" color="gray.300">
                                Compete with players worldwide! Rankings based on total carbon score.
                            </Text>
                        </Box>

                        <Tabs colorScheme="green" variant="enclosed">
                            <TabList>
                                <Tab>Top 100</Tab>
                                <Tab>Your Rank</Tab>
                            </TabList>

                            <TabPanels>
                                <TabPanel px={0}>
                                    {loading ? (
                                        <Center py={20}>
                                            <Spinner size="xl" color="green.400" />
                                        </Center>
                                    ) : (
                                        <Box
                                            bg="brandBlack.100"
                                            backdropFilter="blur(10px)"
                                            borderRadius="xl"
                                            overflow="hidden"
                                            boxShadow="0 4px 16px rgba(0, 0, 0, 0.3)"
                                        >
                                            <Table variant="simple">
                                                <Thead bg="brandBlack.200">
                                                    <Tr>
                                                        <Th color="gray.400">Rank</Th>
                                                        <Th color="gray.400">Player</Th>
                                                        <Th color="gray.400" isNumeric>Level</Th>
                                                        <Th color="gray.400" isNumeric>Carbon Score</Th>
                                                        <Th color="gray.400" isNumeric>Games</Th>
                                                        <Th color="gray.400" isNumeric>Wins</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {globalLeaderboard.map((player) => (
                                                        <Tr
                                                            key={player.userId}
                                                            bg={player.userId === user?.uid ? 'green.900' : 'transparent'}
                                                            _hover={{ bg: 'brandBlack.200' }}
                                                        >
                                                            <Td>
                                                                <HStack>
                                                                    {getRankIcon(player.rank)}
                                                                    <Badge
                                                                        colorScheme={getRankBadge(player.rank)}
                                                                        fontSize="md"
                                                                        px={3}
                                                                        py={1}
                                                                    >
                                                                        #{player.rank}
                                                                    </Badge>
                                                                </HStack>
                                                            </Td>
                                                            <Td>
                                                                <HStack>
                                                                    <Avatar
                                                                        size="sm"
                                                                        name={player.username}
                                                                        src={player.photoURL}
                                                                    />
                                                                    <VStack align="start" spacing={0}>
                                                                        <Text fontWeight="bold">
                                                                            {player.username}
                                                                        </Text>
                                                                        {player.userId === user?.uid && (
                                                                            <Badge colorScheme="green" fontSize="xs">
                                                                                You
                                                                            </Badge>
                                                                        )}
                                                                    </VStack>
                                                                </HStack>
                                                            </Td>
                                                            <Td isNumeric>
                                                                <Badge colorScheme="purple">
                                                                    {player.level || 1}
                                                                </Badge>
                                                            </Td>
                                                            <Td isNumeric>
                                                                <Text fontWeight="bold" color="green.400">
                                                                    {player.carbonScore || 0}
                                                                </Text>
                                                            </Td>
                                                            <Td isNumeric>{player.totalGames || 0}</Td>
                                                            <Td isNumeric>
                                                                <Text color="yellow.400" fontWeight="bold">
                                                                    {player.wins || 0}
                                                                </Text>
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        </Box>
                                    )}
                                </TabPanel>

                                <TabPanel>
                                    <Box
                                        bg="brandBlack.100"
                                        p={8}
                                        borderRadius="xl"
                                        textAlign="center"
                                    >
                                        {user && (
                                            <VStack spacing={6}>
                                                <Avatar
                                                    size="2xl"
                                                    name={user.username}
                                                    src={user.photoURL}
                                                />
                                                <Heading size="lg">{user.username}</Heading>
                                                
                                                <HStack spacing={8}>
                                                    <VStack>
                                                        <Text fontSize="sm" color="gray.400">
                                                            Your Rank
                                                        </Text>
                                                        <Text fontSize="3xl" fontWeight="bold" color="green.400">
                                                            {globalLeaderboard.findIndex(p => p.userId === user.uid) + 1 || 'N/A'}
                                                        </Text>
                                                    </VStack>
                                                    <VStack>
                                                        <Text fontSize="sm" color="gray.400">
                                                            Carbon Score
                                                        </Text>
                                                        <Text fontSize="3xl" fontWeight="bold">
                                                            {user.carbonScore || 0}
                                                        </Text>
                                                    </VStack>
                                                    <VStack>
                                                        <Text fontSize="sm" color="gray.400">
                                                            Win Rate
                                                        </Text>
                                                        <Text fontSize="3xl" fontWeight="bold" color="yellow.400">
                                                            {user.totalGames > 0 
                                                                ? Math.round((user.wins / user.totalGames) * 100) 
                                                                : 0}%
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                            </VStack>
                                        )}
                                    </Box>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </VStack>
                </Box>
            </Box>
        </Protect>
    );
};

export default Leaderboard;
