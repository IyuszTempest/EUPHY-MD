/** * Euphy-Bot - Instagram Downloader
 * Fitur: Download video/foto Instagram menggunakan API IyuszTempest
 */

const axios = require('axios');

module.exports = {
    command: ['ig', 'instagram'],
    category: 'download',
    noPrefix: true,
    call: async (conn, m, { text }) => {
        if (!text) return m.reply('Mana link Instagram-nya, Yus? Contoh: .ig https://www.instagram.com/reels/xxxxx/ [cite: 2025-05-24]');

        // Validasi link Instagram sederhana
        if (!/instagram.com/.test(text)) return m.reply('Link-nya harus dari Instagram ya!');

        try {
            await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });
            
            // Memanggil API milik Yus
            const apiReq = `https://iyusztempest.my.id/api/download?feature=igdl&url=${encodeURIComponent(text)}&apikey=${global.apiyus}`;
            const { data } = await axios.get(apiReq);

            if (data.status !== 'success' || !data.result || data.result.length === 0) {
                return m.reply('Gagal mengambil data, pastikan link-nya publik dan API kamu aktif!');
            }

            const videoUrl = data.result[0];

            // Kirim video langsung ke chat
            await conn.sendMessage(m.chat, { 
                video: { url: videoUrl }, 
                caption: `✨ *Instagram Downloader Success!*\n\n🔗 *Source:* ${text}\n\nBerhasil didownload buat kamu!`
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`Error: ${e.message}. Cek koneksi server kamu!`);
        }
    }
};
