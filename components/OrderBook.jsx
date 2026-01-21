import { Box, VStack, HStack, Text, Divider, Grid, GridItem } from "@chakra-ui/react";
import { ArrowUpIcon, ArrowDownIcon } from "@chakra-ui/icons";

const OrderBook = ({ buyOrders = [], sellOrders = [], currentPrice }) => {
    return (
        <Box
            bg="brandBlack.100"
            backdropFilter="blur(10px)"
            p={4}
            borderRadius="xl"
            borderWidth={2}
            borderColor="whiteAlpha.200"
        >
            <Text fontSize="sm" fontWeight="bold" mb={3}>Order Book</Text>
            
            <VStack spacing={2} align="stretch">
                {/* Sell Orders (asks) - shown in reverse */}
                <Box>
                    <Grid templateColumns="1fr 1fr 1fr" gap={2} mb={1}>
                        <Text fontSize="xs" color="gray.500">Price</Text>
                        <Text fontSize="xs" color="gray.500" textAlign="right">Amount</Text>
                        <Text fontSize="xs" color="gray.500" textAlign="right">Total</Text>
                    </Grid>
                    {sellOrders.slice(0, 5).reverse().map((order, i) => (
                        <Grid 
                            key={`sell-${i}`} 
                            templateColumns="1fr 1fr 1fr" 
                            gap={2}
                            py={1}
                            fontSize="xs"
                            _hover={{ bg: "brandBlack.200" }}
                        >
                            <Text color="red.400" fontWeight="medium">
                                ${order.price}
                            </Text>
                            <Text textAlign="right" color="gray.300">
                                {order.quantity}
                            </Text>
                            <Text textAlign="right" color="gray.400">
                                ${order.total}
                            </Text>
                        </Grid>
                    ))}
                </Box>

                {/* Current Price */}
                <Box 
                    bg="green.900" 
                    p={2} 
                    borderRadius="md"
                    borderWidth={2}
                    borderColor="green.400"
                >
                    <HStack justify="center">
                        <ArrowUpIcon color="green.400" boxSize={3} />
                        <Text fontSize="md" fontWeight="bold" color="green.400">
                            ${currentPrice?.toFixed(2) || '0.00'}
                        </Text>
                    </HStack>
                </Box>

                {/* Buy Orders (bids) */}
                <Box>
                    {buyOrders.slice(0, 5).map((order, i) => (
                        <Grid 
                            key={`buy-${i}`} 
                            templateColumns="1fr 1fr 1fr" 
                            gap={2}
                            py={1}
                            fontSize="xs"
                            _hover={{ bg: "brandBlack.200" }}
                        >
                            <Text color="green.400" fontWeight="medium">
                                ${order.price}
                            </Text>
                            <Text textAlign="right" color="gray.300">
                                {order.quantity}
                            </Text>
                            <Text textAlign="right" color="gray.400">
                                ${order.total}
                            </Text>
                        </Grid>
                    ))}
                </Box>
            </VStack>
        </Box>
    );
};

export default OrderBook;
