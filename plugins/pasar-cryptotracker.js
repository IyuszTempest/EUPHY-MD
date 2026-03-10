/**
 * Euphy-Bot - Crypto Tracker 📈
 * Data by CoinGecko API
 */

const axios = require('axios');

module.exports = {
    command: ['crypto', 'cekcrypto'],
    category: 'economic',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        if (!args[0]) return m.reply(`*Format:* ${usedPrefix + command} <nama_koin>\n*Contoh:* ${usedPrefix + command} bitcoin`);

        try {
            const coin = args[0].toLowerCase();
            const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=idr,usd&include_24hr_change=true`);

            if (!data[coin]) return m.reply('❌ Koin tidak ditemukan. Pastikan namanya benar (contoh: ethereum, solana, dogecoin).');

            const res = data[coin];
            let teks = `*💎 CRYPTO TRACKER 💎*\n\n`;
            teks += `*🪙 Coin:* ${coin.toUpperCase()}\n`;
            teks += `*🇮🇩 IDR:* Rp ${res.idr.toLocaleString('id-ID')}\n`;
            teks += `*🇺🇸 USD:* $ ${res.usd.toLocaleString()}\n`;
            teks += `*📉 24h Change:* ${res.usd_24h_change.toFixed(2)}%\n\n`;
            teks += `_Data diperbarui secara real-time._`;

            m.reply(teks);
        } catch (e) {
            console.error(e);
            m.reply('⚠️ Terjadi kesalahan saat mengambil data. Coba lagi nanti.');
        }
    }
};
