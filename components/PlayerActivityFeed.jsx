import { Box, VStack, HStack, Text, Badge, Icon } from "@chakra-ui/react";
import { FaArrowUp, FaArrowDown, FaBolt, FaFire, FaSnowflake } from "react-icons/fa";
import { useEffect, useState } from "react";

const PlayerActivityFeed = ({ leaderboard, currentUserId, recentTrades = {}, prices = {} }) => {
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
                
                if (prevRank > currentRank && currentRank <= 3) {
                    newActivities.push({
                        id: `${player.userId}-${Date.now()}`,
                        type: 'rank_up',
                        username: player.username || 'Player',
                        from: prevRank,
                        to: currentRank,
                        timestamp: Date.now(),
                        insight: `${player.username || 'Player'} moved to top ${currentRank}!`
                    });
                }
                
                // Check for score increases
                if (player.carbonScore > prevPlayer.carbonScore) {
                    const increase = player.carbonScore - prevPlayer.carbonScore;
                    if (increase > 30) { // Only show significant increases
                        newActivities.push({
                            id: `${player.userId}-score-${Date.now()}`,
                            type: 'score_boost',
                            username: player.username || 'Player',
                            amount: increase,
                            timestamp: Date.now(),
                            insight: `Big move! +${increase} carbon score`
                        });
                    }
                }
            }
        });
        
        // Add trading insights from recent trades
        Object.keys(recentTrades).forEach(coinId => {
            const trades = recentTrades[coinId] || [];
            if (trades.length > 5) {
                const recentFive = trades.slice(0, 5);
                const buyCount = recentFive.filter(t => t.type === 'buy').length;
                if (buyCount >= 4) {
                    newActivities.push({
                        id: `trend-buy-${coinId}-${Date.now()}`,
                        type: 'trend_buy',
                        coin: coinId,
                        timestamp: Date.now(),
                        insight: `Heavy buying pressure on ${coinId.toUpperCase()}`
                    });
                } else if (buyCount <= 1) {
                    newActivities.push({
                        id: `trend-sell-${coinId}-${Date.now()}`,
                        type: 'trend_sell',
                        coin: coinId,
                        timestamp: Date.now(),
                        insight: `Heavy selling pressure on ${coinId.toUpperCase()}`
                    });
                }
            }
        });
        
        // Add price movement insights
        Object.keys(prices).forEach(coinId => {
            const priceData = prices[coinId];
            if (priceData && Math.abs(priceData.change) > 3) {
                newActivities.push({
                    id: `price-${coinId}-${Date.now()}`,
                    type: priceData.change > 0 ? 'price_surge' : 'price_drop',
                    coin: coinId,
                    change: priceData.change,
                    timestamp: Date.now(),
                    insight: `${coinId.toUpperCase()} ${priceData.change > 0 ? 'surging' : 'dropping'} ${Math.abs(priceData.change).toFixed(1)}%`
                });
            }
        });

        if (newActivities.length > 0) {
            setActivities(prev => [...newActivities, ...prev].slice(0, 8));
        }

        setPrevLeaderboard(leaderboard);
    }, [leaderboard, recentTrades, prices]);

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
                <Text fontSize="sm" fontWeight="bold" mb={3}>Market Insights</Text>
                <Text fontSize="xs" color="gray.500" textAlign="center" py={4}>
                    Watching for trading opportunities...
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
            <Text fontSize="sm" fontWeight="bold" mb={3}>Market Insights</Text>
            <VStack spacing={2} align="stretch">
                {activities.map((activity) => {
                    let icon = FaBolt;
                    let color = 'blue.400';
                    
                    if (activity.type === 'rank_up') {
                        icon = FaArrowUp;
                        color = 'green.400';
                    } else if (activity.type === 'trend_buy' || activity.type === 'price_surge') {
                        icon = FaFire;
                        color = 'orange.400';
                    } else if (activity.type === 'trend_sell' || activity.type === 'price_drop') {
                        icon = FaSnowflake;
                        color = 'cyan.400';
                    }
                    
                    return (
                        <Box
                            key={activity.id}
                            bg="brandBlack.200"
                            p={2}
                            borderRadius="md"
                            borderLeft="3px solid"
                            borderColor={color}
                        >
                            <HStack spacing={2} fontSize="xs">
                                <Icon as={icon} color={color} />
                                <Text flex={1} color="white">
                                    {activity.insight}
                                </Text>
                            </HStack>
                        </Box>
                    );
                })}
            </VStack>
        </Box>
    );
};

export default PlayerActivityFeed;
