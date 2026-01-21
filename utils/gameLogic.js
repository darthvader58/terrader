export const CRYPTO_COINS = [
    { id: 'terra', name: 'TerraCoin', symbol: 'TRC', color: '#1CC880' },
    { id: 'gaia', name: 'Gaiacoin', symbol: 'GIA', color: '#4299E1' },
    { id: 'enviro', name: 'Envirocoin', symbol: 'ENV', color: '#9F7AEA' },
    { id: 'dhara', name: 'DharaCoin', symbol: 'DHR', color: '#F6AD55' }
];

export const GAME_CONFIG = {
    INITIAL_BALANCE: 500,
    GAME_DURATION: 15 * 60,
    LEADERBOARD_UPDATE_INTERVAL: 2 * 60,
    NEWS_UPDATE_INTERVAL: 30,
    PRICE_UPDATE_INTERVAL: 5,
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
        totalValue += holding.quantity * currentPrices[coinId];
    });
    
    return totalValue - GAME_CONFIG.INITIAL_BALANCE;
}

export function generatePriceMovement(currentPrice, newsImpact = 0, marketTrend = 0) {
    const baseVolatility = 0.03; // Reduced for more realistic movement
    const randomChange = (Math.random() - 0.5) * 2 * baseVolatility;
    
    // News has significant impact (up to 5% change)
    const newsInfluence = newsImpact * 0.05;
    
    // Market trend provides gradual direction
    const trendInfluence = marketTrend * 0.02;
    
    const totalChange = randomChange + newsInfluence + trendInfluence;
    const newPrice = currentPrice * (1 + totalChange);
    
    // Ensure price stays within reasonable bounds
    return Math.max(10, Math.min(200, Number(newPrice.toFixed(2))));
}

export function calculateCarbonFootprint(trades, holdings) {
    let footprint = 0;
    
    // Each trade adds to footprint
    trades.forEach(trade => {
        footprint += Math.abs(trade.quantity * trade.price * 0.001);
    });
    
    // Holding coins reduces footprint over time (sustainable holding)
    Object.values(holdings).forEach(holding => {
        footprint -= holding.quantity * 0.0002; // Negative = good
    });
    
    // Return absolute value, lower is better
    return Math.max(0, Math.floor(footprint));
}
