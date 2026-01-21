import { Box, VStack, HStack, Text, Progress, Icon, Tooltip } from "@chakra-ui/react";
import { FaLeaf, FaIndustry } from "react-icons/fa";
import Image from "next/image";

const CarbonMeter = ({ carbonScore, carbonFootprint, maxFootprint = 1000 }) => {
    const footprintPercentage = (carbonFootprint / maxFootprint) * 100;
    const rating = carbonFootprint < 200 ? "Excellent" : 
                   carbonFootprint < 400 ? "Good" : 
                   carbonFootprint < 700 ? "Fair" : "Poor";
    
    const ratingColor = carbonFootprint < 200 ? "green" : 
                        carbonFootprint < 400 ? "blue" : 
                        carbonFootprint < 700 ? "yellow" : "red";

    return (
        <Box
            bg="brandBlack.100"
            backdropFilter="blur(10px)"
            p={4}
            borderRadius="xl"
            borderWidth={2}
            borderColor="whiteAlpha.200"
        >
            <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                    <HStack>
                        <Image 
                            src="/assets/carbon_credits.svg" 
                            width={24} 
                            height={24} 
                            alt="Carbon"
                        />
                        <Text fontWeight="bold" fontSize="lg">Carbon Score</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color="green.400">
                        {carbonScore}
                    </Text>
                </HStack>

                <Box>
                    <HStack justify="space-between" mb={2}>
                        <HStack>
                            <Icon 
                                as={carbonFootprint < 400 ? FaLeaf : FaIndustry} 
                                color={carbonFootprint < 400 ? "green.400" : "red.400"}
                            />
                            <Text fontSize="sm" color="gray.400">Carbon Footprint</Text>
                        </HStack>
                        <Tooltip label={`${carbonFootprint} / ${maxFootprint}`}>
                            <Text fontSize="sm" fontWeight="bold" color={`${ratingColor}.400`}>
                                {rating}
                            </Text>
                        </Tooltip>
                    </HStack>
                    <Progress 
                        value={footprintPercentage} 
                        colorScheme={ratingColor}
                        size="sm"
                        borderRadius="full"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                        {carbonFootprint.toFixed(0)} units
                    </Text>
                </Box>
            </VStack>
        </Box>
    );
};

export default CarbonMeter;
