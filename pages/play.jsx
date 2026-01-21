import {
    Box,
    Flex,
    Heading,
    Text,
    VStack,
    HStack,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Progress,
    Badge,
    useToast,
    Divider,
    Icon,
} from "@chakra-ui/react";
import { TimeIcon, StarIcon, ViewIcon, InfoIcon } from "@chakra-ui/icons";
import { FaTrophy } from "react-icons/fa";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Protect from "@/components/Protect";
import Graph from "@/components/Graph";
import CoinSelector from "@/components/CoinSelector";
import TradingPanel from "@/components/TradingPanel";
import NewsPanel from "@/components/NewsPanel";
import CarbonMeter from "@/components/CarbonMeter";
import PlayerActivityFeed from "@/components/PlayerActivityFeed";
import PowerUpsPanel from "@/components/PowerUpsPanel";
import { CRYPTO_COINS, GAME_CONFIG, POWER_UPS, calculateCarbonScore, calculateProfit, generatePriceMovement, calculateCarbonFootprint } from "@/utils/gameLogic";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToRoom, updatePlayerScore, finishGame } from "@/utils/gameRoom";

const Play = () => {
    const { user } = useAuth();
    const router = useRouter();
    const { roomId } = router.query;
    const toast = useToast();
    
    const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.GAME_DURATION);
    const [selectedCoin, setSelectedCoin] = useState(CRYPTO_COINS[0]);
    const [prices, setPrices] = useState({});
    const [priceHistory, setPriceHistory] = useState({});
    const [portfolio, setPortfolio] = useState({
        balance: GAME_CONFIG.INITIAL_BALANCE,
        holdings: {}
    });
    const [carbonScore, setCarbonScore] = useState(0);
    const [trades, setTrades] = useState([]);
    const [news, setNews] = useState([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const [leaderboardRank, setLeaderboardRank] = useState(null);
    const [roomData, setRoomData] = useState(null);
    const [liveLeaderboard, setLiveLeaderboard] = useState([]);
    const [activePowerUps, setActivePowerUps] = useState({});
    const [carbonMultiplier, setCarbonMultiplier] = useState(1);
    const [marketTrends, setMarketTrends] = useState({});
    const [lastNewsImpact, setLastNewsImpact] = useState({});

    useEffect(() => {
        const initialPrices = {};
        const initialHistory = {};
        const initialTrends = {};
        
        CRYPTO_COINS.forEach(coin => {
            const basePrice = 50 + Math.random() * 50;
            initialPrices[coin.id] = {
                current: basePrice,
                previous: basePrice,
                change: 0
            };
            initialHistory[coin.id] = {
                labels: ['0m'],
                prices: [basePrice]
            };
            initialTrends[coin.id] = (Math.random() - 0.5) * 0.5; // Initial trend
        });
        
        setPrices(initialPrices);
        setPriceHistory(initialHistory);
        setMarketTrends(initialTrends);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    handleGameEnd();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);

    useEffect(() => {
        if (!roomId || !user) return;

        const unsubscribe = subscribeToRoom(roomId, (room) => {
            setRoomData(room);
            
            if (room.leaderboard) {
                const leaderboardArray = Object.values(room.leaderboard)
                    .sort((a, b) => b.carbonScore - a.carbonScore)
                    .map((player, index) => ({
                        ...player,
                        rank: index + 1
                    }));
                setLiveLeaderboard(leaderboardArray);
                
                const myRank = leaderboardArray.find(p => p.userId === user.uid);
                setLeaderboardRank(myRank?.rank || null);
            }
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [roomId, user]);

    useEffect(() => {
        if (!roomId || !user) return;
        
        const scoreInterval = setInterval(async () => {
            const currentProfit = calculateProfit(portfolio, Object.fromEntries(
                Object.entries(prices).map(([id, p]) => [id, p.current])
            ));
            
            await updatePlayerScore(roomId, user.uid, carbonScore, currentProfit, portfolio);
        }, 10000);

        return () => clearInterval(scoreInterval);
    }, [roomId, user, carbonScore, portfolio, prices]);

    const handleGameEnd = async () => {
        if (roomId) {
            await finishGame(roomId);
            router.push(`/results?roomId=${roomId}`);
        } else {
            router.push('/dash');
        }
    };

    useEffect(() => {
        const priceInterval = setInterval(() => {
            setPrices(prevPrices => {
                const newPrices = {};
                CRYPTO_COINS.forEach(coin => {
                    // Get news impact for this coin
                    const newsImpact = lastNewsImpact[coin.id] || 0;
                    const trend = marketTrends[coin.id] || 0;
                    
                    const newPrice = generatePriceMovement(
                        prevPrices[coin.id]?.current || 50, 
                        newsImpact,
                        trend
                    );
                    const change = ((newPrice - prevPrices[coin.id]?.current) / prevPrices[coin.id]?.current) * 100;
                    
                    newPrices[coin.id] = {
                        current: newPrice,
                        previous: prevPrices[coin.id]?.current,
                        change: change
                    };
                });
                return newPrices;
            });

            setPriceHistory(prevHistory => {
                const newHistory = { ...prevHistory };
                const elapsed = GAME_CONFIG.GAME_DURATION - timeLeft;
                const timeLabel = `${(elapsed / 60).toFixed(1)}m`;
                
                CRYPTO_COINS.forEach(coin => {
                    if (!newHistory[coin.id]) {
                        newHistory[coin.id] = { labels: [], prices: [] };
                    }
                    newHistory[coin.id].labels.push(timeLabel);
                    newHistory[coin.id].prices.push(prices[coin.id]?.current || 50);
                    
                    // Keep last 50 data points for better graph
                    if (newHistory[coin.id].labels.length > 50) {
                        newHistory[coin.id].labels.shift();
                        newHistory[coin.id].prices.shift();
                    }
                });
                
                return newHistory;
            });
            
            // Gradually decay news impact
            setLastNewsImpact(prev => {
                const decayed = {};
                Object.keys(prev).forEach(coinId => {
                    decayed[coinId] = prev[coinId] * 0.8; // Decay by 20%
                });
                return decayed;
            });
        }, GAME_CONFIG.PRICE_UPDATE_INTERVAL * 1000);

        return () => clearInterval(priceInterval);
    }, [timeLeft, prices, lastNewsImpact, marketTrends]);

    const fetchNews = useCallback(async () => {
        setNewsLoading(true);
        try {
            const coin = CRYPTO_COINS[Math.floor(Math.random() * CRYPTO_COINS.length)];
            const trend = Math.random() > 0.5 ? 'bullish' : 'bearish';
            
            const response = await fetch('/api/generate-news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coinName: coin.name, trend })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setNews(prev => [{
                    news: data.news,
                    coin: data.coin,
                    trend: trend,
                    timestamp: data.timestamp
                }, ...prev].slice(0, 5));
                
                // Apply news impact to the specific coin
                const impact = trend === 'bullish' ? 0.6 : -0.6; // Strong impact
                setLastNewsImpact(prev => ({
                    ...prev,
                    [coin.id]: impact
                }));
                
                // Update market trend
                setMarketTrends(prev => ({
                    ...prev,
                    [coin.id]: impact * 0.5 // Trend persists longer
                }));
            }
        } catch (error) {
            console.error('Failed to fetch news:', error);
        } finally {
            setNewsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNews();
        // News every 30-40 seconds
        const newsInterval = setInterval(fetchNews, 30000 + Math.random() * 10000);
        return () => clearInterval(newsInterval);
    }, [fetchNews]);

    const handleUsePowerUp = (powerUp) => {
        setActivePowerUps(prev => ({ ...prev, [powerUp.id]: true }));
        
        if (powerUp.id === 'carbon_boost') {
            setCarbonMultiplier(powerUp.multiplier || 2);
            setTimeout(() => {
                setCarbonMultiplier(1);
                setActivePowerUps(prev => {
                    const updated = { ...prev };
                    delete updated[powerUp.id];
                    return updated;
                });
            }, powerUp.duration);
        } else if (powerUp.id === 'time_freeze') {
            // Implement time freeze logic if needed
            setTimeout(() => {
                setActivePowerUps(prev => {
                    const updated = { ...prev };
                    delete updated[powerUp.id];
                    return updated;
                });
            }, powerUp.duration);
        }
    };

    const handleTrade = async (type, coin, quantity, price) => {
        const trade = { type, coin: coin.id, quantity, price, timestamp: Date.now() };
        
        if (type === 'buy') {
            const cost = quantity * price;
            if (cost > portfolio.balance) {
                toast({
                    title: "Insufficient balance",
                    status: "error",
                    duration: 2000,
                });
                return;
            }
            
            setPortfolio(prev => ({
                balance: prev.balance - cost,
                holdings: {
                    ...prev.holdings,
                    [coin.id]: {
                        quantity: (prev.holdings[coin.id]?.quantity || 0) + quantity,
                        avgPrice: ((prev.holdings[coin.id]?.quantity || 0) * (prev.holdings[coin.id]?.avgPrice || 0) + cost) / ((prev.holdings[coin.id]?.quantity || 0) + quantity)
                    }
                }
            }));
        } else {
            const holding = portfolio.holdings[coin.id];
            if (!holding || holding.quantity < quantity) {
                toast({
                    title: "Insufficient holdings",
                    status: "error",
                    duration: 2000,
                });
                return;
            }
            
            const revenue = quantity * price;
            setPortfolio(prev => ({
                balance: prev.balance + revenue,
                holdings: {
                    ...prev.holdings,
                    [coin.id]: {
                        ...holding,
                        quantity: holding.quantity - quantity
                    }
                }
            }));
        }
        
        const scoreChange = calculateCarbonScore(trade) * carbonMultiplier;
        setCarbonScore(prev => prev + scoreChange);
        setTrades(prev => [...prev, trade]);
        
        toast({
            title: `${type === 'buy' ? 'Bought' : 'Sold'} ${quantity.toFixed(2)} ${coin.symbol}`,
            description: `Carbon score ${scoreChange > 0 ? '+' : ''}${scoreChange}`,
            status: scoreChange > 0 ? "success" : "warning",
            duration: 2000,
        });
    };

    const profit = calculateProfit(portfolio, Object.fromEntries(
        Object.entries(prices).map(([id, p]) => [id, p.current])
    ));
    
    const carbonFootprint = calculateCarbonFootprint(trades, portfolio.holdings);
    
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    return (
        <Protect>
            <Flex h="100vh" overflow="hidden">
                <Box flex={1} p={6} overflowY="auto">
                    <VStack spacing={6} align="stretch">
                        <HStack justify="space-between">
                            <Stat>
                                <StatLabel>Your Profit</StatLabel>
                                <StatNumber color={profit >= 0 ? "green.400" : "red.400"}>
                                    ${profit.toFixed(2)}
                                </StatNumber>
                                <StatHelpText>
                                    <StatArrow type={profit >= 0 ? "increase" : "decrease"} />
                                    {((profit / GAME_CONFIG.INITIAL_BALANCE) * 100).toFixed(2)}%
                                </StatHelpText>
                            </Stat>
                            
                            <Stat textAlign="center">
                                <StatLabel>
                                    <HStack justify="center">
                                        <TimeIcon />
                                        <Text>Time Remaining</Text>
                                    </HStack>
                                </StatLabel>
                                <StatNumber fontSize="4xl">
                                    {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                                </StatNumber>
                            </Stat>
                            
                            <Stat textAlign="right">
                                <StatLabel>
                                    <HStack justify="flex-end" spacing={2}>
                                        <Text>Carbon Score</Text>
                                        {/* Power-ups as icons */}
                                        {Object.keys(activePowerUps).map(powerUpId => {
                                            const powerUp = POWER_UPS.find(p => p.id === powerUpId);
                                            if (!powerUp) return null;
                                            const IconComponent = powerUp.icon === 'time' ? TimeIcon : 
                                                                 powerUp.icon === 'view' ? ViewIcon :
                                                                 powerUp.icon === 'star' ? StarIcon : InfoIcon;
                                            return (
                                                <Icon 
                                                    key={powerUpId}
                                                    as={IconComponent} 
                                                    color={powerUp.color || 'green.400'}
                                                    boxSize={4}
                                                />
                                            );
                                        })}
                                    </HStack>
                                </StatLabel>
                                <StatNumber color={carbonScore >= 0 ? "green.400" : "red.400"}>
                                    <HStack justify="flex-end">
                                        <StarIcon />
                                        <Text>{carbonScore}</Text>
                                    </HStack>
                                </StatNumber>
                                <StatHelpText>Footprint: {carbonFootprint}</StatHelpText>
                            </Stat>
                        </HStack>

                        <CoinSelector
                            coins={CRYPTO_COINS}
                            selectedCoin={selectedCoin}
                            onSelect={setSelectedCoin}
                            prices={prices}
                        />

                        <Box bg="brandBlack.100" p={6} borderRadius="xl" h="500px" backdropFilter="blur(10px)" boxShadow="0 4px 16px rgba(0, 0, 0, 0.3)">
                            <Graph 
                                data={priceHistory[selectedCoin.id]} 
                                selectedCoin={selectedCoin}
                            />
                        </Box>
                    </VStack>
                </Box>

                <Box
                    w="400px"
                    bg="glass"
                    backdropFilter="blur(20px)"
                    p={6}
                    overflowY="auto"
                    borderLeft="1px solid"
                    borderColor="whiteAlpha.200"
                    boxShadow="-4px 0 16px rgba(0, 0, 0, 0.2)"
                >
                    <VStack spacing={6} align="stretch">
                        <TradingPanel
                            selectedCoin={selectedCoin}
                            balance={portfolio.balance}
                            holdings={portfolio.holdings}
                            currentPrice={prices[selectedCoin.id]?.current || 0}
                            onTrade={handleTrade}
                        />

                        <Divider />

                        <CarbonMeter 
                            carbonScore={carbonScore}
                            carbonFootprint={carbonFootprint}
                        />

                        <Divider />

                        <NewsPanel news={news} loading={newsLoading} />

                        <Divider />

                        <PlayerActivityFeed 
                            leaderboard={liveLeaderboard}
                            currentUserId={user?.uid}
                        />

                        {liveLeaderboard.length > 0 && (
                            <>
                                <Divider />
                                <VStack spacing={3} w="100%" align="stretch">
                                    <HStack>
                                        <Icon as={FaTrophy} color="yellow.400" />
                                        <Text fontWeight="bold" fontSize="md">
                                            Live Leaderboard
                                        </Text>
                                    </HStack>
                                    <VStack spacing={2} maxH="300px" overflowY="auto">
                                        {liveLeaderboard.slice(0, 10).map((player, index) => (
                                            <HStack
                                                key={player.userId}
                                                w="100%"
                                                p={2}
                                                bg={player.userId === user?.uid ? 'green.900' : 'brandBlack.200'}
                                                borderRadius="md"
                                                justify="space-between"
                                            >
                                                <HStack spacing={2}>
                                                    <Badge
                                                        colorScheme={index < 3 ? 'yellow' : 'gray'}
                                                        fontSize="xs"
                                                    >
                                                        #{player.rank}
                                                    </Badge>
                                                    <Text fontSize="sm" fontWeight={player.userId === user?.uid ? 'bold' : 'normal'}>
                                                        {player.userId === user?.uid ? 'You' : `Player ${player.userId.slice(-4)}`}
                                                    </Text>
                                                </HStack>
                                                <Text fontSize="sm" fontWeight="bold" color="green.400">
                                                    {player.carbonScore}
                                                </Text>
                                            </HStack>
                                        ))}
                                    </VStack>
                                    {leaderboardRank && (
                                        <Box
                                            p={3}
                                            bg="green.900"
                                            borderRadius="md"
                                            borderWidth={2}
                                            borderColor="green.400"
                                        >
                                            <Text fontSize="sm" textAlign="center">
                                                Your Rank: <Text as="span" fontWeight="bold" fontSize="lg">#{leaderboardRank}</Text> / {liveLeaderboard.length}
                                            </Text>
                                        </Box>
                                    )}
                                </VStack>
                            </>
                        )}
                    </VStack>
                </Box>
            </Flex>
            
            {/* Floating Power-Ups Panel */}
            <Box
                position="fixed"
                bottom={6}
                right={6}
                zIndex={10}
            >
                <PowerUpsPanel 
                    ownedPowerUps={user?.powerUps || []}
                    onUsePowerUp={handleUsePowerUp}
                />
            </Box>
        </Protect>
    );
};

export default Play;
