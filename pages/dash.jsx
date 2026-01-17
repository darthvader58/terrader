import LeftNav from "@/components/LeftNav";
import Nav from "@/components/Nav";
import { 
    Box, 
    Flex, 
    Text, 
    VStack, 
    HStack, 
    Button, 
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Badge,
    Heading,
    SimpleGrid,
    Icon,
} from "@chakra-ui/react";
import { TimeIcon, CheckCircleIcon, WarningIcon, StarIcon } from "@chakra-ui/icons";
import { FaPlay, FaTrophy } from "react-icons/fa";
import Link from "next/link";
import Protect from "@/components/Protect";
import { useAuth } from "@/contexts/AuthContext";

const Dash = () => {
    const { user } = useAuth();
    
    const games = [
        {
            ranking: "12/79",
            score: 450,
            profit: 125.50,
            ago: "2h",
            win: true,
        },
        {
            ranking: "56/79",
            score: 180,
            profit: -45.20,
            ago: "5h",
            win: false,
        },
        {
            ranking: "23/79",
            score: 320,
            profit: 89.30,
            ago: "1d",
            win: true,
        },
    ];

    const stats = [
        { label: "Total Games", value: user?.totalGames || "0", icon: FaPlay },
        { label: "Wins", value: user?.wins || "0", icon: FaTrophy },
        { label: "Carbon Score", value: user?.carbonScore || "0", icon: StarIcon },
        { label: "Best Rank", value: user?.highestRank || "N/A", icon: CheckCircleIcon },
    ];

    return (
        <Protect>
            <Box px={{ base: 6, md: 12, lg: 20 }} pt={10} minH="100vh">
                <Nav />
                <LeftNav />

                <Box mt={12} px={{ base: 4, md: 12, lg: 32 }}>
                    <VStack spacing={8} align="stretch">
                        <Box>
                            <Heading size="lg" mb={6}>
                                Your Statistics
                            </Heading>
                            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                                {stats.map((stat, i) => (
                                    <Box
                                        key={i}
                                        bg="glass"
                                        backdropFilter="blur(15px)"
                                        p={6}
                                        borderRadius="xl"
                                        borderWidth={2}
                                        borderColor="whiteAlpha.200"
                                        boxShadow="0 4px 16px rgba(0, 0, 0, 0.2)"
                                        _hover={{
                                            borderColor: "green.400",
                                            transform: "translateY(-4px)",
                                            boxShadow: "0 8px 24px rgba(28, 200, 128, 0.3)",
                                        }}
                                        transition="all 0.3s"
                                    >
                                        <Stat>
                                            <StatLabel fontSize="sm" color="gray.400">
                                                <HStack>
                                                    <Icon as={stat.icon} />
                                                    <Text>{stat.label}</Text>
                                                </HStack>
                                            </StatLabel>
                                            <StatNumber fontSize="3xl" mt={2}>
                                                {stat.value}
                                            </StatNumber>
                                        </Stat>
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </Box>

                        <Box>
                            <Heading size="lg" mb={6}>
                                Recent Games
                            </Heading>
                            <VStack spacing={4} align="stretch">
                                {games.map((game, i) => (
                                    <Flex
                                        key={i}
                                        bg="brandBlack.100"
                                        p={6}
                                        borderRadius="xl"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        borderWidth={2}
                                        borderColor={game.win ? "green.400" : "red.400"}
                                        _hover={{
                                            bg: "brandBlack.200",
                                            transform: "translateX(8px)",
                                        }}
                                        transition="all 0.3s"
                                        cursor="pointer"
                                    >
                                        <HStack spacing={6}>
                                            <Icon
                                                as={game.win ? CheckCircleIcon : WarningIcon}
                                                boxSize={8}
                                                color={game.win ? "green.400" : "red.400"}
                                            />
                                            <VStack align="start" spacing={1}>
                                                <Text fontWeight="bold" fontSize="lg">
                                                    Rank: {game.ranking}
                                                </Text>
                                                <HStack>
                                                    <Badge colorScheme={game.win ? "green" : "red"}>
                                                        {game.win ? "Victory" : "Defeat"}
                                                    </Badge>
                                                    <Text fontSize="sm" color="gray.400">
                                                        {game.ago} ago
                                                    </Text>
                                                </HStack>
                                            </VStack>
                                        </HStack>

                                        <HStack spacing={8}>
                                            <Stat textAlign="center">
                                                <StatLabel fontSize="sm">Carbon Score</StatLabel>
                                                <StatNumber color="green.400">
                                                    {game.score}
                                                </StatNumber>
                                            </Stat>
                                            <Stat textAlign="center">
                                                <StatLabel fontSize="sm">Profit</StatLabel>
                                                <StatNumber color={game.profit >= 0 ? "green.400" : "red.400"}>
                                                    ${game.profit.toFixed(2)}
                                                </StatNumber>
                                            </Stat>
                                        </HStack>
                                    </Flex>
                                ))}
                            </VStack>
                        </Box>

                        <Box
                            bg="glass"
                            backdropFilter="blur(15px)"
                            p={6}
                            borderRadius="xl"
                            borderWidth={2}
                            borderColor="blue.400"
                            boxShadow="0 8px 32px rgba(66, 153, 225, 0.2)"
                        >
                            <HStack justify="space-between">
                                <HStack>
                                    <TimeIcon color="blue.400" boxSize={6} />
                                    <VStack align="start" spacing={0}>
                                        <Text fontWeight="bold" fontSize="lg">
                                            Next Event
                                        </Text>
                                        <Text fontSize="sm" color="gray.400">
                                            Special Tournament
                                        </Text>
                                    </VStack>
                                </HStack>
                                <Badge colorScheme="blue" fontSize="lg" px={4} py={2}>
                                    Starting in 2h 15m
                                </Badge>
                            </HStack>
                        </Box>

                        <Link href="/lobby">
                            <Button
                                size="lg"
                                colorScheme="green"
                                w="100%"
                                h="80px"
                                fontSize="2xl"
                                leftIcon={<Icon as={FaPlay} />}
                                _hover={{
                                    transform: "scale(1.02)",
                                    boxShadow: "0 0 30px rgba(28, 200, 128, 0.4)",
                                }}
                                transition="all 0.3s"
                            >
                                Join Game Lobby
                            </Button>
                        </Link>

                        <Link href="/leaderboard">
                            <Button
                                size="lg"
                                colorScheme="blue"
                                variant="outline"
                                w="100%"
                                h="60px"
                                fontSize="xl"
                                leftIcon={<Icon as={FaTrophy} />}
                                _hover={{
                                    transform: "scale(1.02)",
                                    bg: "blue.900",
                                }}
                                transition="all 0.3s"
                            >
                                View Leaderboard
                            </Button>
                        </Link>
                    </VStack>
                </Box>
            </Box>
        </Protect>
    );
};

export default Dash;
