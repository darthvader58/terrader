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
    { id: 'time_freeze', name: 'Time Freeze', cost: 15, icon: 'time', description: 'Freeze prices for 30 seconds' },
    { id: 'price_peek', name: 'Price Peek', cost: 20, icon: 'view', description: 'See next price movement' },
    { id: 'carbon_boost', name: 'Carbon Boost', cost: 25, icon: 'star', description: 'Double carbon score for 1 minute' },
    { id: 'news_insight', name: 'News Insight', cost: 30, icon: 'info', description: 'Get detailed news analysis' }
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

export function generatePriceMovement(currentPrice, newsImpact = 0) {
    const baseVolatility = 0.05;
    const randomChange = (Math.random() - 0.5) * 2 * baseVolatility;
    const newsInfluence = newsImpact * 0.03;
    
    const totalChange = randomChange + newsInfluence;
    const newPrice = currentPrice * (1 + totalChange);
    
    return Math.max(0.1, Number(newPrice.toFixed(2)));
}

export function calculateCarbonFootprint(trades, holdings) {
    let footprint = 0;
    
    trades.forEach(trade => {
        footprint += Math.abs(trade.quantity * trade.price * 0.001);
    });
    
    Object.values(holdings).forEach(holding => {
        footprint += holding.quantity * 0.0005;
    });
    
    return Math.floor(footprint);
}
