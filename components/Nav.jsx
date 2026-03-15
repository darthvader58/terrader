import { Box, Flex, Text, HStack, VStack, IconButton, Badge, Menu, MenuButton, MenuList, MenuItem, Image as ChakraImage } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FaSignOutAlt } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";

const Nav = () => {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <Flex
            w="100%"
            justifyContent="space-between"
            alignItems="center"
            direction={{ base: "column", md: "row" }}
            gap={{ base: 4, md: 6 }}
            mb={{ base: 4, md: 6 }}
            p={{ base: 4, md: 5 }}
            bg="rgba(10, 17, 16, 0.68)"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            borderRadius={{ base: "2xl", md: "24px" }}
            backdropFilter="blur(18px)"
            boxShadow="0 20px 45px rgba(0, 0, 0, 0.22)"
        >
            <HStack spacing={{ base: 3, md: 4 }} w={{ base: "100%", md: "auto" }}>
                <Box 
                    cursor="pointer" 
                    onClick={() => router.push('/')}
                    _hover={{ opacity: 0.8 }}
                    transition="opacity 0.2s"
                    flexShrink={0}
                >
                    <Image
                        src="/assets/logo.svg"
                        width={64}
                        height={64}
                        alt="Logo"
                    />
                </Box>
                <VStack align="start" spacing={0} flex={1}>
                    <Text
                        fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
                        lineHeight={1}
                        fontWeight="900"
                        letterSpacing="0.08em"
                        sx={{
                            "-webkit-text-stroke-width": "1.5px",
                            "-webkit-text-stroke-color": "white",
                            color: "rgba(0, 0, 0, 0)",
                        }}
                        cursor="pointer"
                        onClick={() => router.push('/')}
                        _hover={{ opacity: 0.8 }}
                        transition="opacity 0.2s"
                    >
                        terrader
                    </Text>
                    <Text fontSize={{ base: "xs", md: "sm" }} color="gray.300">
                        Carbon-conscious trading arena
                    </Text>
                </VStack>
            </HStack>

            <HStack
                spacing={{ base: 3, md: 4 }}
                w={{ base: "100%", md: "auto" }}
                justify={{ base: "space-between", md: "flex-end" }}
                align="center"
                flexWrap="wrap"
            >
                <VStack align={{ base: "start", md: "flex-end" }} spacing={1} flex={1}>
                    <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }} noOfLines={1}>
                        {user?.username || 'Player'}
                    </Text>
                    <Badge colorScheme="green" fontSize="sm" px={2}>
                        Level {user?.level || 1}
                    </Badge>
                    <HStack spacing={2} mt={1} flexWrap="wrap">
                        <ChakraImage
                            src="/assets/carbon_credits.svg"
                            alt="Credits"
                            w="20px"
                            h="20px"
                        />
                        <Text fontSize="md" fontWeight="medium">
                            {user?.carbonCredits || 0}
                        </Text>
                        <IconButton
                            icon={<AddIcon />}
                            size="xs"
                            colorScheme="green"
                            variant="ghost"
                            aria-label="Buy credits"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push('/buy-credits');
                            }}
                        />
                    </HStack>
                </VStack>
                <Box
                    borderRadius="full"
                    overflow="hidden"
                    border="2px solid"
                    borderColor="green.400"
                    w={{ base: "54px", md: "64px" }}
                    h={{ base: "54px", md: "64px" }}
                    cursor="pointer"
                    onClick={() => router.push('/profile')}
                    _hover={{ 
                        borderColor: "green.300",
                        transform: "scale(1.05)"
                    }}
                    transition="all 0.2s"
                >
                    <ChakraImage
                        src={user?.photoURL || "/assets/avatar.svg"}
                        alt="avatar"
                        w="100%"
                        h="100%"
                        objectFit="cover"
                    />
                </Box>
                
                <Menu>
                    <MenuButton
                        as={IconButton}
                        icon={<FaSignOutAlt />}
                        variant="ghost"
                        colorScheme="red"
                        aria-label="Logout"
                    />
                    <MenuList bg="brandBlack.200" borderColor="green.400">
                        <MenuItem 
                            icon={<FaSignOutAlt />} 
                            onClick={handleLogout}
                            _hover={{ bg: "red.900" }}
                            color="red.300"
                        >
                            Logout
                        </MenuItem>
                    </MenuList>
                </Menu>
            </HStack>
        </Flex>
    );
};

export default Nav;
