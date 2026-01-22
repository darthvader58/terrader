import Head from 'next/head';
import {
    Box,
    VStack,
    Heading,
    Text,
    Container,
    Icon,
} from '@chakra-ui/react';
import { FaHammer } from 'react-icons/fa';
import Protect from '@/components/Protect';
import Nav from '@/components/Nav';
import LeftNav from '@/components/LeftNav';

const BuyCredits = () => {
    return (
        <Protect>
            <Head>
                <title>Buy Credits - Terrader</title>
            </Head>

            <Box minH="100vh" p={8}>
                <Nav />
                <LeftNav />

                <Container maxW="container.md" mt={8}>
                    <VStack spacing={8} align="stretch">
                        <Box textAlign="center">
                            <Heading size="2xl" mb={2}>Buy Carbon Credits</Heading>
                            <Text color="gray.400" fontSize="lg">
                                Purchase credits with real money to enhance your gameplay
                            </Text>
                        </Box>

                        <Box
                            bg="brandBlack.100"
                            backdropFilter="blur(10px)"
                            p={12}
                            borderRadius="xl"
                            border="2px solid"
                            borderColor="yellow.400"
                            textAlign="center"
                        >
                            <VStack spacing={6}>
                                <Icon as={FaHammer} boxSize={20} color="yellow.400" />
                                <Heading size="xl" color="yellow.300">
                                    Coming Soon!
                                </Heading>
                                <Text fontSize="lg" color="gray.300" maxW="md">
                                    We&apos;re working on implementing a secure payment system to allow you to purchase carbon credits with real money.
                                </Text>
                                <Box
                                    bg="blue.900"
                                    p={6}
                                    borderRadius="md"
                                    maxW="lg"
                                >
                                    <Text fontSize="md" color="gray.200">
                                        For now, you can earn credits by:
                                    </Text>
                                    <VStack spacing={2} mt={4} align="start">
                                        <Text fontSize="sm" color="gray.300">
                                            • Playing and completing games
                                        </Text>
                                        <Text fontSize="sm" color="gray.300">
                                            • Achieving high carbon scores
                                        </Text>
                                        <Text fontSize="sm" color="gray.300">
                                            • Ranking in top positions
                                        </Text>
                                        <Text fontSize="sm" color="gray.300">
                                            • Making profitable trades
                                        </Text>
                                    </VStack>
                                </Box>
                                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                                    This feature is under construction and will be available in a future update.
                                </Text>
                            </VStack>
                        </Box>
                    </VStack>
                </Container>
            </Box>
        </Protect>
    );
};

export default BuyCredits;
