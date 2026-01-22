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
import { ViewIcon, ViewOffIcon, CheckIcon } from "@chakra-ui/icons";
import { FaGoogle } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

const SignUp = () => {
    const { user, signUpWithEmail, signInWithGoogle, loading } = useAuth();
    const router = useRouter();
    const toast = useToast();
    
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user && !loading) {
            router.push('/lobby');
        }
    }, [user, loading, router]);

    const validateForm = () => {
        const newErrors = {};
        
        if (formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        }
        
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }
        
        if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        const result = await signUpWithEmail(
            formData.email,
            formData.password,
            formData.username
        );
        
        if (result.success) {
            toast({
                title: "Account created!",
                description: "Welcome to Terrader",
                status: "success",
                duration: 3000,
            });
            router.push('/lobby');
        } else {
            toast({
                title: "Sign-up failed",
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
                title: "Welcome to Terrader!",
                status: "success",
                duration: 3000,
            });
            router.push('/lobby');
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
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: null,
            });
        }
    };

    if (loading) {
        return null;
    }

    return (
        <Box minH="100vh" py={20}>
            <Head>
                <title>Sign Up - Terrader</title>
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
                        <Text color="gray.400">Create your account</Text>
                    </VStack>

                    <Box
                        w="100%"
                        bg="glass"
                        backdropFilter="blur(20px)"
                        p={8}
                        borderRadius="xl"
                        borderWidth={2}
                        borderColor="whiteAlpha.200"
                        boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
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
                                Sign up with Google
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
                                    <FormControl isInvalid={errors.username}>
                                        <FormLabel>Username</FormLabel>
                                        <InputGroup>
                                            <Input
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                placeholder="Enter username"
                                                bg="brandBlack.200"
                                                borderWidth={2}
                                                _focus={{
                                                    borderColor: "green.400"
                                                }}
                                            />
                                            {formData.username.length >= 3 && (
                                                <InputRightElement>
                                                    <CheckIcon color="green.400" />
                                                </InputRightElement>
                                            )}
                                        </InputGroup>
                                        {errors.username && (
                                            <Text color="red.400" fontSize="sm" mt={1}>
                                                {errors.username}
                                            </Text>
                                        )}
                                    </FormControl>

                                    <FormControl isInvalid={errors.email}>
                                        <FormLabel>Email</FormLabel>
                                        <InputGroup>
                                            <Input
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Enter email"
                                                bg="brandBlack.200"
                                                borderWidth={2}
                                                _focus={{
                                                    borderColor: "green.400"
                                                }}
                                            />
                                            {/\S+@\S+\.\S+/.test(formData.email) && (
                                                <InputRightElement>
                                                    <CheckIcon color="green.400" />
                                                </InputRightElement>
                                            )}
                                        </InputGroup>
                                        {errors.email && (
                                            <Text color="red.400" fontSize="sm" mt={1}>
                                                {errors.email}
                                            </Text>
                                        )}
                                    </FormControl>

                                    <FormControl isInvalid={errors.password}>
                                        <FormLabel>Password</FormLabel>
                                        <InputGroup>
                                            <Input
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Enter password"
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
                                        {errors.password && (
                                            <Text color="red.400" fontSize="sm" mt={1}>
                                                {errors.password}
                                            </Text>
                                        )}
                                    </FormControl>

                                    <FormControl isInvalid={errors.confirmPassword}>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <InputGroup>
                                            <Input
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Confirm password"
                                                bg="brandBlack.200"
                                                borderWidth={2}
                                                _focus={{
                                                    borderColor: "green.400"
                                                }}
                                            />
                                            <InputRightElement>
                                                <IconButton
                                                    icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    variant="ghost"
                                                    size="sm"
                                                    aria-label="Toggle password visibility"
                                                />
                                            </InputRightElement>
                                        </InputGroup>
                                        {errors.confirmPassword && (
                                            <Text color="red.400" fontSize="sm" mt={1}>
                                                {errors.confirmPassword}
                                            </Text>
                                        )}
                                    </FormControl>

                                    <Button
                                        type="submit"
                                        colorScheme="green"
                                        size="lg"
                                        w="100%"
                                        isLoading={isLoading}
                                        mt={4}
                                    >
                                        Create Account
                                    </Button>
                                </VStack>
                            </form>
                        </VStack>
                    </Box>

                    <HStack>
                        <Text color="gray.400">Already have an account?</Text>
                        <Link href="/login">
                            <Text
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
            </Container>
        </Box>
    );
};

export default SignUp;
