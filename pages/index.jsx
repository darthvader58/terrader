import { useAuth } from "@/contexts/AuthContext";
import {
    Box,
    Button,
    Flex,
    Heading,
    Text,
    VStack,
    HStack,
    Container,
    SimpleGrid,
    Icon,
    useToast,
    Image as ChakraImage,
} from "@chakra-ui/react";
import { FaGoogle, FaLeaf, FaChartLine, FaTrophy, FaUsers } from "react-icons/fa";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";

const Home = () => {
    const { user, signInWithGoogle, loading } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user && !loading) {
            router.push('/dash');
        }
    }, [user, loading, router]);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        const result = await signInWithGoogle();
        
        if (result.success) {
            toast({
                title: "Welcome to Terrader!",
                description: "Successfully signed in",
                status: "success",
                duration: 3000,
            });
            router.push('/dash');
        } else {
            toast({
                title: "Sign-in failed",
                description: result.error,
                status: "error",
                duration: 3000,
            });
        }
        setIsLoading(false);
    };

    const features = [
        {
            icon: FaLeaf,
            title: "Environmental Impact",
            description: "Learn about crypto mining's carbon footprint while trading"
        },
        {
            icon: FaChartLine,
            title: "Real-time Trading",
            description: "Trade 4 unique cryptocurrencies with dynamic market prices"
        },
        {
            icon: FaTrophy,
            title: "Competitive Gameplay",
            description: "Compete with players worldwide on the leaderboard"
        },
        {
            icon: FaUsers,
            title: "Multiplayer Rooms",
            description: "Join public games or create private rooms with friends"
        }
    ];

    if (loading) {
        return null;
    }

    return (
        <Box minH="100vh" position="relative" overflow="hidden">
            <Head>
                <title>Terrader - Crypto Trading Game for Environmental Awareness</title>
                <meta name="description" content="A multiplayer crypto trading game that raises awareness about environmental impact" />
            </Head>
            
            <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bgGradient="linear(to-br, brandBlack.200, #1a1a1a)"
                opacity={0.9}
            />
            
            <Container maxW="container.xl" position="relative" zIndex={1}>
                <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    minH="100vh"
                    py={20}
                >
                    <VStack spacing={12} w="100%">
                        <VStack spacing={6} textAlign="center">
                            <HStack spacing={4}>
                                <Image
                                    src="/assets/logo.svg"
                                    width={120}
                                    height={120}
                                    alt="Terrader Logo"
                                />
                            </HStack>
                            
                            <Heading
                                fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
                                fontWeight="900"
                                sx={{
                                    "-webkit-text-stroke-width": "2px",
                                    "-webkit-text-stroke-color": "white",
                                    color: "rgba(0, 0, 0, 0)",
                                }}
                            >
                                TERRADER
                            </Heading>
                            
                            <Text
                                fontSize={{ base: "lg", md: "xl" }}
                                color="gray.300"
                                maxW="2xl"
                            >
                                A multiplayer crypto trading game that raises awareness about 
                                environmental impact. Trade smart, reduce your carbon footprint, 
                                and compete globally.
                            </Text>
                        </VStack>

                        <VStack spacing={4} w="100%" maxW="md">
                            <Button
                                leftIcon={<FaGoogle />}
                                size="lg"
                                w="100%"
                                h="60px"
                                fontSize="xl"
                                colorScheme="red"
                                onClick={handleGoogleSignIn}
                                isLoading={isLoading}
                                _hover={{
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 8px 20px rgba(220, 38, 38, 0.4)",
                                }}
                                transition="all 0.3s"
                            >
                                Sign in with Google
                            </Button>
                            
                            <Link href="/signup" style={{ width: '100%' }}>
                                <Button
                                    size="lg"
                                    w="100%"
                                    h="60px"
                                    fontSize="xl"
                                    colorScheme="green"
                                    variant="outline"
                                    borderWidth={2}
                                    _hover={{
                                        bg: "green.400",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 8px 20px rgba(28, 200, 128, 0.4)",
                                    }}
                                    transition="all 0.3s"
                                >
                                    Sign up with Email
                                </Button>
                            </Link>

                            <HStack spacing={2} pt={2}>
                                <Text fontSize="sm" color="gray.400">
                                    Already have an account?
                                </Text>
                                <Link href="/login">
                                    <Text
                                        fontSize="sm"
                                        color="green.400"
                                        fontWeight="bold"
                                        cursor="pointer"
                                        _hover={{ textDecoration: "underline" }}
                                    >
                                        Log in
                                    </Text>
                                </Link>
                            </HStack>
                        </VStack>

                        <SimpleGrid
                            columns={{ base: 1, md: 2, lg: 4 }}
                            spacing={6}
                            w="100%"
                            pt={12}
                        >
                            {features.map((feature, i) => (
                                <Box
                                    key={i}
                                    bg="glass"
                                    p={6}
                                    borderRadius="xl"
                                    borderWidth={2}
                                    borderColor="whiteAlpha.200"
                                    _hover={{
                                        borderColor: "green.400",
                                        transform: "translateY(-8px)",
                                    }}
                                    transition="all 0.3s"
                                >
                                    <VStack spacing={4} align="start">
                                        <Icon
                                            as={feature.icon}
                                            boxSize={10}
                                            color="green.400"
                                        />
                                        <VStack align="start" spacing={2}>
                                            <Text fontWeight="bold" fontSize="lg">
                                                {feature.title}
                                            </Text>
                                            <Text fontSize="sm" color="gray.400">
                                                {feature.description}
                                            </Text>
                                        </VStack>
                                    </VStack>
                                </Box>
                            ))}
                        </SimpleGrid>

                        <Box
                            bg="glass"
                            p={8}
                            borderRadius="xl"
                            borderWidth={2}
                            borderColor="blue.400"
                            maxW="3xl"
                            w="100%"
                        >
                            <VStack spacing={4}>
                                <Heading size="md" color="blue.400">
                                    About the Game
                                </Heading>
                                <Text fontSize="sm" color="gray.300" textAlign="center">
                                    Terrader features 4 unique cryptocurrencies: TerraCoin, Gaiacoin, 
                                    Envirocoin, and DharaCoin. Start with $500 virtual currency and 
                                    compete in 15-minute matches. Your carbon score determines your 
                                    leaderboard position, encouraging sustainable trading practices.
                                </Text>
                            </VStack>
                        </Box>
                    </VStack>
                </Flex>
            </Container>
        </Box>
    );
};

export default Home;
