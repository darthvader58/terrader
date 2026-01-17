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
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Avatar,
    Icon,
    Spinner,
    Center,
} from '@chakra-ui/react';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import Protect from '@/components/Protect';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import db from '@/db';
import Link from 'next/link';

const Results = () => {
    const { user } = useAuth();
    const router = useRouter();
    const { roomId } = router.query;
    
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRank, setUserRank] = useState(null);

    useEffect(() => {
        if (!roomId) return;
        
        loadResults();
    }, [roomId]);

    const loadResults = async () => {
        try {
            const roomRef = doc(db, 'gameRooms', roomId);
            const roomSnap = await getDoc(roomRef);
            
            if (roomSnap.exists()) {
                const roomData = roomSnap.data();
                setResults(roomData.finalRankings || []);
                
                const rank = roomData.finalRankings?.find(p => p.userId === user?.uid);
                setUserRank(rank);
            }
        } catch (error) {
            console.error('Failed to load results:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Icon as={FaTrophy} color="yellow.400" boxSize={8} />;
            case 2:
                return <Icon as={FaMedal} color="gray.300" boxSize={8} />;
            case 3:
                return <Icon as={FaMedal} color="orange.400" boxSize={8} />;
            default:
                return null;
        }
    };

    const getRankColor = (rank) => {
        if (rank <= 3) return 'yellow.400';
        if (rank <= 10) return 'green.400';
        return 'gray.400';
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

    return (
        <Protect>
            <Head>
                <title>Game Results - Terrader</title>
            </Head>
            
            <Box minH="100vh" p={8}>
                <VStack spacing={8} maxW="1200px" mx="auto">
                    <Heading size="2xl">Game Results</Heading>

                    {userRank && (
                        <Box
                            w="100%"
                            bg={userRank.rank <= 3 ? 'green.900' : 'brandBlack.100'}
                            p={8}
                            borderRadius="xl"
                            borderWidth={3}
                            borderColor={getRankColor(userRank.rank)}
                        >
                            <VStack spacing={6}>
                                {getRankIcon(userRank.rank)}
                                <Heading size="xl" color={getRankColor(userRank.rank)}>
                                    {userRank.rank <= 3 ? 'Congratulations!' : 'Good Game!'}
                                </Heading>
                                <Text fontSize="2xl">
                                    You finished in <Text as="span" fontWeight="bold" color={getRankColor(userRank.rank)}>
                                        {userRank.rank}{userRank.rank === 1 ? 'st' : userRank.rank === 2 ? 'nd' : userRank.rank === 3 ? 'rd' : 'th'} place
                                    </Text>
                                </Text>
                                
                                <HStack spacing={12}>
                                    <VStack>
                                        <Text fontSize="sm" color="gray.400">
                                            Carbon Score
                                        </Text>
                                        <Text fontSize="3xl" fontWeight="bold" color="green.400">
                                            {userRank.carbonScore}
                                        </Text>
                                    </VStack>
                                    <VStack>
                                        <Text fontSize="sm" color="gray.400">
                                            Profit
                                        </Text>
                                        <Text fontSize="3xl" fontWeight="bold" color={userRank.profit >= 0 ? 'green.400' : 'red.400'}>
                                            ${userRank.profit?.toFixed(2)}
                                        </Text>
                                    </VStack>
                                    <VStack>
                                        <Text fontSize="sm" color="gray.400">
                                            Credits Earned
                                        </Text>
                                        <Text fontSize="3xl" fontWeight="bold" color="yellow.400">
                                            +{userRank.rank <= 3 ? 50 : 10}
                                        </Text>
                                    </VStack>
                                </HStack>
                            </VStack>
                        </Box>
                    )}

                    <Box w="100%">
                        <Heading size="lg" mb={4}>
                            Final Leaderboard
                        </Heading>
                        <Box
                            bg="brandBlack.100"
                            borderRadius="xl"
                            overflow="hidden"
                        >
                            <Table variant="simple">
                                <Thead bg="brandBlack.200">
                                    <Tr>
                                        <Th color="gray.400">Rank</Th>
                                        <Th color="gray.400">Player</Th>
                                        <Th color="gray.400" isNumeric>Carbon Score</Th>
                                        <Th color="gray.400" isNumeric>Profit</Th>
                                        <Th color="gray.400" isNumeric>Credits</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {results?.map((player) => (
                                        <Tr
                                            key={player.userId}
                                            bg={player.userId === user?.uid ? 'green.900' : 'transparent'}
                                            _hover={{ bg: 'brandBlack.200' }}
                                        >
                                            <Td>
                                                <HStack>
                                                    {getRankIcon(player.rank)}
                                                    <Badge
                                                        colorScheme={player.rank <= 3 ? 'yellow' : player.rank <= 10 ? 'green' : 'gray'}
                                                        fontSize="lg"
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
                                                        name={player.username || 'Player'}
                                                    />
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontWeight="bold">
                                                            Player {player.userId.slice(-6)}
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
                                                <Text fontWeight="bold" color="green.400" fontSize="lg">
                                                    {player.carbonScore}
                                                </Text>
                                            </Td>
                                            <Td isNumeric>
                                                <Text 
                                                    fontWeight="bold" 
                                                    color={player.profit >= 0 ? 'green.400' : 'red.400'}
                                                    fontSize="lg"
                                                >
                                                    ${player.profit?.toFixed(2)}
                                                </Text>
                                            </Td>
                                            <Td isNumeric>
                                                <Text fontWeight="bold" color="yellow.400" fontSize="lg">
                                                    +{player.rank <= 3 ? 50 : 10}
                                                </Text>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </Box>

                    <HStack spacing={4} w="100%">
                        <Link href="/lobby" style={{ flex: 1 }}>
                            <Button colorScheme="green" size="lg" w="100%">
                                Play Again
                            </Button>
                        </Link>
                        <Link href="/leaderboard" style={{ flex: 1 }}>
                            <Button
                                colorScheme="blue"
                                size="lg"
                                w="100%"
                                rightIcon={<ArrowForwardIcon />}
                            >
                                View Global Leaderboard
                            </Button>
                        </Link>
                    </HStack>
                </VStack>
            </Box>
        </Protect>
    );
};

export default Results;
