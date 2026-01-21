import { Box, VStack, HStack, Text, Progress, Stat, StatLabel, StatNumber, StatHelpText, StatArrow } from "@chakra-ui/react";
import { FaChartBar } from "react-icons/fa";
import { Icon } from "@chakra-ui/react";

const MarketDepth = ({ volume24h = 0, trades24h = 0, buyPressure = 50, volatility = 0 }) => {
    const buyPercentage = Math.min(100, Math.max(0, buyPressure));
    const sellPercentage = 100 - buyPercentage;
    
    const sentiment = buyPercentage > 60 ? "Bullish" : 
                     buyPercentage < 40 ? "Bearish" : "Neutral";
    
    const sentimentColor = buyPercentage > 60 ? "green" : 
                          buyPercentage < 40 ? "red" : "yellow";

    return (
        <Box
            bg="brandBlack.100"
            backdropFilter="blur(10px)"
            p={4}
            borderRadius="xl"
            borderWidth={2}
            borderColor="whiteAlpha.200"
        >
            <HStack mb={3}>
                <Icon as={FaChartBar} color="blue.400" />
                <Text fontSize="sm" fontWeight="bold">Market Depth</Text>
            </HStack>
            
            <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                    <Stat size="sm">
                        <StatLabel fontSize="xs">24h Volume</StatLabel>
                        <StatNumber fontSize="md">${volume24h.toFixed(0)}</StatNumber>
                    </Stat>
                    <Stat size="sm" textAlign="right">
                        <StatLabel fontSize="xs">24h Trades</StatLabel>
                        <StatNumber fontSize="md">{trades24h}</StatNumber>
                    </Stat>
                </HStack>

                <Box>
                    <HStack justify="space-between" mb={2}>
                        <Text fontSize="xs" color="gray.400">Market Sentiment</Text>
                        <Text fontSize="xs" fontWeight="bold" color={`${sentimentColor}.400`}>
                            {sentiment}
                        </Text>
                    </HStack>
                    <HStack spacing={0}>
                        <Box flex={buyPercentage} bg="green.500" h="6px" borderLeftRadius="full" />
                        <Box flex={sellPercentage} bg="red.500" h="6px" borderRightRadius="full" />
                    </HStack>
                    <HStack justify="space-between" mt={1}>
                        <Text fontSize="xs" color="green.400">{buyPercentage.toFixed(0)}% Buy</Text>
                        <Text fontSize="xs" color="red.400">{sellPercentage.toFixed(0)}% Sell</Text>
                    </HStack>
                </Box>

                <Stat size="sm">
                    <StatLabel fontSize="xs">Volatility</StatLabel>
                    <StatNumber fontSize="md" color={volatility > 5 ? "red.400" : "green.400"}>
                        {volatility.toFixed(2)}%
                    </StatNumber>
                    <StatHelpText fontSize="xs">
                        {volatility > 5 ? "High" : volatility > 2 ? "Medium" : "Low"}
                    </StatHelpText>
                </Stat>
            </VStack>
        </Box>
    );
};

export default MarketDepth;
