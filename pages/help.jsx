import Head from 'next/head';
import {
    Box,
    VStack,
    Heading,
    Text,
    Container,
    Divider,
    List,
    ListItem,
    ListIcon,
    SimpleGrid,
    Badge,
    HStack,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, InfoIcon, StarIcon } from '@chakra-ui/icons';
import Protect from '@/components/Protect';
import Nav from '@/components/Nav';
import LeftNav from '@/components/LeftNav';

const Help = () => {
    return (
        <Protect>
            <Head>
                <title>Help & Rules - Terrader</title>
            </Head>

            <Box minH="100vh" p={8}>
                <Nav />
                <LeftNav />

                <Container maxW="container.lg" mt={8}>
                    <VStack spacing={8} align="stretch">
                        <Box textAlign="center">
                            <Heading size="2xl" mb={2}>Game Rules & Guide</Heading>
                            <Text color="gray.400" fontSize="lg">
                                Everything you need to know to master Terrader
                            </Text>
                        </Box>

                        <Box
                            bg="brandBlack.100"
                            backdropFilter="blur(10px)"
                            p={8}
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="whiteAlpha.200"
                        >
                            <VStack spacing={6} align="stretch">
                                <Box>
                                    <Heading size="lg" mb={4} color="green.400">Game Objective</Heading>
                                    <Text color="gray.300" fontSize="md" lineHeight="tall">
                                        Terrader is a multiplayer cryptocurrency trading simulation game focused on environmental awareness. 
                                        Your goal is to maximize your carbon score while trading strategically. The player with the highest 
                                        carbon score at the end of the match wins, not necessarily the one with the most profit.
                                    </Text>
                                </Box>

                                <Divider />

                                <Box>
                                    <Heading size="lg" mb={4} color="green.400">Game Setup</Heading>
                                    <List spacing={3}>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={CheckCircleIcon} color="green.400" mt={1} />
                                            <Text color="gray.300">
                                                <Text as="span" fontWeight="bold">Starting Balance:</Text> Each player begins with $500 virtual currency
                                            </Text>
                                        </ListItem>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={CheckCircleIcon} color="green.400" mt={1} />
                                            <Text color="gray.300">
                                                <Text as="span" fontWeight="bold">Game Duration:</Text> 20 minutes per match
                                            </Text>
                                        </ListItem>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={CheckCircleIcon} color="green.400" mt={1} />
                                            <Text color="gray.300">
                                                <Text as="span" fontWeight="bold">Starting Credits:</Text> New players receive 100 carbon credits
                                            </Text>
                                        </ListItem>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={CheckCircleIcon} color="green.400" mt={1} />
                                            <Text color="gray.300">
                                                <Text as="span" fontWeight="bold">Initial Carbon Footprint:</Text> Starts at 0 (lower is better)
                                            </Text>
                                        </ListItem>
                                    </List>
                                </Box>

                                <Divider />

                                <Box>
                                    <Heading size="lg" mb={4} color="green.400">Cryptocurrencies</Heading>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <Box p={4} bg="brandBlack.200" borderRadius="md">
                                            <HStack mb={2}>
                                                <Badge colorScheme="green">TRC</Badge>
                                                <Text fontWeight="bold">TerraCoin</Text>
                                            </HStack>
                                            <Text fontSize="sm" color="gray.400">Price Range: $80-100</Text>
                                            <Text fontSize="sm" color="gray.400">Carbon Multiplier: 1.2x</Text>
                                        </Box>
                                        <Box p={4} bg="brandBlack.200" borderRadius="md">
                                            <HStack mb={2}>
                                                <Badge colorScheme="blue">GIA</Badge>
                                                <Text fontWeight="bold">Gaiacoin</Text>
                                            </HStack>
                                            <Text fontSize="sm" color="gray.400">Price Range: $60-80</Text>
                                            <Text fontSize="sm" color="gray.400">Carbon Multiplier: 1.0x</Text>
                                        </Box>
                                        <Box p={4} bg="brandBlack.200" borderRadius="md">
                                            <HStack mb={2}>
                                                <Badge colorScheme="purple">ENV</Badge>
                                                <Text fontWeight="bold">Envirocoin</Text>
                                            </HStack>
                                            <Text fontSize="sm" color="gray.400">Price Range: $40-60</Text>
                                            <Text fontSize="sm" color="gray.400">Carbon Multiplier: 0.8x</Text>
                                        </Box>
                                        <Box p={4} bg="brandBlack.200" borderRadius="md">
                                            <HStack mb={2}>
                                                <Badge colorScheme="orange">DHR</Badge>
                                                <Text fontWeight="bold">DharaCoin</Text>
                                            </HStack>
                                            <Text fontSize="sm" color="gray.400">Price Range: $20-40</Text>
                                            <Text fontSize="sm" color="gray.400">Carbon Multiplier: 0.9x</Text>
                                        </Box>
                                    </SimpleGrid>
                                </Box>

                                <Divider />

                                <Box>
                                    <Heading size="lg" mb={4} color="green.400">Trading Mechanics</Heading>
                                    <List spacing={3}>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={InfoIcon} color="blue.400" mt={1} />
                                            <Text color="gray.300">
                                                <Text as="span" fontWeight="bold">Quantity Precision:</Text> You can trade up to 3 decimal places (e.g., 1.250 coins)
                                            </Text>
                                        </ListItem>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={InfoIcon} color="blue.400" mt={1} />
                                            <Text color="gray.300">
                                                <Text as="span" fontWeight="bold">Price Updates:</Text> Prices update every 2 seconds based on market trends and news
                                            </Text>
                                        </ListItem>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={InfoIcon} color="blue.400" mt={1} />
                                            <Text color="gray.300">
                                                <Text as="span" fontWeight="bold">Market News:</Text> AI-generated news appears every 30-40 seconds, affecting prices by up to 60%
                                            </Text>
                                        </ListItem>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={InfoIcon} color="blue.400" mt={1} />
                                            <Text color="gray.300">
                                                <Text as="span" fontWeight="bold">Order Book:</Text> Shows real-time buy and sell orders from all players and bots
                                            </Text>
                                        </ListItem>
                                    </List>
                                </Box>

                                <Divider />

                                <Box>
                                    <Heading size="lg" mb={4} color="green.400">Scoring System</Heading>
                                    <VStack spacing={4} align="stretch">
                                        <Box>
                                            <Text fontWeight="bold" mb={2} color="white">Carbon Score</Text>
                                            <List spacing={2}>
                                                <ListItem display="flex" alignItems="flex-start">
                                                    <ListIcon as={StarIcon} color="yellow.400" mt={1} />
                                                    <Text color="gray.300" fontSize="sm">
                                                        Selling coins increases your carbon score (positive impact)
                                                    </Text>
                                                </ListItem>
                                                <ListItem display="flex" alignItems="flex-start">
                                                    <ListIcon as={StarIcon} color="yellow.400" mt={1} />
                                                    <Text color="gray.300" fontSize="sm">
                                                        Buying coins decreases your carbon score (negative impact)
                                                    </Text>
                                                </ListItem>
                                                <ListItem display="flex" alignItems="flex-start">
                                                    <ListIcon as={StarIcon} color="yellow.400" mt={1} />
                                                    <Text color="gray.300" fontSize="sm">
                                                        Each coin has a different carbon multiplier affecting your score
                                                    </Text>
                                                </ListItem>
                                            </List>
                                        </Box>

                                        <Box>
                                            <Text fontWeight="bold" mb={2} color="white">Carbon Footprint</Text>
                                            <List spacing={2}>
                                                <ListItem display="flex" alignItems="flex-start">
                                                    <ListIcon as={WarningIcon} color="orange.400" mt={1} />
                                                    <Text color="gray.300" fontSize="sm">
                                                        Scale: 0-30 (lower is better)
                                                    </Text>
                                                </ListItem>
                                                <ListItem display="flex" alignItems="flex-start">
                                                    <ListIcon as={WarningIcon} color="orange.400" mt={1} />
                                                    <Text color="gray.300" fontSize="sm">
                                                        0-5: Excellent (no penalty) | 5-15: Good (small penalty) | 15-20: Fair (medium penalty) | 20+: Bad (large penalty)
                                                    </Text>
                                                </ListItem>
                                                <ListItem display="flex" alignItems="flex-start">
                                                    <ListIcon as={WarningIcon} color="orange.400" mt={1} />
                                                    <Text color="gray.300" fontSize="sm">
                                                        Higher footprint reduces your carbon score each trade
                                                    </Text>
                                                </ListItem>
                                                <ListItem display="flex" alignItems="flex-start">
                                                    <ListIcon as={WarningIcon} color="orange.400" mt={1} />
                                                    <Text color="gray.300" fontSize="sm">
                                                        Holding coins reduces footprint over time
                                                    </Text>
                                                </ListItem>
                                            </List>
                                        </Box>
                                    </VStack>
                                </Box>

                                <Divider />

                                <Box>
                                    <Heading size="lg" mb={4} color="green.400">Room Types</Heading>
                                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                        <Box p={4} bg="brandBlack.200" borderRadius="md">
                                            <Badge colorScheme="green" mb={2}>PUBLIC</Badge>
                                            <Text fontSize="sm" color="gray.300">
                                                Visible in lobby listings. Anyone can join. Great for casual play.
                                            </Text>
                                        </Box>
                                        <Box p={4} bg="brandBlack.200" borderRadius="md">
                                            <Badge colorScheme="purple" mb={2}>PRIVATE</Badge>
                                            <Text fontSize="sm" color="gray.300">
                                                Requires 6-character invite code. Perfect for playing with friends. Expires in 24 hours.
                                            </Text>
                                        </Box>
                                        <Box p={4} bg="brandBlack.200" borderRadius="md">
                                            <Badge colorScheme="blue" mb={2}>GLOBAL</Badge>
                                            <Text fontSize="sm" color="gray.300">
                                                Auto-creates and starts at 10 players. Competitive worldwide matches.
                                            </Text>
                                        </Box>
                                    </SimpleGrid>
                                </Box>

                                <Divider />

                                <Box>
                                    <Heading size="lg" mb={4} color="green.400">Power-Ups</Heading>
                                    <Text color="gray.300" mb={4}>
                                        Purchase power-ups from your profile using carbon credits. Use them strategically during gameplay.
                                    </Text>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <Box p={4} bg="brandBlack.200" borderRadius="md">
                                            <HStack mb={2}>
                                                <Badge colorScheme="green">10 Credits</Badge>
                                                <Text fontWeight="bold">Time Freeze</Text>
                                            </HStack>
                                            <Text fontSize="sm" color="gray.400">Freeze prices for 30 seconds</Text>
                                        </Box>
                                        <Box p={4} bg="brandBlack.200" borderRadius="md">
                                            <HStack mb={2}>
                                                <Badge colorScheme="green">10 Credits</Badge>
                                                <Text fontWeight="bold">Price Insight</Text>
                                            </HStack>
                                            <Text fontSize="sm" color="gray.400">See next price movement trend for 1 minute</Text>
                                        </Box>
                                        <Box p={4} bg="brandBlack.200" borderRadius="md">
                                            <HStack mb={2}>
                                                <Badge colorScheme="blue">15 Credits</Badge>
                                                <Text fontWeight="bold">Carbon Multiplier</Text>
                                            </HStack>
                                            <Text fontSize="sm" color="gray.400">Double carbon score for 1 minute</Text>
                                        </Box>
                                        <Box p={4} bg="brandBlack.200" borderRadius="md">
                                            <HStack mb={2}>
                                                <Badge colorScheme="purple">25 Credits</Badge>
                                                <Text fontWeight="bold">Market Analysis</Text>
                                            </HStack>
                                            <Text fontSize="sm" color="gray.400">Get detailed market analysis for 90 seconds</Text>
                                        </Box>
                                    </SimpleGrid>
                                </Box>

                                <Divider />

                                <Box>
                                    <Heading size="lg" mb={4} color="green.400">Credits & Rewards</Heading>
                                    <List spacing={3}>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={CheckCircleIcon} color="green.400" mt={1} />
                                            <Text color="gray.300">
                                                <Text as="span" fontWeight="bold">1st Place:</Text> 100 base credits + bonuses
                                            </Text>
                                        </ListItem>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={CheckCircleIcon} color="green.400" mt={1} />
                                            <Text color="gray.300">
                                                <Text as="span" fontWeight="bold">2nd Place:</Text> 75 base credits + bonuses
                                            </Text>
                                        </ListItem>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={CheckCircleIcon} color="green.400" mt={1} />
                                            <Text color="gray.300">
                                                <Text as="span" fontWeight="bold">3rd Place:</Text> 50 base credits + bonuses
                                            </Text>
                                        </ListItem>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={CheckCircleIcon} color="green.400" mt={1} />
                                            <Text color="gray.300">
                                                <Text as="span" fontWeight="bold">Top Half:</Text> 30 base credits + bonuses
                                            </Text>
                                        </ListItem>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={CheckCircleIcon} color="green.400" mt={1} />
                                            <Text color="gray.300">
                                                <Text as="span" fontWeight="bold">Bonuses:</Text> Up to +50 for carbon score, +50 for profit
                                            </Text>
                                        </ListItem>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={WarningIcon} color="red.400" mt={1} />
                                            <Text color="gray.300">
                                                <Text as="span" fontWeight="bold">Leave Penalty:</Text> -100 credits if you leave mid-game
                                            </Text>
                                        </ListItem>
                                    </List>
                                </Box>

                                <Divider />

                                <Box>
                                    <Heading size="lg" mb={4} color="green.400">Strategy Tips</Heading>
                                    <List spacing={3}>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={InfoIcon} color="blue.400" mt={1} />
                                            <Text color="gray.300">
                                                Watch the news closely - it provides hints about price movements
                                            </Text>
                                        </ListItem>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={InfoIcon} color="blue.400" mt={1} />
                                            <Text color="gray.300">
                                                Balance trading frequency with carbon footprint management
                                            </Text>
                                        </ListItem>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={InfoIcon} color="blue.400" mt={1} />
                                            <Text color="gray.300">
                                                Use the order book and market depth to make informed decisions
                                            </Text>
                                        </ListItem>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={InfoIcon} color="blue.400" mt={1} />
                                            <Text color="gray.300">
                                                Selling is generally better for carbon score than buying
                                            </Text>
                                        </ListItem>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={InfoIcon} color="blue.400" mt={1} />
                                            <Text color="gray.300">
                                                Hold coins to reduce your carbon footprint over time
                                            </Text>
                                        </ListItem>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={InfoIcon} color="blue.400" mt={1} />
                                            <Text color="gray.300">
                                                Power-ups can give you a competitive edge at crucial moments
                                            </Text>
                                        </ListItem>
                                    </List>
                                </Box>

                                <Divider />

                                <Box bg="blue.900" p={6} borderRadius="md">
                                    <Heading size="md" mb={3} color="blue.200">Important Notes</Heading>
                                    <List spacing={2}>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={InfoIcon} color="blue.300" mt={1} />
                                            <Text color="gray.200" fontSize="sm">
                                                All currency and credits are virtual - no real money is involved
                                            </Text>
                                        </ListItem>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={InfoIcon} color="blue.300" mt={1} />
                                            <Text color="gray.200" fontSize="sm">
                                                The game is designed to raise awareness about cryptocurrency's environmental impact
                                            </Text>
                                        </ListItem>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={InfoIcon} color="blue.300" mt={1} />
                                            <Text color="gray.200" fontSize="sm">
                                                Bots trade intelligently to keep the market competitive
                                            </Text>
                                        </ListItem>
                                        <ListItem display="flex" alignItems="flex-start">
                                            <ListIcon as={InfoIcon} color="blue.300" mt={1} />
                                            <Text color="gray.200" fontSize="sm">
                                                Your game history and stats are saved to your profile
                                            </Text>
                                        </ListItem>
                                    </List>
                                </Box>
                            </VStack>
                        </Box>
                    </VStack>
                </Container>
            </Box>
        </Protect>
    );
};

export default Help;
