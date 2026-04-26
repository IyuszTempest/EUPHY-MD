/**
 * Random NSFW Image 🔞⛩️
 * Powered by Neotex API (Direct Link Mode) ✨
 */

const axios = require('axios');

module.exports = {
    command: ['hentai'],
    category: 'nsfw',
    noPrefix: false,
    premium: true,
    call: async (conn, m) => {
        await conn.sendMessage(m.chat, { react: { text: '😳', key: m.key } });

        try {
            const apiUrl = `https://neotex.my.id/random/nsfw`;
            
            // Kita download langsung datanya sebagai buffer
            const response = await axios.get(apiUrl, { 
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const buffer = Buffer.from(response.data);

            let caption = `Hey`;

            // Kirim buffer gambarnya
            await conn.sendMessage(m.chat, { 
                image: buffer, 
                caption: caption 
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Aduh Yus, API-nya lagi mogok:* ${e.message}`);
        }
    }
};
