import {
    VStack,
    HStack,
    Button,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Text,
    Box,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Divider,
} from "@chakra-ui/react";
import { ArrowUpIcon, ArrowDownIcon } from "@chakra-ui/icons";
import { useState } from "react";

const TradingPanel = ({ 
    selectedCoin, 
    balance, 
    holdings, 
    currentPrice, 
    onTrade 
}) => {
    const [quantity, setQuantity] = useState(0);
    const [loading, setLoading] = useState(false);

    const maxBuy = Math.floor(balance / currentPrice);
    const maxSell = holdings?.[selectedCoin?.id]?.quantity || 0;
    const totalCost = quantity * currentPrice;

    const handleTrade = async (type) => {
        if (quantity <= 0) return;
        
        setLoading(true);
        await onTrade(type, selectedCoin, quantity, currentPrice);
        setQuantity(0);
        setLoading(false);
    };

    return (
        <VStack spacing={4} w="100%" align="stretch">
            <Box bg="brandBlack.100" p={4} borderRadius="lg">
                <HStack justify="space-between" mb={4}>
                    <Stat>
                        <StatLabel fontSize="sm">Balance</StatLabel>
                        <StatNumber fontSize="2xl">${balance.toFixed(2)}</StatNumber>
                    </Stat>
                    <Stat>
                        <StatLabel fontSize="sm">Holdings</StatLabel>
                        <StatNumber fontSize="2xl">
                            {maxSell.toFixed(3)} {selectedCoin?.symbol}
                        </StatNumber>
                    </Stat>
                </HStack>

                <Divider my={3} />

                <VStack spacing={3} align="stretch">
                    <Box>
                        <Text fontSize="sm" mb={2} fontWeight="medium">
                            Quantity
                        </Text>
                        <NumberInput
                            value={quantity}
                            onChange={(_, val) => setQuantity(val)}
                            min={0}
                            max={Math.max(maxBuy, maxSell)}
                            step={0.001}
                            precision={3}
                        >
                            <NumberInputField 
                                bg="brandBlack.200" 
                                border="2px solid"
                                borderColor="gray.600"
                                _focus={{
                                    borderColor: "green.400"
                                }}
                            />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </Box>

                    <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.400">Total Cost:</Text>
                        <Text fontSize="md" fontWeight="bold">${totalCost.toFixed(2)}</Text>
                    </HStack>

                    <HStack spacing={2}>
                        <Button
                            leftIcon={<ArrowUpIcon />}
                            colorScheme="green"
                            flex={1}
                            onClick={() => handleTrade('buy')}
                            isDisabled={quantity <= 0 || totalCost > balance}
                            isLoading={loading}
                        >
                            Buy
                        </Button>
                        <Button
                            leftIcon={<ArrowDownIcon />}
                            colorScheme="red"
                            flex={1}
                            onClick={() => handleTrade('sell')}
                            isDisabled={quantity <= 0 || quantity > maxSell}
                            isLoading={loading}
                        >
                            Sell
                        </Button>
                    </HStack>

                    <HStack spacing={2} fontSize="xs">
                        <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => setQuantity(maxBuy * 0.25)}
                        >
                            25%
                        </Button>
                        <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => setQuantity(maxBuy * 0.5)}
                        >
                            50%
                        </Button>
                        <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => setQuantity(maxBuy * 0.75)}
                        >
                            75%
                        </Button>
                        <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => setQuantity(maxBuy)}
                        >
                            Max
                        </Button>
                    </HStack>
                </VStack>
            </Box>
        </VStack>
    );
};

export default TradingPanel;
