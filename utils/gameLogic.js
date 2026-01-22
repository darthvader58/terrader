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

export function generateBotTrade(coinId, currentPrice, marketTrend, priceChange = 0, carbonScore = 0, balance = 500, holdings = {}) {
    // Advanced bot decision-making system
    // Bots aim to maximize carbon score while managing risk
    
    let tradeScore = 0; // Score to determine if we should trade
    let buyProbability = 0.5; // Start neutral
    
    // 1. MARKET TREND ANALYSIS (40% weight)
    if (marketTrend > 0.4) {
        buyProbability = 0.90; // Very bullish - strong buy
        tradeScore += 40;
    } else if (marketTrend > 0.2) {
        buyProbability = 0.75; // Bullish - buy
        tradeScore += 30;
    } else if (marketTrend > 0) {
        buyProbability = 0.60; // Slightly bullish
        tradeScore += 15;
    } else if (marketTrend < -0.4) {
        buyProbability = 0.10; // Very bearish - strong sell
        tradeScore += 40;
    } else if (marketTrend < -0.2) {
        buyProbability = 0.25; // Bearish - sell
        tradeScore += 30;
    } else if (marketTrend < 0) {
        buyProbability = 0.40; // Slightly bearish
        tradeScore += 15;
    }
    
    // 2. MOMENTUM TRADING (30% weight)
    if (priceChange > 8) {
        buyProbability += 0.20; // Strong upward momentum
        tradeScore += 30;
    } else if (priceChange > 4) {
        buyProbability += 0.12; // Moderate upward momentum
        tradeScore += 20;
    } else if (priceChange < -8) {
        buyProbability -= 0.20; // Strong downward momentum
        tradeScore += 30;
    } else if (priceChange < -4) {
        buyProbability -= 0.12; // Moderate downward momentum
        tradeScore += 20;
    }
    
    // 3. PRICE LEVEL STRATEGY (20% weight)
    if (currentPrice < 35) {
        buyProbability += 0.15; // Cheap - buy opportunity
        tradeScore += 20;
    } else if (currentPrice < 50) {
        buyProbability += 0.08;
        tradeScore += 10;
    } else if (currentPrice > 90) {
        buyProbability -= 0.15; // Expensive - sell opportunity
        tradeScore += 20;
    } else if (currentPrice > 75) {
        buyProbability -= 0.08;
        tradeScore += 10;
    }
    
    // 4. CARBON SCORE OPTIMIZATION (10% weight)
    // Bots prioritize selling to increase carbon score
    if (carbonScore < 50) {
        // Low carbon score - prioritize selling
        buyProbability -= 0.10;
        tradeScore += 10;
    } else if (carbonScore > 150) {
        // High carbon score - can afford to buy
        buyProbability += 0.05;
    }
    
    // 5. PORTFOLIO MANAGEMENT
    const currentHolding = holdings[coinId]?.quantity || 0;
    const portfolioValue = balance + (currentHolding * currentPrice);
    
    // Don't buy if low on balance
    if (balance < portfolioValue * 0.2) {
        buyProbability -= 0.15;
    }
    
    // Sell if holding too much of one coin
    if (currentHolding * currentPrice > portfolioValue * 0.4) {
        buyProbability -= 0.20;
    }
    
    // Clamp probability
    buyProbability = Math.max(0, Math.min(1, buyProbability));
    
    // Decide trade type
    const shouldBuy = Math.random() < buyProbability;
    
    // Only trade if score is high enough (bots are selective)
    if (tradeScore < 15 && Math.random() > 0.3) {
        // Skip this trade opportunity (30% chance to skip low-score trades)
        return null;
    }
    
    // SMART QUANTITY CALCULATION
    let quantity;
    
    if (shouldBuy) {
        // Calculate optimal buy quantity
        const maxAffordable = balance / currentPrice;
        const targetInvestment = balance * 0.15; // Invest 15% of balance
        const targetQuantity = targetInvestment / currentPrice;
        
        // Adjust based on confidence
        const confidence = Math.abs(marketTrend) + (Math.abs(priceChange) / 10);
        const adjustedQuantity = targetQuantity * (0.5 + confidence);
        
        quantity = Math.min(adjustedQuantity, maxAffordable * 0.8); // Max 80% of affordable
        quantity = Math.max(0.5, quantity); // Minimum 0.5 units
    } else {
        // Calculate optimal sell quantity
        const availableToSell = currentHolding;
        if (availableToSell < 0.1) {
            return null; // Nothing to sell
        }
        
        // Sell 20-60% of holdings based on confidence
        const confidence = Math.abs(marketTrend) + (Math.abs(priceChange) / 10);
        const sellPercentage = 0.2 + (confidence * 0.4);
        
        quantity = availableToSell * sellPercentage;
        quantity = Math.max(0.5, Math.min(quantity, availableToSell));
    }
    
    // Round to 3 decimals
    quantity = parseFloat(quantity.toFixed(3));
    
    return {
        type: shouldBuy ? 'buy' : 'sell',
        coin: coinId,
        quantity: quantity,
        price: currentPrice,
        timestamp: Date.now(),
        isBot: true,
        confidence: tradeScore
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
    console.log('Calculating credits:', { rank, totalPlayers, carbonScore, profit });
    
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
    
    console.log('Base credits:', credits);
    
    // Bonus for positive carbon score (max +50)
    let carbonBonus = 0;
    if (carbonScore > 0) {
        carbonBonus = Math.min(50, Math.floor(carbonScore / 10));
        credits += carbonBonus;
    }
    
    console.log('Carbon bonus:', carbonBonus, 'Total after carbon:', credits);
    
    // Bonus for profit (max +50)
    let profitBonus = 0;
    if (profit > 0) {
        profitBonus = Math.min(50, Math.floor(profit / 10));
        credits += profitBonus;
    }
    
    console.log('Profit bonus:', profitBonus, 'Total after profit:', credits);
    
    // Minimum 10 credits for participation
    const finalCredits = Math.max(10, credits);
    console.log('Final credits earned:', finalCredits);
    
    return finalCredits;
}
