import { HStack, Button, Badge, Text, VStack } from "@chakra-ui/react";

const CoinSelector = ({ coins, selectedCoin, onSelect, prices }) => {
    return (
        <HStack spacing={3} w="100%" overflowX="auto" pb={2}>
            {coins.map((coin) => (
                <Button
                    key={coin.id}
                    onClick={() => onSelect(coin)}
                    variant={selectedCoin?.id === coin.id ? "solid" : "outline"}
                    colorScheme={selectedCoin?.id === coin.id ? "green" : "gray"}
                    size="md"
                    minW="140px"
                    h="auto"
                    py={3}
                    borderWidth={2}
                    borderColor={selectedCoin?.id === coin.id ? coin.color : "gray.600"}
                    _hover={{
                        transform: "translateY(-2px)",
                        borderColor: coin.color,
                    }}
                    transition="all 0.2s"
                >
                    <VStack spacing={1} align="stretch">
                        <Text fontWeight="bold" fontSize="sm">
                            {coin.symbol}
                        </Text>
                        <Badge
                            colorScheme={prices?.[coin.id]?.change >= 0 ? "green" : "red"}
                            fontSize="xs"
                        >
                            ${prices?.[coin.id]?.current?.toFixed(2) || "0.00"}
                        </Badge>
                    </VStack>
                </Button>
            ))}
        </HStack>
    );
};

export default CoinSelector;
