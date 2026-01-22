import { Box, Flex, Text, HStack, VStack, IconButton, Badge, Button, Menu, MenuButton, MenuList, MenuItem, MenuDivider, Image as ChakraImage } from "@chakra-ui/react";
import { AddIcon, SettingsIcon } from "@chakra-ui/icons";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
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
            mb={6}
        >
            <HStack spacing={4}>
                <Box 
                    cursor="pointer" 
                    onClick={() => router.push('/')}
                    _hover={{ opacity: 0.8 }}
                    transition="opacity 0.2s"
                >
                    <Image
                        src="/assets/logo.svg"
                        width={80}
                        height={80}
                        alt="Logo"
                    />
                </Box>
                <Text
                    fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
                    fontWeight="900"
                    sx={{
                        "-webkit-text-stroke-width": "2px",
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
            </HStack>

            <HStack spacing={4}>
                <VStack align="flex-end" spacing={1}>
                    <Text fontWeight="bold" fontSize="lg">
                        {user?.username || 'Player'}
                    </Text>
                    <Badge colorScheme="green" fontSize="sm" px={2}>
                        Level {user?.level || 1}
                    </Badge>
                    <HStack spacing={2} mt={1}>
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
                    w="70px"
                    h="70px"
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
                        w="70px"
                        h="70px"
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
