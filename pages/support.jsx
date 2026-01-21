import { useState } from 'react';
import Head from 'next/head';
import {
    Box,
    Button,
    VStack,
    Heading,
    Text,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    useToast,
    Container,
} from '@chakra-ui/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Protect from '@/components/Protect';
import Nav from '@/components/Nav';
import LeftNav from '@/components/LeftNav';
import { useAuth } from '@/contexts/AuthContext';
import db from '@/db';

const Support = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        type: 'feedback',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await addDoc(collection(db, 'support'), {
                userId: user.uid,
                username: user.username,
                email: user.email,
                type: formData.type,
                subject: formData.subject,
                message: formData.message,
                status: 'open',
                createdAt: serverTimestamp()
            });

            toast({
                title: 'Submitted successfully!',
                description: 'We\'ll get back to you soon.',
                status: 'success',
                duration: 3000,
            });

            setFormData({ type: 'feedback', subject: '', message: '' });
        } catch (error) {
            toast({
                title: 'Submission failed',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Protect>
            <Head>
                <title>Support - Terrader</title>
            </Head>

            <Box minH="100vh" p={8}>
                <Nav />
                <LeftNav />

                <Container maxW="container.md" mt={8}>
                    <VStack spacing={8} align="stretch">
                        <Box textAlign="center">
                            <Heading size="2xl" mb={2}>Support & Feedback</Heading>
                            <Text color="gray.400">
                                We'd love to hear from you! Share your feedback or report issues.
                            </Text>
                        </Box>

                        <Box
                            bg="brandBlack.100"
                            backdropFilter="blur(10px)"
                            p={8}
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="whiteAlpha.200"
                        >
                            <form onSubmit={handleSubmit}>
                                <VStack spacing={6}>
                                    <FormControl isRequired>
                                        <FormLabel>Type</FormLabel>
                                        <Select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            bg="brandBlack.200"
                                        >
                                            <option value="feedback">Feedback</option>
                                            <option value="bug">Bug Report</option>
                                            <option value="feature">Feature Request</option>
                                            <option value="question">Question</option>
                                            <option value="other">Other</option>
                                        </Select>
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel>Subject</FormLabel>
                                        <Input
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            placeholder="Brief description"
                                            bg="brandBlack.200"
                                        />
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel>Message</FormLabel>
                                        <Textarea
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Tell us more..."
                                            rows={8}
                                            bg="brandBlack.200"
                                        />
                                    </FormControl>

                                    <Button
                                        type="submit"
                                        colorScheme="green"
                                        size="lg"
                                        w="full"
                                        isLoading={submitting}
                                    >
                                        Submit
                                    </Button>
                                </VStack>
                            </form>
                        </Box>
                    </VStack>
                </Container>
            </Box>
        </Protect>
    );
};

export default Support;
