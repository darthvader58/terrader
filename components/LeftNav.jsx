import { Box, VStack, Tooltip, IconButton } from "@chakra-ui/react";
import { SettingsIcon, QuestionIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaUsers, FaHeadset } from "react-icons/fa";

const LeftNav = () => {
    const router = useRouter();
    const links = [
        { path: "/friends", icon: FaUsers, label: "Friends" },
        { path: "/", icon: QuestionIcon, label: "Help" },
        { path: "/support", icon: FaHeadset, label: "Support" },
        { path: "/profile", icon: SettingsIcon, label: "Settings" },
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
                            icon={typeof link.icon === 'function' ? <link.icon /> : link.icon}
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
