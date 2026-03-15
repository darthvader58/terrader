import { useState, useEffect } from "react";
import LeftNav from "@/components/LeftNav";
import Nav from "@/components/Nav";
import { TimeIcon, ViewIcon, StarIcon, InfoIcon, EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import {
    Box,
    Input,
    Badge,
    Heading,
    Text,
    VStack,
    HStack,
    Flex,
    SimpleGrid,
    Button,
    Divider,
    Icon,
    IconButton,
    useToast,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Image,
    TableContainer,
} from "@chakra-ui/react";
import { POWER_UPS } from "@/utils/gameLogic";
import { getUserGameHistory } from "@/utils/gameRoom";
import { doc, updateDoc, increment } from "firebase/firestore";
import db from "@/db";
import Protect from "@/components/Protect";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
    const { user, updateUserProfile, refreshUserData } = useAuth();
    const toast = useToast();
    const [editing, setEditing] = useState(false);
    const [username, setUsername] = useState(user?.username || "");
    const [gameHistory, setGameHistory] = useState([]);
    const [ownedPowerUps, setOwnedPowerUps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const iconMap = {
        time: TimeIcon,
        view: ViewIcon,
        star: StarIcon,
        info: InfoIcon,
    };
    
    const handleProfilePicChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please select an image under 2MB",
                status: "error",
                duration: 3000,
            });
            return;
        }
        
        setUploading(true);
        
        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result;
                
                // Update user profile with new photo
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    photoURL: base64String
                });
                
                // Update auth context
                if (updateUserProfile) {
                    await updateUserProfile({ photoURL: base64String });
                }
                
                toast({
                    title: "Profile picture updated",
                    status: "success",
                    duration: 3000,
                });
                
                // Reload page to show new picture
                window.location.reload();
            };
            
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            toast({
                title: "Upload failed",
                description: error.message,
                status: "error",
                duration: 3000,
            });
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            loadGameHistory();
            setOwnedPowerUps(user.powerUps || []);
        }
        
        // Refresh user data when profile page loads to get latest credits
        if (refreshUserData) {
            refreshUserData();
        }
    }, [user]);

    const loadGameHistory = async () => {
        if (!user) return;
        try {
            console.log('Loading game history for user:', user.uid);
            const history = await getUserGameHistory(user.uid, 10);
            console.log('Game history loaded:', history);
            setGameHistory(history);
            
            if (history.length === 0) {
                console.log('No game history found for user');
            }
        } catch (error) {
            console.error('Failed to load game history:', error);
            
            // If it's an index error, show a helpful message
            if (error.message && error.message.includes('index')) {
                toast({
                    title: 'Game history unavailable',
                    description: 'Database index is being created. This may take a few minutes.',
                    status: 'info',
                    duration: 5000,
                });
            } else {
                toast({
                    title: 'Failed to load game history',
                    description: error.message,
                    status: 'error',
                    duration: 3000,
                });
            }
        }
    };

    const handleSaveUsername = async () => {
        if (!username.trim() || username === user.username) {
            setEditing(false);
            return;
        }

        setLoading(true);
        try {
            await updateUserProfile({ username: username.trim() });
            toast({
                title: 'Username updated!',
                status: 'success',
                duration: 2000,
            });
            setEditing(false);
        } catch (error) {
            toast({
                title: 'Failed to update username',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBuyPowerUp = async (powerUp) => {
        if (!user) return;

        if (user.carbonCredits < powerUp.cost) {
            toast({
                title: 'Not enough credits',
                description: `You need ${powerUp.cost} credits to buy this power-up.`,
                status: 'warning',
                duration: 3000,
            });
            return;
        }

        try {
            const userRef = doc(db, 'users', user.uid);
            const newPowerUps = [...(user.powerUps || []), powerUp.id];
            
            await updateDoc(userRef, {
                carbonCredits: increment(-powerUp.cost),
                powerUps: newPowerUps
            });

            setOwnedPowerUps(newPowerUps);
            
            toast({
                title: 'Power-up purchased!',
                description: `${powerUp.name} added to your inventory.`,
                status: 'success',
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: 'Purchase failed',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        }
    };

    return (
        <Protect>
            <Box
                px={{ base: 4, md: 8, lg: 16 }}
                pt={{ base: 4, md: 8 }}
                pb={{ base: 24, lg: 10 }}
                minH="100vh"
            >
                <Nav />
                <LeftNav />

                <Box px={{ base: 0, md: 4, lg: 16 }} mt={{ base: 6, md: 10 }}>
                    <Tabs colorScheme="green" variant="enclosed">
                        <TabList overflowX="auto" overflowY="hidden" py={1}>
                            <Tab whiteSpace="nowrap">Profile</Tab>
                            <Tab whiteSpace="nowrap">Game History</Tab>
                            <Tab whiteSpace="nowrap">Power-ups</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel>
                                <VStack spacing={8} align="stretch">
                                    <Box 
                                        bg="glass" 
                                        backdropFilter="blur(15px)"
                                        p={{ base: 4, md: 8 }} 
                                        borderRadius="xl" 
                                        borderWidth={2}
                                        borderColor="whiteAlpha.200"
                                        boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
                                    >
                                        <Flex
                                            gap={{ base: 5, md: 8 }}
                                            mb={6}
                                            direction={{ base: "column", md: "row" }}
                                            align={{ base: "start", md: "center" }}
                                        >
                                            <VStack align={{ base: "start", md: "center" }}>
                                                <Box
                                                    borderRadius="full"
                                                    overflow="hidden"
                                                    border="3px solid"
                                                    borderColor="green.400"
                                                    position="relative"
                                                    cursor="pointer"
                                                    onClick={() => document.getElementById('profile-pic-upload').click()}
                                                    _hover={{ opacity: 0.8 }}
                                                    w={{ base: "96px", md: "120px" }}
                                                    h={{ base: "96px", md: "120px" }}
                                                >
                                                    <Image
                                                        src={user?.photoURL || "/assets/avatar.svg"}
                                                        alt="avatar"
                                                        w="100%"
                                                        h="100%"
                                                        objectFit="cover"
                                                    />
                                                </Box>
                                                <input
                                                    id="profile-pic-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={handleProfilePicChange}
                                                />
                                                <Text fontSize="xs" color="gray.500">Click to change</Text>
                                            </VStack>
                                            <VStack align="start" flex={1} spacing={3} w="100%">
                                                <Flex
                                                    w="100%"
                                                    gap={3}
                                                    direction={{ base: "column", sm: "row" }}
                                                    align={{ base: "stretch", sm: "center" }}
                                                >
                                                    <Input
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        size="lg"
                                                        fontWeight="bold"
                                                        fontSize={{ base: "xl", md: "2xl" }}
                                                        isReadOnly={!editing}
                                                        variant={editing ? "outline" : "filled"}
                                                        bg="rgba(12, 18, 19, 0.82)"
                                                        borderWidth="1px"
                                                        borderColor="whiteAlpha.200"
                                                        borderRadius="xl"
                                                        boxShadow="inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 24px rgba(0,0,0,0.16)"
                                                        _hover={{
                                                            borderColor: "whiteAlpha.300",
                                                        }}
                                                        _focusVisible={{
                                                            borderColor: "green.400",
                                                            boxShadow: "0 0 0 1px rgba(72, 187, 120, 0.45), 0 10px 24px rgba(0,0,0,0.16)",
                                                        }}
                                                        minW={0}
                                                    />
                                                    {!editing ? (
                                                        <IconButton
                                                            icon={<EditIcon />}
                                                            onClick={() => setEditing(true)}
                                                            colorScheme="blue"
                                                            aria-label="Edit username"
                                                            alignSelf={{ base: "flex-start", sm: "center" }}
                                                        />
                                                    ) : (
                                                        <HStack>
                                                            <IconButton
                                                                icon={<CheckIcon />}
                                                                onClick={handleSaveUsername}
                                                                colorScheme="green"
                                                                isLoading={loading}
                                                                aria-label="Save"
                                                            />
                                                            <IconButton
                                                                icon={<CloseIcon />}
                                                                onClick={() => {
                                                                    setUsername(user.username);
                                                                    setEditing(false);
                                                                }}
                                                                colorScheme="red"
                                                                aria-label="Cancel"
                                                            />
                                                        </HStack>
                                                    )}
                                                </Flex>
                                                <HStack spacing={3} flexWrap="wrap">
                                                    <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                                                        Level {user?.level || 1}
                                                    </Badge>
                                                    <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                                                        {user?.carbonCredits || 0} Credits
                                                    </Badge>
                                                </HStack>
                                            </VStack>
                                        </Flex>

                                        <Divider my={6} />

                                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                                            <Box
                                                bg="linear-gradient(180deg, rgba(12, 18, 19, 0.82), rgba(22, 29, 31, 0.9))"
                                                p={{ base: 4, md: 5 }}
                                                borderRadius="xl"
                                                minW={0}
                                                borderWidth="1px"
                                                borderColor="whiteAlpha.200"
                                                boxShadow="0 14px 30px rgba(0, 0, 0, 0.16)"
                                            >
                                                <Text fontSize="sm" color="gray.400" mb={2}>
                                                    Total Games
                                                </Text>
                                                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">
                                                    {user?.totalGames || 0}
                                                </Text>
                                            </Box>
                                            <Box
                                                bg="linear-gradient(180deg, rgba(9, 22, 18, 0.88), rgba(17, 31, 27, 0.94))"
                                                p={{ base: 4, md: 5 }}
                                                borderRadius="xl"
                                                minW={0}
                                                borderWidth="1px"
                                                borderColor="green.900"
                                                boxShadow="0 14px 30px rgba(8, 32, 22, 0.22)"
                                            >
                                                <Text fontSize="sm" color="gray.400" mb={2}>
                                                    Total Carbon Score
                                                </Text>
                                                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="green.400">
                                                    {user?.carbonScore || 0}
                                                </Text>
                                            </Box>
                                            <Box
                                                bg="linear-gradient(180deg, rgba(12, 17, 24, 0.84), rgba(22, 28, 38, 0.92))"
                                                p={{ base: 4, md: 5 }}
                                                borderRadius="xl"
                                                minW={0}
                                                borderWidth="1px"
                                                borderColor="blue.900"
                                                boxShadow="0 14px 30px rgba(12, 24, 42, 0.2)"
                                            >
                                                <Text fontSize="sm" color="gray.400" mb={2}>
                                                    Highest Rank
                                                </Text>
                                                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="blue.400">
                                                    {user?.highestRank || "N/A"}
                                                </Text>
                                            </Box>
                                        </SimpleGrid>
                                    </Box>
                                </VStack>
                            </TabPanel>

                            <TabPanel>
                                <Box 
                                    bg="glass" 
                                    backdropFilter="blur(15px)"
                                    p={{ base: 4, md: 8 }} 
                                    borderRadius="xl" 
                                    borderWidth={2}
                                    borderColor="whiteAlpha.200"
                                >
                                    <Heading size="lg" mb={6}>Recent Games</Heading>
                                    {gameHistory.length === 0 ? (
                                        <Text color="gray.400" textAlign="center" py={8}>
                                            No games played yet. Start playing to see your history!
                                        </Text>
                                    ) : (
                                        <TableContainer overflowX="auto" overflowY="hidden">
                                            <Table variant="simple" minW="720px">
                                                <Thead>
                                                    <Tr>
                                                        <Th>Rank</Th>
                                                        <Th>Players</Th>
                                                        <Th>Carbon Score</Th>
                                                        <Th>Credits Earned</Th>
                                                        <Th>Type</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {gameHistory.map((game, index) => (
                                                        <Tr key={game.id || index}>
                                                            <Td>
                                                                <Badge colorScheme={game.rank <= 3 ? "green" : "gray"}>
                                                                    #{game.rank || '?'}
                                                                </Badge>
                                                            </Td>
                                                            <Td>{game.totalPlayers || 0}</Td>
                                                            <Td color="green.400">{game.carbonScore || 0}</Td>
                                                            <Td>{game.creditsEarned || 0}</Td>
                                                            <Td>
                                                                <Badge>{game.roomType || 'PUBLIC'}</Badge>
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </Box>
                            </TabPanel>

                            <TabPanel>
                                <VStack spacing={8} align="stretch">
                                    <Box>
                                        <Heading size="lg" mb={2}>Power-ups Store</Heading>
                                        <Text color="gray.400" mb={6}>
                                            Purchase power-ups to use during gameplay
                                        </Text>
                                        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={6}>
                                            {POWER_UPS.map((power, i) => {
                                                const IconComponent = iconMap[power.icon];
                                                const owned = ownedPowerUps.includes(power.id);
                                                return (
                                                    <Box
                                                        key={i}
                                                        bg="brandBlack.100"
                                                        backdropFilter="blur(10px)"
                                                        p={6}
                                                        borderRadius="xl"
                                                        borderWidth={2}
                                                        borderColor={owned ? "green.400" : "whiteAlpha.200"}
                                                        boxShadow="0 4px 16px rgba(0, 0, 0, 0.2)"
                                                        _hover={{
                                                            borderColor: "green.400",
                                                            transform: "translateY(-8px)",
                                                            boxShadow: "0 12px 32px rgba(28, 200, 128, 0.3)",
                                                        }}
                                                        transition="all 0.3s"
                                                        opacity={owned ? 0.7 : 1}
                                                    >
                                                        <VStack spacing={4}>
                                                            <Icon
                                                                as={IconComponent}
                                                                boxSize={16}
                                                                color="green.400"
                                                            />
                                                            <VStack spacing={2}>
                                                                <Text fontWeight="bold" fontSize="lg" textAlign="center">
                                                                    {power.name}
                                                                </Text>
                                                                <Text fontSize="sm" color="gray.400" textAlign="center" minH="40px">
                                                                    {power.description}
                                                                </Text>
                                                            </VStack>
                                                            <Divider />
                                                            <Button
                                                                colorScheme={owned ? "gray" : "green"}
                                                                w="100%"
                                                                leftIcon={<StarIcon />}
                                                                onClick={() => handleBuyPowerUp(power)}
                                                                isDisabled={owned}
                                                            >
                                                                {owned ? "Owned" : `${power.cost} Credits`}
                                                            </Button>
                                                        </VStack>
                                                    </Box>
                                                );
                                            })}
                                        </SimpleGrid>
                                    </Box>

                                    <Box 
                                        bg="glass" 
                                        p={6} 
                                        borderRadius="xl"
                                        borderWidth={2}
                                        borderColor="blue.400"
                                    >
                                        <HStack justify="space-between">
                                            <VStack align="start">
                                                <Text fontWeight="bold" fontSize="lg">
                                                    Earn More Credits
                                                </Text>
                                                <Text fontSize="sm" color="gray.400">
                                                    Play games, achieve high carbon scores, and win matches to earn credits. All currency is in-game only!
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    </Box>
                                </VStack>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>
            </Box>
        </Protect>
    );
};

export default Profile;
