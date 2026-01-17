import { useAuth } from "@/contexts/AuthContext";
import {
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Heading,
    Text,
    HStack,
    InputGroup,
    InputRightElement,
    IconButton,
    useToast,
    Divider,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { FaGoogle } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

const Login = () => {
    const { user, signInWithEmail, signInWithGoogle, loading } = useAuth();
    const router = useRouter();
    const toast = useToast();
    
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user && !loading) {
            router.push('/dash');
        }
    }, [user, loading, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setIsLoading(true);
        const result = await signInWithEmail(formData.email, formData.password);
        
        if (result.success) {
            toast({
                title: "Welcome back!",
                status: "success",
                duration: 3000,
            });
            router.push('/dash');
        } else {
            toast({
                title: "Login failed",
                description: result.error,
                status: "error",
                duration: 3000,
            });
        }
        setIsLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        const result = await signInWithGoogle();
        
        if (result.success) {
            toast({
                title: "Welcome back!",
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (loading) {
        return null;
    }

    return (
        <Box minH="100vh" bgGradient="linear(to-br, brandBlack.200, #1a1a1a)" py={20}>
            <Head>
                <title>Login - Terrader</title>
            </Head>
            
            <Container maxW="md">
                <VStack spacing={8}>
                    <VStack spacing={4}>
                        <Link href="/">
                            <Image
                                src="/assets/logo.svg"
                                width={80}
                                height={80}
                                alt="Terrader Logo"
                                style={{ cursor: 'pointer' }}
                            />
                        </Link>
                        <Heading
                            fontSize="4xl"
                            fontWeight="900"
                            sx={{
                                "-webkit-text-stroke-width": "2px",
                                "-webkit-text-stroke-color": "white",
                                color: "rgba(0, 0, 0, 0)",
                            }}
                        >
                            TERRADER
                        </Heading>
                        <Text color="gray.400">Log in to your account</Text>
                    </VStack>

                    <Box
                        w="100%"
                        bg="glass"
                        p={8}
                        borderRadius="xl"
                        borderWidth={2}
                        borderColor="whiteAlpha.200"
                    >
                        <VStack spacing={6}>
                            <Button
                                leftIcon={<FaGoogle />}
                                w="100%"
                                size="lg"
                                colorScheme="red"
                                onClick={handleGoogleSignIn}
                                isLoading={isLoading}
                            >
                                Sign in with Google
                            </Button>

                            <HStack w="100%">
                                <Divider />
                                <Text fontSize="sm" color="gray.400" px={2}>
                                    OR
                                </Text>
                                <Divider />
                            </HStack>

                            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                                <VStack spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel>Email</FormLabel>
                                        <Input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email"
                                            bg="brandBlack.200"
                                            borderWidth={2}
                                            _focus={{
                                                borderColor: "green.400"
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel>Password</FormLabel>
                                        <InputGroup>
                                            <Input
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Enter your password"
                                                bg="brandBlack.200"
                                                borderWidth={2}
                                                _focus={{
                                                    borderColor: "green.400"
                                                }}
                                            />
                                            <InputRightElement>
                                                <IconButton
                                                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    variant="ghost"
                                                    size="sm"
                                                    aria-label="Toggle password visibility"
                                                />
                                            </InputRightElement>
                                        </InputGroup>
                                    </FormControl>

                                    <Button
                                        type="submit"
                                        colorScheme="green"
                                        size="lg"
                                        w="100%"
                                        isLoading={isLoading}
                                        mt={4}
                                    >
                                        Log In
                                    </Button>
                                </VStack>
                            </form>
                        </VStack>
                    </Box>

                    <HStack>
                        <Text color="gray.400">Don&apos;t have an account?</Text>
                        <Link href="/signup">
                            <Text
                                color="green.400"
                                fontWeight="bold"
                                cursor="pointer"
                                _hover={{ textDecoration: "underline" }}
                            >
                                Sign up
                            </Text>
                        </Link>
                    </HStack>
                </VStack>
            </Container>
        </Box>
    );
};

export default Login;
