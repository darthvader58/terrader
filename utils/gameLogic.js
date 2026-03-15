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

const COIN_MARKET_PROFILES = {
    terra: {
        fairValue: 92,
        miningIntensity: 1.3,
        liquidity: 1.1,
        volatility: 0.022,
    },
    gaia: {
        fairValue: 72,
        miningIntensity: 1.0,
        liquidity: 1.0,
        volatility: 0.018,
    },
    enviro: {
        fairValue: 52,
        miningIntensity: 0.65,
        liquidity: 0.85,
        volatility: 0.017,
    },
    dhara: {
        fairValue: 34,
        miningIntensity: 0.82,
        liquidity: 0.75,
        volatility: 0.024,
    },
};

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function sigmoid(value) {
    return 1 / (1 + Math.exp(-value));
}

function getHoldingValue(holding, fallbackPrice = 0) {
    if (!holding || !holding.quantity) return 0;
    const referencePrice = holding.avgPrice || fallbackPrice;
    return holding.quantity * referencePrice;
}

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
    const marketProfile = Object.values(COIN_MARKET_PROFILES).reduce((closest, profile) => {
        return Math.abs(profile.fairValue - currentPrice) < Math.abs(closest.fairValue - currentPrice) ? profile : closest;
    }, COIN_MARKET_PROFILES.gaia);

    const fairValueGap = (marketProfile.fairValue - currentPrice) / marketProfile.fairValue;
    const boundedTrend = clamp(marketTrend, -1.5, 1.5);
    const boundedNews = clamp(newsImpact, -1.2, 1.2);

    // Liquidity lowers slippage and dampens the effect of volume shocks.
    const normalizedVolume = Math.log10(1 + tradingVolume / 40);
    const liquidityAdjustment = 1 / marketProfile.liquidity;

    // Structured price process:
    // 1. Mean reversion toward a long-run fair value
    // 2. Momentum continuation from market trend
    // 3. News shock that decays over time outside this function
    // 4. Liquidity shock from one-sided order flow
    // 5. Random noise scaled by coin-specific volatility
    const meanReversion = fairValueGap * 0.045;
    const momentum = boundedTrend * 0.032;
    const newsShock = boundedNews * 0.055;
    const liquidityShock = normalizedVolume * 0.012 * Math.sign(boundedTrend || boundedNews || 1) * liquidityAdjustment;
    const stochasticNoise = (Math.random() - 0.5) * 2 * marketProfile.volatility;

    // Game-theoretic flavor:
    // when trend and news disagree, the market becomes less decisive and volatility rises
    const coordinationPenalty = -Math.abs(boundedTrend - boundedNews) * 0.008;
    const totalChange = clamp(
        meanReversion + momentum + newsShock + liquidityShock + stochasticNoise + coordinationPenalty,
        -0.11,
        0.11
    );

    const newPrice = currentPrice * (1 + totalChange);
    const lowerBound = marketProfile.fairValue * 0.45;
    const upperBound = marketProfile.fairValue * 1.95;
    return Number(clamp(newPrice, lowerBound, upperBound).toFixed(2));
}

export function generateBotTrade(coinId, currentPrice, marketTrend, priceChange = 0, carbonScore = 0, balance = 500, holdings = {}) {
    const profile = COIN_MARKET_PROFILES[coinId] || COIN_MARKET_PROFILES.gaia;
    const currentHolding = holdings[coinId]?.quantity || 0;
    const holdingValue = currentHolding * currentPrice;
    const portfolioValue = balance + Object.values(holdings).reduce((sum, holding) => {
        return sum + getHoldingValue(holding, currentPrice);
    }, 0);
    const concentration = portfolioValue > 0 ? holdingValue / portfolioValue : 0;
    const valuationGap = (profile.fairValue - currentPrice) / profile.fairValue;
    const momentumSignal = clamp(priceChange / 12, -1, 1);
    const carbonPressure = clamp((60 - carbonScore) / 120, -1, 1);
    const cashRatio = portfolioValue > 0 ? balance / portfolioValue : 1;

    // Three strategic bot archetypes:
    // 1. Market maker: mean reversion
    // 2. Momentum follower: ride trends
    // 3. Carbon optimizer: de-risk and sell into strength when footprint pressure is high
    const buyUtility =
        (valuationGap * 1.6) +
        (marketTrend * 1.2) +
        (momentumSignal * 0.8) +
        ((cashRatio - 0.35) * 0.9) -
        (concentration * 1.1) -
        (carbonPressure * 0.7);

    const sellUtility =
        ((-valuationGap) * 1.0) +
        ((-marketTrend) * 0.9) +
        ((-momentumSignal) * 0.7) +
        (concentration * 1.4) +
        (carbonPressure * 1.0) +
        ((0.18 - cashRatio) * 0.8);

    const waitUtility = 0.15 - (Math.abs(marketTrend) * 0.2) - (Math.abs(momentumSignal) * 0.15);

    // Mixed strategy equilibrium approximation: bots randomize based on utilities
    const buyWeight = Math.exp(clamp(buyUtility, -3, 3));
    const sellWeight = Math.exp(clamp(sellUtility, -3, 3));
    const waitWeight = Math.exp(clamp(waitUtility, -3, 3));
    const totalWeight = buyWeight + sellWeight + waitWeight;
    const draw = Math.random() * totalWeight;

    let action = 'wait';
    if (draw < buyWeight) {
        action = 'buy';
    } else if (draw < buyWeight + sellWeight) {
        action = 'sell';
    }

    if (action === 'wait') {
        return null;
    }

    let quantity = 0;
    const conviction = clamp(Math.max(buyUtility, sellUtility), 0.05, 2.5);

    if (action === 'buy') {
        const maxAffordable = balance / currentPrice;
        if (maxAffordable < 0.15) return null;

        const targetAllocation = clamp(0.08 + conviction * 0.09, 0.08, 0.28);
        const desiredSpend = balance * targetAllocation;
        quantity = clamp(desiredSpend / currentPrice, 0.15, maxAffordable * 0.75);
    } else {
        if (currentHolding < 0.15) return null;

        const unwindRatio = clamp(0.15 + conviction * 0.18 + concentration * 0.35, 0.15, 0.85);
        quantity = clamp(currentHolding * unwindRatio, 0.15, currentHolding);
    }

    quantity = Number(quantity.toFixed(3));
    if (quantity <= 0) return null;

    return {
        type: action,
        coin: coinId,
        quantity,
        price: currentPrice,
        timestamp: Date.now(),
        isBot: true,
        confidence: Math.round(conviction * 25),
    };
}

export function calculateOrderBook(recentTrades, currentPrice, newsImpact = 0, marketTrend = 0) {
    const buyOrders = [];
    const sellOrders = [];

    const recentOrderFlow = recentTrades.slice(0, 10).reduce((acc, trade) => {
        return acc + (trade.type === 'buy' ? trade.quantity : -trade.quantity);
    }, 0);
    const imbalance = clamp((recentOrderFlow / 25) + (marketTrend * 0.8) + (newsImpact * 0.6), -1.5, 1.5);
    const spreadBase = 0.0035 + Math.abs(imbalance) * 0.0015;
    const depthBase = 6 + recentTrades.length * 0.18;
    const buyBias = sigmoid(imbalance);

    for (let i = 1; i <= 6; i++) {
        const priceOffset = spreadBase * i;
        const bidPrice = currentPrice * (1 - priceOffset);
        const askPrice = currentPrice * (1 + priceOffset);
        const bidQuantity = Number((depthBase * (1.15 + buyBias) * (0.85 + Math.random() * 0.5) / Math.sqrt(i)).toFixed(2));
        const askQuantity = Number((depthBase * (2.15 - buyBias) * (0.85 + Math.random() * 0.5) / Math.sqrt(i)).toFixed(2));

        buyOrders.push({
            price: bidPrice.toFixed(2),
            quantity: bidQuantity,
            total: (bidPrice * bidQuantity).toFixed(2)
        });

        sellOrders.push({
            price: askPrice.toFixed(2),
            quantity: askQuantity,
            total: (askPrice * askQuantity).toFixed(2)
        });
    }
    
    return { buyOrders, sellOrders };
}

export function calculateCarbonFootprint(trades, holdings) {
    const relevantTrades = trades.slice(-30);
    const grossTurnover = relevantTrades.reduce((sum, trade) => {
        const profile = COIN_MARKET_PROFILES[trade.coin] || COIN_MARKET_PROFILES.gaia;
        return sum + (trade.quantity * trade.price * profile.miningIntensity);
    }, 0);

    const holdingEntries = Object.entries(holdings).filter(([, holding]) => holding?.quantity > 0);
    const totalHoldingValue = holdingEntries.reduce((sum, [, holding]) => {
        return sum + getHoldingValue(holding);
    }, 0);

    const concentrationPenalty = totalHoldingValue > 0
        ? holdingEntries.reduce((sum, [coinId, holding]) => {
            const weight = getHoldingValue(holding) / totalHoldingValue;
            const profile = COIN_MARKET_PROFILES[coinId] || COIN_MARKET_PROFILES.gaia;
            return sum + (weight * weight * profile.miningIntensity);
        }, 0)
        : 0;

    const diversificationCredit = totalHoldingValue > 0
        ? holdingEntries.reduce((sum, [coinId, holding]) => {
            const weight = getHoldingValue(holding) / totalHoldingValue;
            const profile = COIN_MARKET_PROFILES[coinId] || COIN_MARKET_PROFILES.gaia;
            return sum + (weight * (1.35 - profile.miningIntensity));
        }, 0)
        : 0;

    const churnPenalty = relevantTrades.length > 0 ? grossTurnover / 240 : 0;
    const holdPenalty = concentrationPenalty * 6;
    const sustainabilityRelief = diversificationCredit * 4;
    const footprint = clamp(churnPenalty + holdPenalty - sustainabilityRelief, 0, 35);

    return Number(footprint.toFixed(1));
}

export function calculateCarbonScorePenalty(carbonFootprint) {
    if (carbonFootprint <= 4) return 2;
    if (carbonFootprint <= 8) return 0;
    if (carbonFootprint <= 14) return -Math.round((carbonFootprint - 8) * 1.8);
    if (carbonFootprint <= 20) return -12 - Math.round((carbonFootprint - 14) * 2.8);
    return -29 - Math.round((carbonFootprint - 20) * 3.5);
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
