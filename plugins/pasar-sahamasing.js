/**
 * Euphy-Bot - Global Stock Tracker 🌎
 */

const axios = require('axios');

module.exports = {
    command: ['sahamluar', 'sahamasing'],
    category: 'ecomomic',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        if (!args[0]) return m.reply(`*Format:* ${usedPrefix + command} <ticker>\n*Contoh:* ${usedPrefix + command} NVDA`);

        try {
            const ticker = args[0].toUpperCase();
            // Mengambil data dari Yahoo Finance
            const { data } = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`);

            const res = data.chart.result[0];
            const meta = res.meta;
            const price = meta.regularMarketPrice;
            const prevClose = meta.chartPreviousClose;
            const currency = meta.currency;
            const change = ((price - prevClose) / prevClose * 100).toFixed(2);

            let teks = `*🌎 GLOBAL STOCK TRACKER 🌎*\n\n`;
            teks += `*🏢 Emiten:* ${ticker}\n`;
            teks += `*💰 Harga:* ${price.toLocaleString()} ${currency}\n`;
            teks += `*📈 Perubahan:* ${change}% (${price - prevClose > 0 ? '🚀' : '🔻'})\n`;
            teks += `*📉 Market:* ${meta.exchangeName}\n\n`;
            teks += `_Investasi masa depan cerah, koding pun semangat!_`;

            m.reply(teks);
        } catch (e) {
            console.error(e);
            m.reply(`❌ Gagal mengambil data saham *${args[0]}*. Pastikan ticker benar (contoh: AAPL, TSLA, NVDA).`);
        }
    }
};
