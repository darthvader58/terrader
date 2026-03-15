import { Box, HStack, VStack, Tooltip, IconButton } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaTrophy, FaGamepad, FaHeadset, FaQuestionCircle, FaCog } from "react-icons/fa";

const LeftNav = () => {
    const router = useRouter();
    const links = [
        { path: "/lobby", icon: FaGamepad, label: "Game Lobby" },
        { path: "/leaderboard", icon: FaTrophy, label: "Leaderboard" },
        { path: "/support", icon: FaHeadset, label: "Support" },
        { path: "/help", icon: FaQuestionCircle, label: "Help & Rules" },
        { path: "/settings", icon: FaCog, label: "Settings" },
    ];

    return (
        <Box
            position="fixed"
            bottom={{ base: 4, md: 6, lg: 8 }}
            left={{ base: "50%", lg: 8 }}
            transform={{ base: "translateX(-50%)", lg: "none" }}
            zIndex={10}
            bg="rgba(8, 14, 13, 0.8)"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            borderRadius="full"
            backdropFilter="blur(20px)"
            boxShadow="0 18px 40px rgba(0, 0, 0, 0.3)"
            px={{ base: 2, md: 3 }}
            py={2}
            maxW={{ base: "calc(100vw - 24px)", md: "auto" }}
        >
        <VStack
            display={{ base: "none", lg: "flex" }}
            spacing={4}
        >
            {links.map((link) => (
                <Link key={link.path} href={link.path}>
                    <Tooltip label={link.label} placement="right" hasArrow>
                        <IconButton
                            icon={<link.icon />}
                            aria-label={link.label}
                            size="lg"
                            bg={router.route === link.path ? "brandBlack.200" : "glass"}
                            color={router.route === link.path ? "green.400" : "white"}
                            _hover={{ 
                                bg: "brandBlack.100",
                                transform: "scale(1.1)"
                            }}
                            transition="all 0.2s"
                            backdropFilter="blur(10px)"
                            borderWidth={1}
                            borderColor="whiteAlpha.200"
                        />
                    </Tooltip>
                </Link>
            ))}
        </VStack>
        <HStack display={{ base: "flex", lg: "none" }} spacing={1}>
            {links.map((link) => (
                <Link key={link.path} href={link.path}>
                    <Tooltip label={link.label} placement="top" hasArrow>
                        <IconButton
                            icon={<link.icon />}
                            aria-label={link.label}
                            size="md"
                            borderRadius="full"
                            bg={router.route === link.path ? "brandBlack.200" : "transparent"}
                            color={router.route === link.path ? "green.400" : "white"}
                            _hover={{
                                bg: "brandBlack.100",
                            }}
                            transition="all 0.2s"
                        />
                    </Tooltip>
                </Link>
            ))}
        </HStack>
        </Box>
    );
};

export default LeftNav;
