/**
 * Euphy-Bot - Tools Get (Fetch URL)
 * Fitur: Mengambil data/source code dari URL secara langsung
 */

const axios = require('axios');
const { format } = require('util');

module.exports = {
    command: ['get'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { text }) => {
        if (!text) return m.reply('Masukkan URL-nya, Contoh: .get https://google.com');
        
        // Validasi URL sederhana
        if (!/^https?:\/\//.test(text)) return m.reply('URL-nya harus diawali http:// atau https:// ya!');

        try {
            m.reply('_Sedang mengambil data..._');
            
            const res = await axios.get(text);
            
            // Jika response berupa JSON, kita buat rapi. Jika teks, kirim apa adanya.
            let result;
            if (typeof res.data === 'object') {
                result = JSON.stringify(res.data, null, 2);
            } else {
                result = res.data;
            }

            // Batasi teks agar tidak terlalu panjang (Limit WhatsApp chat)
            if (result.length > 10000) {
                return m.reply('Waduh, datanya kepanjangan! Euphy cuma bisa nampilin sampai 10.000 karakter aja.');
            }

            return m.reply(result);

        } catch (e) {
            console.error(e);
            return m.reply(`Gagal mengambil data! ❌\n\n*Error:* ${e.message}`);
        }
    }
};
