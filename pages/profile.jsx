import { useState, useEffect } from "react";
import LeftNav from "@/components/LeftNav";
import Nav from "@/components/Nav";
import Image from "next/image";
import { TimeIcon, ViewIcon, StarIcon, InfoIcon, EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import {
    Box,
    Input,
    Badge,
    Heading,
    Text,
    VStack,
    HStack,
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
} from "@chakra-ui/react";
import { POWER_UPS } from "@/utils/gameLogic";
import { getUserGameHistory } from "@/utils/gameRoom";
import { doc, updateDoc, increment } from "firebase/firestore";
import db from "@/db";
import Protect from "@/components/Protect";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
    const { user, updateUserProfile } = useAuth();
    const toast = useToast();
    const [editing, setEditing] = useState(false);
    const [username, setUsername] = useState(user?.username || "");
    const [gameHistory, setGameHistory] = useState([]);
    const [ownedPowerUps, setOwnedPowerUps] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const iconMap = {
        time: TimeIcon,
        view: ViewIcon,
        star: StarIcon,
        info: InfoIcon,
    };

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            loadGameHistory();
            setOwnedPowerUps(user.powerUps || []);
        }
    }, [user]);

    const loadGameHistory = async () => {
        if (!user) return;
        try {
            const history = await getUserGameHistory(user.uid, 10);
            setGameHistory(history);
        } catch (error) {
            console.error('Failed to load game history:', error);
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
            <Box px={{ base: 6, md: 12, lg: 20 }} pt={10} minH="100vh">
                <Nav />
                <LeftNav />

                <Box px={{ base: 4, md: 12, lg: 48 }} mt={12}>
                    <Tabs colorScheme="green" variant="enclosed">
                        <TabList>
                            <Tab>Profile</Tab>
                            <Tab>Game History</Tab>
                            <Tab>Power-ups</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel>
                                <VStack spacing={8} align="stretch">
                                    <Box 
                                        bg="glass" 
                                        backdropFilter="blur(15px)"
                                        p={8} 
                                        borderRadius="xl" 
                                        borderWidth={2}
                                        borderColor="whiteAlpha.200"
                                        boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
                                    >
                                        <HStack spacing={8} mb={6}>
                                            <Box
                                                borderRadius="full"
                                                overflow="hidden"
                                                border="3px solid"
                                                borderColor="green.400"
                                            >
                                                <Image
                                                    src={user?.photoURL || "/assets/avatar2.svg"}
                                                    alt="avatar"
                                                    width={80}
                                                    height={80}
                                                />
                                            </Box>
                                            <VStack align="start" flex={1} spacing={2}>
                                                <HStack w="full">
                                                    <Input
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        size="lg"
                                                        fontWeight="bold"
                                                        fontSize="2xl"
                                                        isReadOnly={!editing}
                                                        variant={editing ? "outline" : "filled"}
                                                        bg="brandBlack.200"
                                                    />
                                                    {!editing ? (
                                                        <IconButton
                                                            icon={<EditIcon />}
                                                            onClick={() => setEditing(true)}
                                                            colorScheme="blue"
                                                            aria-label="Edit username"
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
                                                </HStack>
                                                <HStack>
                                                    <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                                                        Level {user?.level || 1}
                                                    </Badge>
                                                    <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                                                        {user?.carbonCredits || 0} Credits
                                                    </Badge>
                                                </HStack>
                                            </VStack>
                                        </HStack>

                                        <Divider my={6} />

                                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                                            <Box bg="brandBlack.100" p={4} borderRadius="lg">
                                                <Text fontSize="sm" color="gray.400" mb={2}>
                                                    Total Games
                                                </Text>
                                                <Text fontSize="3xl" fontWeight="bold">
                                                    {user?.totalGames || 0}
                                                </Text>
                                            </Box>
                                            <Box bg="brandBlack.100" p={4} borderRadius="lg">
                                                <Text fontSize="sm" color="gray.400" mb={2}>
                                                    Total Carbon Score
                                                </Text>
                                                <Text fontSize="3xl" fontWeight="bold" color="green.400">
                                                    {user?.carbonScore || 0}
                                                </Text>
                                            </Box>
                                            <Box bg="brandBlack.100" p={4} borderRadius="lg">
                                                <Text fontSize="sm" color="gray.400" mb={2}>
                                                    Highest Rank
                                                </Text>
                                                <Text fontSize="3xl" fontWeight="bold" color="blue.400">
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
                                    p={8} 
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
                                        <Table variant="simple">
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
                                                    <Tr key={index}>
                                                        <Td>
                                                            <Badge colorScheme={game.rank <= 3 ? "green" : "gray"}>
                                                                #{game.rank}
                                                            </Badge>
                                                        </Td>
                                                        <Td>{game.totalPlayers}</Td>
                                                        <Td color="green.400">{game.carbonScore}</Td>
                                                        <Td>{game.creditsEarned}</Td>
                                                        <Td>
                                                            <Badge>{game.roomType}</Badge>
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
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
                                        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
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
