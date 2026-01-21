import Head from 'next/head';
import {
    Box,
    VStack,
    Heading,
    Text,
    Container,
} from '@chakra-ui/react';
import Protect from '@/components/Protect';
import Nav from '@/components/Nav';
import LeftNav from '@/components/LeftNav';

const Settings = () => {
    return (
        <Protect>
            <Head>
                <title>Settings - Terrader</title>
            </Head>

            <Box minH="100vh" p={8}>
                <Nav />
                <LeftNav />

                <Container maxW="container.md" mt={8}>
                    <VStack spacing={8} align="stretch">
                        <Box textAlign="center">
                            <Heading size="2xl" mb={2}>Settings</Heading>
                            <Text color="gray.400">
                                Coming soon! Game settings and preferences will be available here.
                            </Text>
                        </Box>

                        <Box
                            bg="brandBlack.100"
                            backdropFilter="blur(10px)"
                            p={12}
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="whiteAlpha.200"
                            textAlign="center"
                        >
                            <Text fontSize="xl" color="gray.500">
                                Settings page under construction
                            </Text>
                        </Box>
                    </VStack>
                </Container>
            </Box>
        </Protect>
    );
};

export default Settings;
