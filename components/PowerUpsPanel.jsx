import { Box, VStack, HStack, Text, Button, Icon, Badge, Tooltip, useToast } from "@chakra-ui/react";
import { TimeIcon, ViewIcon, StarIcon, InfoIcon } from "@chakra-ui/icons";
import { POWER_UPS } from "@/utils/gameLogic";
import { useState, useEffect } from "react";

const PowerUpsPanel = ({ ownedPowerUps = [], onUsePowerUp }) => {
    const toast = useToast();
    const [activePowerUps, setActivePowerUps] = useState({});
    const [cooldowns, setCooldowns] = useState({});

    const iconMap = {
        time: TimeIcon,
        view: ViewIcon,
        star: StarIcon,
        info: InfoIcon,
    };

    useEffect(() => {
        // Update active power-ups timers
        const interval = setInterval(() => {
            setActivePowerUps(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(id => {
                    if (updated[id] <= 0) {
                        delete updated[id];
                        toast({
                            title: 'Power-up expired',
                            description: `${POWER_UPS.find(p => p.id === id)?.name} has worn off`,
                            status: 'info',
                            duration: 2000,
                        });
                    } else {
                        updated[id] -= 1000;
                    }
                });
                return updated;
            });

            setCooldowns(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(id => {
                    if (updated[id] <= 0) {
                        delete updated[id];
                    } else {
                        updated[id] -= 1000;
                    }
                });
                return updated;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [toast]);

    const handleUsePowerUp = (powerUp) => {
        if (activePowerUps[powerUp.id]) {
            toast({
                title: 'Already active',
                description: `${powerUp.name} is already in use`,
                status: 'warning',
                duration: 2000,
            });
            return;
        }

        if (cooldowns[powerUp.id]) {
            toast({
                title: 'Cooldown active',
                description: `Wait ${Math.ceil(cooldowns[powerUp.id] / 1000)}s before using again`,
                status: 'warning',
                duration: 2000,
            });
            return;
        }

        setActivePowerUps(prev => ({
            ...prev,
            [powerUp.id]: powerUp.duration
        }));

        setCooldowns(prev => ({
            ...prev,
            [powerUp.id]: powerUp.duration + 30000 // 30s cooldown after duration
        }));

        onUsePowerUp(powerUp);

        toast({
            title: 'Power-up activated!',
            description: powerUp.description,
            status: 'success',
            duration: 3000,
        });
    };

    const availablePowerUps = POWER_UPS.filter(p => ownedPowerUps.includes(p.id));

    if (availablePowerUps.length === 0) {
        return (
            <Box
                bg="brandBlack.100"
                backdropFilter="blur(10px)"
                p={4}
                borderRadius="xl"
                borderWidth={2}
                borderColor="whiteAlpha.200"
            >
                <Text fontSize="sm" fontWeight="bold" mb={2}>Power-Ups</Text>
                <Text fontSize="xs" color="gray.500" textAlign="center" py={4}>
                    No power-ups available. Purchase them from your profile!
                </Text>
            </Box>
        );
    }

    return (
        <Box
            bg="brandBlack.100"
            backdropFilter="blur(10px)"
            p={4}
            borderRadius="xl"
            borderWidth={2}
            borderColor="whiteAlpha.200"
        >
            <Text fontSize="sm" fontWeight="bold" mb={3}>Power-Ups</Text>
            <VStack spacing={2} align="stretch">
                {availablePowerUps.map((powerUp) => {
                    const IconComponent = iconMap[powerUp.icon];
                    const isActive = !!activePowerUps[powerUp.id];
                    const onCooldown = !!cooldowns[powerUp.id];
                    const timeLeft = isActive ? Math.ceil(activePowerUps[powerUp.id] / 1000) : 
                                    onCooldown ? Math.ceil(cooldowns[powerUp.id] / 1000) : 0;

                    return (
                        <Tooltip 
                            key={powerUp.id} 
                            label={powerUp.description}
                            placement="left"
                        >
                            <Button
                                size="sm"
                                leftIcon={<Icon as={IconComponent} />}
                                onClick={() => handleUsePowerUp(powerUp)}
                                isDisabled={isActive || onCooldown}
                                colorScheme={isActive ? "green" : "gray"}
                                variant={isActive ? "solid" : "outline"}
                                w="full"
                                justifyContent="space-between"
                                rightIcon={
                                    (isActive || onCooldown) ? (
                                        <Badge colorScheme={isActive ? "green" : "orange"} fontSize="xs">
                                            {timeLeft}s
                                        </Badge>
                                    ) : null
                                }
                            >
                                <Text fontSize="xs">{powerUp.name}</Text>
                            </Button>
                        </Tooltip>
                    );
                })}
            </VStack>
        </Box>
    );
};

export default PowerUpsPanel;
