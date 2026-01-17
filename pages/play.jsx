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
} from "@chakra-ui/react";
import { TimeIcon, StarIcon } from "@chakra-ui/icons";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Protect from "@/components/Protect";
import Graph from "@/components/Graph";
import CoinSelector from "@/components/CoinSelector";
import TradingPanel from "@/components/TradingPanel";
import NewsPanel from "@/components/NewsPanel";
import { CRYPTO_COINS, GAME_CONFIG, calculateCarbonScore, calculateProfit, generatePriceMovement, calculateCarbonFootprint } from "@/utils/gameLogic";

const Play = ({ authed, user }) => {
    const router = useRouter();
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

    useEffect(() => {
        const initialPrices = {};
        const initialHistory = {};
        
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
        });
        
        setPrices(initialPrices);
        setPriceHistory(initialHistory);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    router.push('/won');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);

    useEffect(() => {
        const priceInterval = setInterval(() => {
            setPrices(prevPrices => {
                const newPrices = {};
                CRYPTO_COINS.forEach(coin => {
                    const newsImpact = Math.random() - 0.5;
                    const newPrice = generatePriceMovement(prevPrices[coin.id]?.current || 50, newsImpact);
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
                    
                    if (newHistory[coin.id].labels.length > 30) {
                        newHistory[coin.id].labels.shift();
                        newHistory[coin.id].prices.shift();
                    }
                });
                
                return newHistory;
            });
        }, GAME_CONFIG.PRICE_UPDATE_INTERVAL * 1000);

        return () => clearInterval(priceInterval);
    }, [timeLeft, prices]);

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
                    timestamp: data.timestamp
                }, ...prev].slice(0, 4));
            }
        } catch (error) {
            console.error('Failed to fetch news:', error);
        } finally {
            setNewsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNews();
        const newsInterval = setInterval(fetchNews, GAME_CONFIG.NEWS_UPDATE_INTERVAL * 1000);
        return () => clearInterval(newsInterval);
    }, [fetchNews]);

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
        
        const scoreChange = calculateCarbonScore(trade);
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
        <Protect authed={authed}>
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
                                <StatLabel>Carbon Score</StatLabel>
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

                        <Box bg="brandBlack.100" p={6} borderRadius="xl" h="500px">
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
                    backdropFilter="blur(10px)"
                    p={6}
                    overflowY="auto"
                    borderLeft="1px solid"
                    borderColor="whiteAlpha.200"
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

                        <NewsPanel news={news} loading={newsLoading} />
                    </VStack>
                </Box>
            </Flex>
        </Protect>
    );
};

export default Play;
