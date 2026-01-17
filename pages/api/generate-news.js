import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const CRYPTO_COINS = ['TerraCoin', 'Gaiacoin', 'Envirocoin', 'DharaCoin'];

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { coinName, currentPrice, trend } = req.body;
        
        const coin = coinName || CRYPTO_COINS[Math.floor(Math.random() * CRYPTO_COINS.length)];
        
        const prompt = `Generate a brief, realistic crypto news headline (max 15 words) about ${coin} that subtly hints at ${trend || 'neutral'} price movement. The news should relate to environmental impact, sustainability, or carbon footprint. Make it sound like a real financial news headline.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a financial news headline generator focused on cryptocurrency and environmental impact. Generate concise, realistic headlines."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 50,
            temperature: 0.8,
        });

        const newsHeadline = completion.choices[0].message.content.trim();

        return res.status(200).json({
            success: true,
            news: newsHeadline,
            coin: coin,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('OpenAI API Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate news'
        });
    }
}
