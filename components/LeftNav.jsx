import { Box, VStack, Tooltip, IconButton } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaTrophy, FaGamepad } from "react-icons/fa";

const LeftNav = () => {
    const router = useRouter();
    const links = [
        { path: "/lobby", icon: FaGamepad, label: "Game Lobby" },
        { path: "/leaderboard", icon: FaTrophy, label: "Leaderboard" },
    ];

    return (
        <VStack
            position="fixed"
            bottom={8}
            left={8}
            spacing={4}
            zIndex={10}
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
                        />
                    </Tooltip>
                </Link>
            ))}
        </VStack>
    );
};

export default LeftNav;
