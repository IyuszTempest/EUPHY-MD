/**
 * Euphy-Bot - Stock Tracker 📊
 */

const axios = require('axios');

module.exports = {
    command: ['saham', 'ceksaham'],
    category: 'economic',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        if (!args[0]) return m.reply(`*Format:* ${usedPrefix + command} <kode_saham>\n*Contoh:* ${usedPrefix + command} GOTO`);

        try {
            const code = args[0].toUpperCase();
            // Menggunakan API publik Yahoo Finance via query
            const { data } = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${code}.JK`);

            const meta = data.chart.result[0].meta;
            const price = meta.regularMarketPrice;
            const previousClose = meta.chartPreviousClose;
            const change = ((price - previousClose) / previousClose * 100).toFixed(2);

            let teks = `*📊 STOCK TRACKER (IDX) 📊*\n\n`;
            teks += `*🏢 Emiten:* ${code}\n`;
            teks += `*💰 Harga:* Rp ${price.toLocaleString('id-ID')}\n`;
            teks += `*📈 Perubahan:* ${change}% (${price - previousClose > 0 ? '🚀' : '🔻'})\n`;
            teks += `*📉 Prev Close:* Rp ${previousClose.toLocaleString('id-ID')}\n\n`;
            teks += `_Pantau terus portofolio kamu!_`;

            m.reply(teks);
        } catch (e) {
            console.error(e);
            m.reply(`❌ Gagal mengambil data saham *${args[0]}*. Pastikan kode emiten benar (contoh: GOTO, ZATA, BBCA).`);
        }
    }
};
