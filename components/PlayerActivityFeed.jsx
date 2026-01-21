import { Box, VStack, HStack, Text, Badge, Icon, Avatar } from "@chakra-ui/react";
import { FaArrowUp, FaArrowDown, FaBolt } from "react-icons/fa";
import { useEffect, useState } from "react";

const PlayerActivityFeed = ({ leaderboard, currentUserId }) => {
    const [activities, setActivities] = useState([]);
    const [prevLeaderboard, setPrevLeaderboard] = useState([]);

    useEffect(() => {
        if (!leaderboard || leaderboard.length === 0) return;

        // Detect changes in leaderboard
        const newActivities = [];
        
        leaderboard.forEach((player, index) => {
            const prevPlayer = prevLeaderboard.find(p => p.userId === player.userId);
            
            if (prevPlayer) {
                // Check for rank changes
                const prevRank = prevLeaderboard.findIndex(p => p.userId === player.userId) + 1;
                const currentRank = index + 1;
                
                if (prevRank > currentRank) {
                    newActivities.push({
                        id: `${player.userId}-${Date.now()}`,
                        type: 'rank_up',
                        username: player.username || 'Player',
                        from: prevRank,
                        to: currentRank,
                        timestamp: Date.now()
                    });
                }
                
                // Check for score increases
                if (player.carbonScore > prevPlayer.carbonScore) {
                    const increase = player.carbonScore - prevPlayer.carbonScore;
                    if (increase > 50) { // Only show significant increases
                        newActivities.push({
                            id: `${player.userId}-score-${Date.now()}`,
                            type: 'score_boost',
                            username: player.username || 'Player',
                            amount: increase,
                            timestamp: Date.now()
                        });
                    }
                }
            }
        });

        if (newActivities.length > 0) {
            setActivities(prev => [...newActivities, ...prev].slice(0, 5));
        }

        setPrevLeaderboard(leaderboard);
    }, [leaderboard]);

    if (activities.length === 0) {
        return (
            <Box
                bg="brandBlack.100"
                backdropFilter="blur(10px)"
                p={4}
                borderRadius="xl"
                borderWidth={2}
                borderColor="whiteAlpha.200"
            >
                <Text fontSize="sm" fontWeight="bold" mb={3}>Live Activity</Text>
                <Text fontSize="xs" color="gray.500" textAlign="center" py={4}>
                    Waiting for player activity...
                </Text>
            </Box>
        );
    }

    return (
        <Box
            bg="brandBlack.100"
            backdropFilter="blur(10px)"
            p={4}
            borderRadius="xl"
            borderWidth={2}
            borderColor="whiteAlpha.200"
            maxH="300px"
            overflowY="auto"
        >
            <Text fontSize="sm" fontWeight="bold" mb={3}>Live Activity</Text>
            <VStack spacing={2} align="stretch">
                {activities.map((activity) => (
                    <Box
                        key={activity.id}
                        bg="brandBlack.200"
                        p={2}
                        borderRadius="md"
                        borderLeft="3px solid"
                        borderColor={activity.type === 'rank_up' ? 'green.400' : 'blue.400'}
                    >
                        <HStack spacing={2} fontSize="xs">
                            <Icon 
                                as={activity.type === 'rank_up' ? FaArrowUp : FaBolt} 
                                color={activity.type === 'rank_up' ? 'green.400' : 'blue.400'}
                            />
                            <Text flex={1}>
                                <Text as="span" fontWeight="bold" color="white">
                                    {activity.username}
                                </Text>
                                {activity.type === 'rank_up' ? (
                                    <Text as="span" color="gray.400">
                                        {' '}moved to rank #{activity.to}
                                    </Text>
                                ) : (
                                    <Text as="span" color="gray.400">
                                        {' '}gained {activity.amount} carbon score
                                    </Text>
                                )}
                            </Text>
                        </HStack>
                    </Box>
                ))}
            </VStack>
        </Box>
    );
};

export default PlayerActivityFeed;
