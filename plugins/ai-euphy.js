/**
 * Euphy-Bot - GPT-4 AI (Euphylia Magenta Edition) ✨
 * Trigger: Kata 'euphy' | No Prefix
 */

const axios = require('axios');

module.exports = {
    command: ['ai'], // Command cadangan
    custom: true, // Berjalan di setiap pesan
    noPrefix: true,
    category: 'ai',
    call: async (conn, m, { text, body }) => {
        // Ambil pesan secara aman
        const budy = typeof body === 'string' ? body : (m.text || "");
        
        // Hanya terpanggil jika ada kata 'euphy' [cite: 2025-05-24]
        if (!budy.toLowerCase().includes('ai')) return;

        try {
            await conn.sendMessage(m.chat, { react: { text: '🧠', key: m.key } });

            // Custom Prompt Identitas Euphylia Magenta [cite: 2025-05-24]
            const identity = "Nama kamu adalah Euphylia Magenta. kamu asisten yang sedikit berani dan malu-malu 😳😁. Gunakan bahasa informal 'aku/kamu'. Kamu harus terlihat pinter tapi santai.";
            
            // Gabungkan Identitas dengan Pertanyaan User
            const query = `${identity}\n\nUser nanya: ${budy}`;
            
            // Request ke API GPT-4 ZiaUlhaq
            const response = await axios.get(`https://api.ziaul.my.id/api/ai/GPT-4?query=${encodeURIComponent(query)}`, {
                headers: { 'accept': '*/*' }
            });

            if (!response.data.status) throw "API lagi error, Yus.";

            const result = response.data.response;

            // Kirim respon dengan gaya Euphylia Magenta
            await conn.sendMessage(m.chat, { 
                text: result,
                contextInfo: {
                    externalAdReply: {
                        title: '𝙴𝚄𝙿𝙷𝚈𝙻𝙸𝙰 𝙼𝙰𝙶𝙴𝙽𝚃𝙰 (𝙶𝙿𝚃-𝟺)',
                        body: 'Listening to you... ✨',
                        thumbnailUrl: global.imgall,
                        sourceUrl: 'https://github.com/IyuszTempest',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            // Hanya reply error jika memang dipanggil
            m.reply(`Aduh, aku lagi pusing: ${e.message}`);
        }
    }
};
