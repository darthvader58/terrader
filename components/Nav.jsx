import { Box, Flex, Text, HStack, VStack, IconButton, Badge, Button, Menu, MenuButton, MenuList, MenuItem, MenuDivider, Image as ChakraImage } from "@chakra-ui/react";
import { AddIcon, SettingsIcon } from "@chakra-ui/icons";
import { FaUser, FaQuestionCircle, FaSignOutAlt } from "react-icons/fa";
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
                <Image
                    src="/assets/logo.svg"
                    width={80}
                    height={80}
                    alt="Logo"
                />
                <Text
                    fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
                    fontWeight="900"
                    sx={{
                        "-webkit-text-stroke-width": "2px",
                        "-webkit-text-stroke-color": "white",
                        color: "rgba(0, 0, 0, 0)",
                    }}
                >
                    terrader
                </Text>
            </HStack>

            <HStack spacing={4}>
                <IconButton
                    icon={<FaQuestionCircle />}
                    aria-label="Support"
                    variant="ghost"
                    colorScheme="green"
                    size="lg"
                    onClick={() => router.push('/support')}
                />
                
                <Menu>
                    <MenuButton>
                        <HStack spacing={3} cursor="pointer" _hover={{ opacity: 0.8 }}>
                            <VStack align="flex-end" spacing={1}>
                                <Text fontWeight="bold" fontSize="lg">
                                    {user?.username || 'Player'}
                                </Text>
                                <Badge colorScheme="green" fontSize="sm" px={2}>
                                    Level {user?.level || 1}
                                </Badge>
                                <HStack spacing={2} mt={1}>
                                    <Text fontSize="md" fontWeight="medium">
                                        {user?.carbonCredits || 0} Credits
                                    </Text>
                                    <IconButton
                                        icon={<AddIcon />}
                                        size="xs"
                                        colorScheme="green"
                                        variant="ghost"
                                        aria-label="Add credits"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push('/profile');
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
                            >
                                <ChakraImage
                                    src={user?.photoURL || "/assets/avatar.svg"}
                                    alt="avatar"
                                    w="70px"
                                    h="70px"
                                    objectFit="cover"
                                />
                            </Box>
                        </HStack>
                    </MenuButton>
                    <MenuList bg="brandBlack.200" borderColor="green.400">
                        <MenuItem 
                            icon={<FaUser />} 
                            onClick={() => router.push('/profile')}
                            _hover={{ bg: "brandBlack.100" }}
                        >
                            Profile
                        </MenuItem>
                        <MenuItem 
                            icon={<SettingsIcon />} 
                            onClick={() => router.push('/settings')}
                            _hover={{ bg: "brandBlack.100" }}
                        >
                            Settings
                        </MenuItem>
                        <MenuDivider />
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
