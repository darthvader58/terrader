import { Box, VStack, Text, HStack, Badge, Spinner } from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";

const NewsPanel = ({ news, loading }) => {
    return (
        <VStack spacing={3} w="100%" align="stretch">
            <HStack>
                <InfoIcon color="blue.400" />
                <Text fontWeight="bold" fontSize="md">
                    Market News
                </Text>
            </HStack>
            
            {loading ? (
                <Box textAlign="center" py={4}>
                    <Spinner color="green.400" />
                </Box>
            ) : (
                news.map((item, i) => (
                    <Box
                        key={i}
                        bg="brandBlack.100"
                        p={4}
                        borderRadius="lg"
                        borderLeft="4px solid"
                        borderColor="green.400"
                        _hover={{
                            bg: "brandBlack.200",
                            transform: "translateX(4px)",
                        }}
                        transition="all 0.2s"
                    >
                        <HStack justify="space-between" mb={2} align="start" spacing={2}>
                            <Badge colorScheme="green" fontSize="xs">
                                {item.coin}
                            </Badge>
                            <Text fontSize="xs" color="gray.400" flexShrink={0}>
                                {new Date(item.timestamp).toLocaleTimeString()}
                            </Text>
                        </HStack>
                        <Text fontSize="sm" fontWeight="medium" lineHeight="tall">
                            {item.news}
                        </Text>
                    </Box>
                ))
            )}
        </VStack>
    );
};

export default NewsPanel;
