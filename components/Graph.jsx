import { Box } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

const Graph = ({ data, selectedCoin }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        
        chartInstance.current = new Chart(ctx, {
            type: "line",
            data: {
                labels: data?.labels || Array.from({ length: 20 }, (_, i) => `${i * 0.5}m`),
                datasets: [
                    {
                        label: selectedCoin?.name || "Price",
                        data: data?.prices || Array.from({ length: 20 }, () => Math.random() * 100 + 50),
                        borderWidth: 3,
                        borderColor: selectedCoin?.color || "#1CC880",
                        backgroundColor: `${selectedCoin?.color || "#1CC880"}20`,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: selectedCoin?.color || "#1CC880",
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: selectedCoin?.color || "#1CC880",
                        borderWidth: 1,
                    },
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                        },
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        },
                    },
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
            },
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data, selectedCoin]);

    return (
        <Box w="100%" h="100%">
            <canvas ref={chartRef}></canvas>
        </Box>
    );
};

export default Graph;
