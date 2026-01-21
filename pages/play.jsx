import {
    Box,
    Flex,
    Text,
    VStack,
    HStack,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Badge,
    useToast,
    Divider,
    Icon,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Button,
    Progress,
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
import PlayerActivityFeed from "@/components/PlayerActivityFeed";
import PowerUpsPanel from "@/components/PowerUpsPanel";
import OrderBook from "@/components/OrderBook";
import MarketDepth from "@/components/MarketDepth";
import RecentTrades from "@/components/RecentTrades";
import { CRYPTO_COINS, GAME_CONFIG, POWER_UPS, calculateCarbonScore, calculateProfit, generatePriceMovement, calculateCarbonFootprint, generateBotTrade, calculateOrderBook, calculateCreditsEarned } from "@/utils/gameLogic";
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
    const [recentTrades, setRecentTrades] = useState({});
    const [orderBooks, setOrderBooks] = useState({});
    const [marketStats, setMarketStats] = useState({});
    const [tradingVolumes, setTradingVolumes] = useState({});
    const [profit, setProfit] = useState(0);
    const [carbonFootprint, setCarbonFootprint] = useState(10);

    useEffect(() => {
        const initialPrices = {};
        const initialHistory = {};
        const initialTrends = {};
        const initialTrades = {};
        const initialVolumes = {};
        const initialStats = {};
        
        // Different base prices for each coin
        const basePrices = {
            'terra': 80 + Math.random() * 20,    // $80-100
            'gaia': 60 + Math.random() * 20,     // $60-80
            'enviro': 40 + Math.random() * 20,   // $40-60
            'dhara': 20 + Math.random() * 20     // $20-40
        };
        
        CRYPTO_COINS.forEach(coin => {
            const basePrice = basePrices[coin.id];
            initialPrices[coin.id] = {
                current: basePrice,
                previous: basePrice,
                change: 0
            };
            // Initialize with some data points for immediate graph display
            const initialLabels = ['0.0m'];
            const initialPriceData = [basePrice];
            for (let i = 1; i <= 10; i++) {
                initialLabels.push(`${(i * 0.5).toFixed(1)}m`);
                initialPriceData.push(basePrice + (Math.random() - 0.5) * 5);
            }
            initialHistory[coin.id] = {
                labels: initialLabels,
                prices: initialPriceData
            };
            // Start with stronger initial trends for immediate movement
            initialTrends[coin.id] = (Math.random() - 0.5) * 1.0; // Increased from 0.5
            initialTrades[coin.id] = [];
            initialVolumes[coin.id] = Math.random() * 100; // Start with some volume
            initialStats[coin.id] = {
                volume24h: Math.random() * 500,
                trades24h: Math.floor(Math.random() * 20),
                buyPressure: 30 + Math.random() * 40, // Random between 30-70
                volatility: 2 + Math.random() * 3 // Start with some volatility
            };
        });
        
        setPrices(initialPrices);
        setPriceHistory(initialHistory);
        setMarketTrends(initialTrends);
        setRecentTrades(initialTrades);
        setTradingVolumes(initialVolumes);
        setMarketStats(initialStats);
        
        console.log('Initial prices set:', initialPrices);
        console.log('Initial history set:', initialHistory);
        console.log('Initial trends set:', initialTrends);
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
    
    // Penalize leaving game (page unload/reload)
    useEffect(() => {
        const handleBeforeUnload = async (e) => {
            if (user && roomId) {
                // Deduct 100 credits for leaving
                try {
                    const { doc, updateDoc, increment } = await import('firebase/firestore');
                    const { db } = await import('@/db');
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, {
                        credits: increment(-100)
                    });
                } catch (error) {
                    console.error('Error deducting credits:', error);
                }
            }
            
            e.preventDefault();
            e.returnValue = '';
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [user, roomId]);

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
    
    // Update profit and carbon footprint whenever portfolio or prices change
    useEffect(() => {
        const currentProfit = calculateProfit(portfolio, Object.fromEntries(
            Object.entries(prices).map(([id, p]) => [id, p.current])
        ));
        setProfit(currentProfit);
        
        const currentFootprint = calculateCarbonFootprint(trades, portfolio.holdings);
        setCarbonFootprint(currentFootprint);
        
        console.log('Updated profit:', currentProfit, 'footprint:', currentFootprint);
    }, [portfolio, prices, trades]);

    const handleGameEnd = async () => {
        if (roomId && user) {
            const finalProfit = calculateProfit(portfolio, Object.fromEntries(
                Object.entries(prices).map(([id, p]) => [id, p.current])
            ));
            
            const myRank = leaderboardRank || liveLeaderboard.findIndex(p => p.userId === user.uid) + 1 || 1;
            const totalPlayers = liveLeaderboard.length || 1;
            
            // Calculate credits earned
            const creditsEarned = calculateCreditsEarned(myRank, totalPlayers, carbonScore, finalProfit);
            
            // Save game result to database
            try {
                const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
                const { db } = await import('@/db');
                
                const gameResultRef = doc(db, 'gameHistory', `${user.uid}_${Date.now()}`);
                await setDoc(gameResultRef, {
                    userId: user.uid,
                    roomId: roomId,
                    rank: myRank,
                    totalPlayers: totalPlayers,
                    carbonScore: carbonScore,
                    profit: finalProfit,
                    creditsEarned: creditsEarned,
                    playedAt: serverTimestamp(),
                    duration: GAME_CONFIG.GAME_DURATION,
                });
                
                // Update user's total credits
                const userRef = doc(db, 'users', user.uid);
                const { getDoc, updateDoc, increment } = await import('firebase/firestore');
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    await updateDoc(userRef, {
                        credits: increment(creditsEarned),
                        totalGames: increment(1),
                        ...(myRank === 1 ? { wins: increment(1) } : {})
                    });
                }
            } catch (error) {
                console.error('Error saving game result:', error);
            }
            
            await finishGame(roomId);
            router.push(`/results?roomId=${roomId}&credits=${creditsEarned}`);
        } else {
            router.push('/lobby');
        }
    };

    useEffect(() => {
        const priceInterval = setInterval(() => {
            console.log('Price update triggered');
            setPrices(prevPrices => {
                const newPrices = {};
                CRYPTO_COINS.forEach(coin => {
                    // Get news impact for this coin
                    const newsImpact = lastNewsImpact[coin.id] || 0;
                    const trend = marketTrends[coin.id] || 0;
                    const volume = tradingVolumes[coin.id] || 0;
                    
                    const oldPrice = prevPrices[coin.id]?.current || 50;
                    const newPrice = generatePriceMovement(
                        oldPrice, 
                        newsImpact,
                        trend,
                        volume
                    );
                    const change = ((newPrice - oldPrice) / oldPrice) * 100;
                    
                    console.log(`${coin.name}: $${oldPrice.toFixed(2)} → $${newPrice.toFixed(2)} (${change.toFixed(2)}%)`);
                    
                    newPrices[coin.id] = {
                        current: newPrice,
                        previous: oldPrice,
                        change: change
                    };
                });
                
                // Update price history immediately with new prices
                setPriceHistory(prevHistory => {
                    const newHistory = { ...prevHistory };
                    const elapsed = GAME_CONFIG.GAME_DURATION - timeLeft;
                    const timeLabel = `${(elapsed / 60).toFixed(1)}m`;
                    
                    CRYPTO_COINS.forEach(coin => {
                        if (!newHistory[coin.id]) {
                            newHistory[coin.id] = { labels: [], prices: [] };
                        }
                        newHistory[coin.id].labels.push(timeLabel);
                        newHistory[coin.id].prices.push(newPrices[coin.id]?.current || 50);
                        
                        // Keep last 50 data points for better graph
                        if (newHistory[coin.id].labels.length > 50) {
                            newHistory[coin.id].labels.shift();
                            newHistory[coin.id].prices.shift();
                        }
                    });
                    
                    return newHistory;
                });
                
                return newPrices;
            });
            
            // Gradually decay news impact
            setLastNewsImpact(prev => {
                const decayed = {};
                Object.keys(prev).forEach(coinId => {
                    decayed[coinId] = prev[coinId] * 0.8; // Decay by 20%
                });
                return decayed;
            });
            
            // Reset trading volumes after each price update
            setTradingVolumes({});
        }, GAME_CONFIG.PRICE_UPDATE_INTERVAL * 1000);

        return () => clearInterval(priceInterval);
    }, [timeLeft, lastNewsImpact, marketTrends, tradingVolumes]);

    const fetchNews = useCallback(async () => {
        setNewsLoading(true);
        try {
            const coin = CRYPTO_COINS[Math.floor(Math.random() * CRYPTO_COINS.length)];
            const trend = Math.random() > 0.5 ? 'bullish' : 'bearish';
            
            const response = await fetch('/api/generate-news', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ coinName: coin.name, trend })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
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
            } else {
                console.error('News generation failed:', data.error);
            }
        } catch (error) {
            console.error('Failed to fetch news:', error);
            toast({
                title: "News service unavailable",
                description: "Unable to fetch market news",
                status: "warning",
                duration: 3000,
            });
        } finally {
            setNewsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchNews();
        // News every 30-40 seconds
        const newsInterval = setInterval(fetchNews, 30000 + Math.random() * 10000);
        return () => clearInterval(newsInterval);
    }, [fetchNews]);
    
    // Bot trading activity - more frequent and competitive with score updates
    useEffect(() => {
        if (!roomId || !roomData || !roomData.players) return;
        
        const botPlayers = Object.values(roomData.players).filter(p => p.isBot);
        if (botPlayers.length === 0) return;
        
        const botTradingInterval = setInterval(async () => {
            // Multiple bots can trade at once
            const numBotsTrading = Math.min(botPlayers.length, Math.floor(Math.random() * 2) + 1);
            
            for (let i = 0; i < numBotsTrading; i++) {
                const bot = botPlayers[Math.floor(Math.random() * botPlayers.length)];
                const randomCoin = CRYPTO_COINS[Math.floor(Math.random() * CRYPTO_COINS.length)];
                const currentPrice = prices[randomCoin.id]?.current || 50;
                const trend = marketTrends[randomCoin.id] || 0;
                
                const botTrade = generateBotTrade(randomCoin.id, currentPrice, trend);
                
                // Calculate carbon score for bot trade
                const botScoreChange = calculateCarbonScore(botTrade);
                
                // Update bot's score in Firestore
                if (roomData.leaderboard && roomData.leaderboard[bot.userId]) {
                    const currentBotScore = roomData.leaderboard[bot.userId].carbonScore || 0;
                    await updatePlayerScore(
                        roomId, 
                        bot.userId, 
                        currentBotScore + botScoreChange,
                        0, // Bots don't track profit
                        {} // Bots don't track portfolio
                    );
                }
                
                // Add to recent trades
                setRecentTrades(prev => ({
                    ...prev,
                    [randomCoin.id]: [botTrade, ...(prev[randomCoin.id] || [])].slice(0, 20)
                }));
                
                // Update trading volume
                setTradingVolumes(prev => ({
                    ...prev,
                    [randomCoin.id]: (prev[randomCoin.id] || 0) + (botTrade.quantity * botTrade.price)
                }));
                
                // Update market stats
                setMarketStats(prev => {
                    const coinStats = prev[randomCoin.id] || { volume24h: 0, trades24h: 0, buyPressure: 50, volatility: 0 };
                    return {
                        ...prev,
                        [randomCoin.id]: {
                            ...coinStats,
                            volume24h: coinStats.volume24h + (botTrade.quantity * botTrade.price),
                            trades24h: coinStats.trades24h + 1,
                            buyPressure: botTrade.type === 'buy' ? 
                                Math.min(100, coinStats.buyPressure + 3) : 
                                Math.max(0, coinStats.buyPressure - 3)
                        }
                    };
                });
            }
        }, 2000 + Math.random() * 2000); // Bot trades every 2-4 seconds
        
        return () => clearInterval(botTradingInterval);
    }, [roomId, roomData, prices, marketTrends]);
    
    // Update order books and calculate volatility
    useEffect(() => {
        const orderBookInterval = setInterval(() => {
            const newOrderBooks = {};
            CRYPTO_COINS.forEach(coin => {
                const currentPrice = prices[coin.id]?.current || 50;
                const coinTrades = recentTrades[coin.id] || [];
                const newsImpact = lastNewsImpact[coin.id] || 0;
                const trend = marketTrends[coin.id] || 0;
                newOrderBooks[coin.id] = calculateOrderBook(coinTrades, currentPrice, newsImpact, trend);
            });
            setOrderBooks(newOrderBooks);
            
            // Calculate volatility from price history
            setMarketStats(prev => {
                const updated = { ...prev };
                CRYPTO_COINS.forEach(coin => {
                    const history = priceHistory[coin.id]?.prices || [];
                    if (history.length > 1) {
                        const recentPrices = history.slice(-10); // Last 10 data points
                        const changes = recentPrices.slice(1).map((price, i) => 
                            Math.abs((price - recentPrices[i]) / recentPrices[i] * 100)
                        );
                        const avgVolatility = changes.reduce((a, b) => a + b, 0) / changes.length;
                        
                        updated[coin.id] = {
                            ...(updated[coin.id] || { volume24h: 0, trades24h: 0, buyPressure: 50 }),
                            volatility: avgVolatility || 0
                        };
                    }
                });
                return updated;
            });
        }, 2000); // Update every 2 seconds
        
        return () => clearInterval(orderBookInterval);
    }, [prices, recentTrades, priceHistory, lastNewsImpact, marketTrends]);

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
        const trade = { type, coin: coin.id, quantity, price, timestamp: Date.now(), isBot: false };
        
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
        
        // Add to recent trades
        setRecentTrades(prev => ({
            ...prev,
            [coin.id]: [trade, ...(prev[coin.id] || [])].slice(0, 20)
        }));
        
        // Update trading volume
        setTradingVolumes(prev => ({
            ...prev,
            [coin.id]: (prev[coin.id] || 0) + (quantity * price)
        }));
        
        // Update market stats
        setMarketStats(prev => {
            const coinStats = prev[coin.id] || { volume24h: 0, trades24h: 0, buyPressure: 50, volatility: 0 };
            return {
                ...prev,
                [coin.id]: {
                    ...coinStats,
                    volume24h: coinStats.volume24h + (quantity * price),
                    trades24h: coinStats.trades24h + 1,
                    buyPressure: type === 'buy' ? 
                        Math.min(100, coinStats.buyPressure + 3) : 
                        Math.max(0, coinStats.buyPressure - 3)
                }
            };
        });
        
        toast({
            title: `${type === 'buy' ? 'Bought' : 'Sold'} ${quantity.toFixed(3)} ${coin.symbol}`,
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
                            <HStack spacing={6}>
                                <Stat>
                                    <StatLabel>{profit >= 0 ? 'Your Profit' : 'Your Loss'}</StatLabel>
                                    <StatNumber color={profit >= 0 ? "green.400" : "red.400"}>
                                        ${Math.abs(profit).toFixed(2)}
                                    </StatNumber>
                                    <StatHelpText>
                                        <StatArrow type={profit >= 0 ? "increase" : "decrease"} />
                                        {Math.abs((profit / GAME_CONFIG.INITIAL_BALANCE) * 100).toFixed(2)}%
                                    </StatHelpText>
                                </Stat>
                                
                                <Stat>
                                    <StatLabel>Carbon Footprint</StatLabel>
                                    <StatNumber color={carbonFootprint < 200 ? "green.400" : carbonFootprint < 400 ? "yellow.400" : "red.400"}>
                                        {carbonFootprint}
                                    </StatNumber>
                                    <StatHelpText>
                                        {carbonFootprint < 200 ? "Excellent" : carbonFootprint < 400 ? "Good" : "Poor"}
                                    </StatHelpText>
                                    <Box mt={2} w="150px">
                                        <Progress 
                                            value={(carbonFootprint / 1000) * 100} 
                                            colorScheme={carbonFootprint < 200 ? "green" : carbonFootprint < 400 ? "yellow" : "red"}
                                            size="sm"
                                            borderRadius="full"
                                        />
                                    </Box>
                                </Stat>
                            </HStack>
                            
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
                                <Button
                                    size="sm"
                                    colorScheme="red"
                                    variant="outline"
                                    mt={2}
                                    onClick={() => {
                                        if (confirm('Leave game? You will lose 100 credits and your progress will not be saved.')) {
                                            router.push('/dash');
                                        }
                                    }}
                                >
                                    Leave Game
                                </Button>
                            </Stat>
                            
                            <HStack spacing={6}>
                                <Stat textAlign="right">
                                    <StatLabel>
                                        <HStack justify="flex-end">
                                            <Text>Carbon Score</Text>
                                        </HStack>
                                    </StatLabel>
                                    <StatNumber color={carbonScore >= 0 ? "green.400" : "red.400"}>
                                        <HStack justify="flex-end">
                                            <StarIcon />
                                            <Text>{carbonScore}</Text>
                                        </HStack>
                                    </StatNumber>
                                    <StatHelpText>Rank: #{leaderboardRank || '—'}</StatHelpText>
                                </Stat>
                                
                                <VStack spacing={1} align="flex-end">
                                    <Text fontSize="xs" color="gray.400">Power-Ups</Text>
                                    <HStack spacing={1}>
                                        {Object.keys(activePowerUps).length === 0 ? (
                                            <Text fontSize="xs" color="gray.500">None active</Text>
                                        ) : (
                                            Object.keys(activePowerUps).map(powerUpId => {
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
                                                        boxSize={5}
                                                    />
                                                );
                                            })
                                        )}
                                    </HStack>
                                </VStack>
                            </HStack>
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

                        <Tabs variant="soft-rounded" colorScheme="green" size="sm">
                            <TabList>
                                <Tab fontSize="xs">Order Book</Tab>
                                <Tab fontSize="xs">Trades</Tab>
                                <Tab fontSize="xs">Depth</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel px={0}>
                                    <OrderBook 
                                        buyOrders={orderBooks[selectedCoin.id]?.buyOrders || []}
                                        sellOrders={orderBooks[selectedCoin.id]?.sellOrders || []}
                                        currentPrice={prices[selectedCoin.id]?.current}
                                    />
                                </TabPanel>
                                <TabPanel px={0}>
                                    <RecentTrades trades={recentTrades[selectedCoin.id] || []} />
                                </TabPanel>
                                <TabPanel px={0}>
                                    <MarketDepth 
                                        volume24h={marketStats[selectedCoin.id]?.volume24h || 0}
                                        trades24h={marketStats[selectedCoin.id]?.trades24h || 0}
                                        buyPressure={marketStats[selectedCoin.id]?.buyPressure || 50}
                                        volatility={marketStats[selectedCoin.id]?.volatility || 0}
                                    />
                                </TabPanel>
                            </TabPanels>
                        </Tabs>

                        <Divider />

                        <NewsPanel news={news} loading={newsLoading} />

                        <Divider />

                        <PlayerActivityFeed 
                            leaderboard={liveLeaderboard}
                            currentUserId={user?.uid}
                            recentTrades={recentTrades}
                            prices={prices}
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
