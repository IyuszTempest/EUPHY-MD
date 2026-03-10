/**
 * Euphy-Bot - Currency Exchange (Kurs) 💵
 */

const axios = require('axios');

module.exports = {
    command: ['kurs', 'cekkurs'],
    category: 'economic',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        // Default: USD ke IDR
        let from = args[0] ? args[0].toUpperCase() : 'USD';
        let to = args[1] ? args[1].toUpperCase() : 'IDR';

        try {
            const { data } = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
            
            if (!data.rates[to]) return m.reply(`❌ Mata uang *${to}* tidak ditemukan.`);

            const rate = data.rates[to];
            let teks = `*💱 CURRENCY EXCHANGE 💱*\n\n`;
            teks += `*💵 Dari:* 1 ${from}\n`;
            teks += `*🇮🇩 Ke:* ${rate.toLocaleString('id-ID')} ${to}\n\n`;
            teks += `_Tips: Ketik ${usedPrefix + command} JPY IDR untuk cek harga Yen Jepang!_ 🇯🇵`;

            m.reply(teks);
        } catch (e) {
            console.error(e);
            m.reply('⚠️ Terjadi kesalahan. Pastikan kode mata uang benar (USD, JPY, IDR, dll).');
        }
    }
};
