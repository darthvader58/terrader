export const CRYPTO_COINS = [
    { id: 'terra', name: 'TerraCoin', symbol: 'TRC', color: '#1CC880' },
    { id: 'gaia', name: 'Gaiacoin', symbol: 'GIA', color: '#4299E1' },
    { id: 'enviro', name: 'Envirocoin', symbol: 'ENV', color: '#9F7AEA' },
    { id: 'dhara', name: 'DharaCoin', symbol: 'DHR', color: '#F6AD55' }
];

export const GAME_CONFIG = {
    INITIAL_BALANCE: 500,
    GAME_DURATION: 20 * 60, // Changed from 15 to 20 minutes
    LEADERBOARD_UPDATE_INTERVAL: 2 * 60,
    NEWS_UPDATE_INTERVAL: 30,
    PRICE_UPDATE_INTERVAL: 2, // 2 seconds for dynamic prices
};

export const POWER_UPS = [
    { 
        id: 'time_freeze', 
        name: 'Time Freeze', 
        cost: 10, 
        icon: 'time', 
        description: 'Freeze prices for 30 seconds',
        duration: 30000,
        color: '#1CC880'
    },
    { 
        id: 'price_peek', 
        name: 'Price Insight', 
        cost: 10, 
        icon: 'view', 
        description: 'See next price movement trend',
        duration: 60000,
        color: '#00FF9D'
    },
    { 
        id: 'carbon_boost', 
        name: 'Carbon Multiplier', 
        cost: 15, 
        icon: 'star', 
        description: 'Double carbon score for 1 minute',
        duration: 60000,
        multiplier: 2,
        color: '#4299E1'
    },
    { 
        id: 'news_insight', 
        name: 'Market Analysis', 
        cost: 25, 
        icon: 'info', 
        description: 'Get detailed market analysis',
        duration: 90000,
        color: '#9F7AEA'
    }
];

export const ACHIEVEMENTS = [
    { id: 'win_5x', name: '5x Winner', description: 'Win 5 games', icon: '🏆', requirement: 5 },
    { id: 'win_100x', name: '100x Champion', description: 'Win 100 games', icon: '💎', requirement: 100 },
    { id: 'carbon_1k', name: 'Carbon Master', description: 'Earn 1000 carbon score', icon: '🌍', requirement: 1000 },
];

export function calculateCarbonScore(trade) {
    const { type, coin, quantity, price } = trade;
    
    let baseScore = 0;
    const tradeValue = quantity * price;
    
    if (type === 'buy') {
        baseScore = -Math.floor(tradeValue * 0.1);
    } else {
        baseScore = Math.floor(tradeValue * 0.15);
    }
    
    const coinMultiplier = {
        'terra': 1.2,
        'gaia': 1.0,
        'enviro': 0.8,
        'dhara': 0.9
    };
    
    return Math.floor(baseScore * (coinMultiplier[coin] || 1));
}

export function calculateProfit(portfolio, currentPrices) {
    let totalValue = portfolio.balance;
    
    Object.keys(portfolio.holdings).forEach(coinId => {
        const holding = portfolio.holdings[coinId];
        const currentPrice = currentPrices[coinId];
        
        if (currentPrice && holding.quantity > 0) {
            const holdingValue = holding.quantity * currentPrice;
            totalValue += holdingValue;
            console.log(`${coinId}: ${holding.quantity} × $${currentPrice} = $${holdingValue.toFixed(2)}`);
        }
    });
    
    const profit = totalValue - GAME_CONFIG.INITIAL_BALANCE;
    console.log(`Total value: $${totalValue.toFixed(2)}, Initial: $${GAME_CONFIG.INITIAL_BALANCE}, Profit: $${profit.toFixed(2)}`);
    
    return profit;
}

export function generatePriceMovement(currentPrice, newsImpact = 0, marketTrend = 0, tradingVolume = 0) {
    // Much higher base volatility for visible price changes
    const baseVolatility = 0.15; // Increased from 0.08 to 0.15 (15% swings)
    const randomChange = (Math.random() - 0.5) * 2 * baseVolatility;
    
    // News has massive impact (up to 12% change)
    const newsInfluence = newsImpact * 0.12; // Increased from 0.08
    
    // Market trend provides strong direction
    const trendInfluence = marketTrend * 0.06; // Increased from 0.04
    
    // Trading volume affects volatility significantly
    const volumeInfluence = tradingVolume * 0.003; // Increased from 0.002
    
    // Add constant movement to ensure prices never stay flat
    const constantMovement = (Math.random() - 0.5) * 0.02; // ±1% minimum movement
    
    const totalChange = randomChange + newsInfluence + trendInfluence + volumeInfluence + constantMovement;
    const newPrice = currentPrice * (1 + totalChange);
    
    // Ensure price stays within reasonable bounds
    return Math.max(10, Math.min(200, Number(newPrice.toFixed(2))));
}

export function generateBotTrade(coinId, currentPrice, marketTrend, priceChange = 0) {
    // Bots make smarter decisions based on multiple factors
    let buyProbability = 0.5; // Start neutral
    
    // Strong bullish trend increases buy probability
    if (marketTrend > 0.3) {
        buyProbability = 0.85; // 85% chance to buy
    } else if (marketTrend > 0.1) {
        buyProbability = 0.70; // 70% chance to buy
    } else if (marketTrend < -0.3) {
        buyProbability = 0.15; // 15% chance to buy (sell more)
    } else if (marketTrend < -0.1) {
        buyProbability = 0.30; // 30% chance to buy
    }
    
    // Recent price increase = more likely to buy (momentum trading)
    if (priceChange > 5) {
        buyProbability += 0.15;
    } else if (priceChange < -5) {
        buyProbability -= 0.15;
    }
    
    // Price level affects decision (buy low, sell high)
    if (currentPrice < 40) {
        buyProbability += 0.10; // Cheaper = more likely to buy
    } else if (currentPrice > 80) {
        buyProbability -= 0.10; // Expensive = less likely to buy
    }
    
    // Clamp between 0 and 1
    buyProbability = Math.max(0, Math.min(1, buyProbability));
    
    const shouldBuy = Math.random() < buyProbability;
    
    // Smarter quantity based on price and decision confidence
    let baseQuantity = 5;
    if (currentPrice < 30) {
        baseQuantity = 10; // Buy more of cheap coins
    } else if (currentPrice > 80) {
        baseQuantity = 3; // Buy less of expensive coins
    }
    
    const quantity = (Math.random() * baseQuantity + 2).toFixed(3); // 2-12 units with 3 decimals
    
    return {
        type: shouldBuy ? 'buy' : 'sell',
        coin: coinId,
        quantity: parseFloat(quantity),
        price: currentPrice,
        timestamp: Date.now(),
        isBot: true
    };
}

export function calculateOrderBook(recentTrades, currentPrice, newsImpact = 0, marketTrend = 0) {
    // Generate realistic order book based on recent trades and market conditions
    const buyOrders = [];
    const sellOrders = [];
    
    // Adjust order book based on market sentiment
    const bullishMarket = newsImpact > 0 || marketTrend > 0;
    const bearishMarket = newsImpact < 0 || marketTrend < 0;
    
    // More buy orders in bullish market, more sell orders in bearish
    const buyOrderCount = bullishMarket ? 7 : bearishMarket ? 3 : 5;
    const sellOrderCount = bearishMarket ? 7 : bullishMarket ? 3 : 5;
    
    // Generate buy orders below current price
    for (let i = 1; i <= buyOrderCount; i++) {
        const priceLevel = currentPrice * (1 - (i * 0.005)); // 0.5% intervals
        const baseQuantity = bullishMarket ? 15 : 8; // More volume in bullish
        const quantity = (Math.random() * baseQuantity + 5).toFixed(2);
        buyOrders.push({
            price: priceLevel.toFixed(2),
            quantity: parseFloat(quantity),
            total: (priceLevel * quantity).toFixed(2)
        });
    }
    
    // Generate sell orders above current price
    for (let i = 1; i <= sellOrderCount; i++) {
        const priceLevel = currentPrice * (1 + (i * 0.005)); // 0.5% intervals
        const baseQuantity = bearishMarket ? 15 : 8; // More volume in bearish
        const quantity = (Math.random() * baseQuantity + 5).toFixed(2);
        sellOrders.push({
            price: priceLevel.toFixed(2),
            quantity: parseFloat(quantity),
            total: (priceLevel * quantity).toFixed(2)
        });
    }
    
    return { buyOrders, sellOrders };
}

export function calculateCarbonFootprint(trades, holdings) {
    let footprint = 0;
    
    // Each trade adds to footprint (reduced scale)
    trades.forEach(trade => {
        footprint += Math.abs(trade.quantity * trade.price * 0.001); // Reduced from 0.01
    });
    
    // Holding coins reduces footprint over time
    Object.values(holdings).forEach(holding => {
        footprint -= holding.quantity * 0.0005; // Reduced from 0.002
    });
    
    // Return absolute value, lower is better
    // Scale: 0-5 Excellent, 5-15 Good, 15-20 Fair, 20+ Bad
    return Math.max(0, Math.floor(footprint * 10) / 10); // Keep 1 decimal
}

export function calculateCarbonScorePenalty(carbonFootprint) {
    // Higher footprint = bigger penalty to carbon score
    // Scale: 0-5 = no penalty, 5-15 = -10 to -30, 15-20 = -30 to -50, 20+ = -50+
    if (carbonFootprint < 5) {
        return 0; // Excellent - no penalty
    } else if (carbonFootprint < 15) {
        return -Math.floor((carbonFootprint - 5) * 2); // -2 to -20
    } else if (carbonFootprint < 20) {
        return -20 - Math.floor((carbonFootprint - 15) * 6); // -20 to -50
    } else {
        return -50 - Math.floor((carbonFootprint - 20) * 5); // -50 and worse
    }
}

export function calculateCreditsEarned(rank, totalPlayers, carbonScore, profit) {
    // Base credits based on rank
    let credits = 0;
    
    if (rank === 1) {
        credits = 100; // 1st place
    } else if (rank === 2) {
        credits = 75; // 2nd place
    } else if (rank === 3) {
        credits = 50; // 3rd place
    } else if (rank <= totalPlayers / 2) {
        credits = 30; // Top half
    } else {
        credits = 10; // Bottom half
    }
    
    // Bonus for positive carbon score (max +50)
    if (carbonScore > 0) {
        credits += Math.min(50, Math.floor(carbonScore / 10));
    }
    
    // Bonus for profit (max +50)
    if (profit > 0) {
        credits += Math.min(50, Math.floor(profit / 10));
    }
    
    // Minimum 10 credits for participation
    return Math.max(10, credits);
}
