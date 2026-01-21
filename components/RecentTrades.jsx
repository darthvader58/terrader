import { Box, VStack, HStack, Text, Badge, Icon } from "@chakra-ui/react";
import { ArrowUpIcon, ArrowDownIcon } from "@chakra-ui/icons";
import { FaRobot, FaUser } from "react-icons/fa";

const RecentTrades = ({ trades = [] }) => {
    return (
        <Box
            bg="brandBlack.100"
            backdropFilter="blur(10px)"
            p={4}
            borderRadius="xl"
            borderWidth={2}
            borderColor="whiteAlpha.200"
            maxH="250px"
            overflowY="auto"
        >
            <Text fontSize="sm" fontWeight="bold" mb={3}>Recent Trades</Text>
            
            {trades.length === 0 ? (
                <Text fontSize="xs" color="gray.500" textAlign="center" py={4}>
                    No trades yet
                </Text>
            ) : (
                <VStack spacing={1} align="stretch">
                    {trades.slice(0, 10).map((trade, i) => (
                        <HStack
                            key={`${trade.timestamp}-${i}`}
                            justify="space-between"
                            py={1}
                            px={2}
                            borderRadius="md"
                            bg={trade.type === 'buy' ? 'green.900' : 'red.900'}
                            borderLeft="3px solid"
                            borderColor={trade.type === 'buy' ? 'green.400' : 'red.400'}
                            fontSize="xs"
                        >
                            <HStack spacing={2}>
                                <Icon 
                                    as={trade.isBot ? FaRobot : FaUser} 
                                    boxSize={3}
                                    color="gray.400"
                                />
                                <Icon 
                                    as={trade.type === 'buy' ? ArrowUpIcon : ArrowDownIcon}
                                    color={trade.type === 'buy' ? 'green.400' : 'red.400'}
                                    boxSize={3}
                                />
                                <Text color={trade.type === 'buy' ? 'green.400' : 'red.400'}>
                                    {trade.type.toUpperCase()}
                                </Text>
                            </HStack>
                            <HStack spacing={2}>
                                <Text color="gray.300">{trade.quantity.toFixed(2)}</Text>
                                <Text color="gray.400">@</Text>
                                <Text fontWeight="medium">${trade.price.toFixed(2)}</Text>
                            </HStack>
                        </HStack>
                    ))}
                </VStack>
            )}
        </Box>
    );
};

export default RecentTrades;
