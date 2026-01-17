import { Box, Flex, Text, HStack, VStack, IconButton, Badge } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import Image from "next/image";

const Nav = ({ user }) => {
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

            <HStack spacing={6}>
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
                        />
                    </HStack>
                </VStack>
                <Box
                    borderRadius="full"
                    overflow="hidden"
                    border="2px solid"
                    borderColor="green.400"
                >
                    <Image
                        src="/assets/avatar.svg"
                        alt="avatar"
                        width={70}
                        height={70}
                    />
                </Box>
            </HStack>
        </Flex>
    );
};

export default Nav;
