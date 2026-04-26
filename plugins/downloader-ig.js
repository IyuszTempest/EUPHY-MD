/** * Euphy-Bot - Instagram Reels Downloader ✨
 * Fitur: Download video Reels menggunakan Scraper SnapInsta secara mandiri.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');

const handleIgdl = async (url) => {
    try {
        const form = new FormData();
        form.append("url", url);
        form.append("action", "post");

        const res = await axios.post("https://snapinsta.top/action.php", form, {
            headers: {
                ...form.getHeaders(),
                "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36",
                "origin": "https://snapinsta.top",
                "referer": "https://snapinsta.top/"
            }
        });

        const $ = cheerio.load(res.data);
        const result = [];

        $(".download-items__btn a").each((_, el) => {
            let path = $(el).attr("href");
            if (!path) return;
            if (!path.startsWith("http")) path = "https://snapinsta.top" + path;
            result.push(path);
        });

        if (result.length === 0) throw new Error("Gagal mengambil video Reels.");

        return { status: "success", result: result };
    } catch (error) {
        throw new Error(`Reels Error: ${error.message}`);
    }
};

module.exports = {
    command: ['ig', 'instagram'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { text }) => {
        if (!text) return m.reply('Mana link Reels-nya? ✨\nContoh: .reels https://www.instagram.com/reels/xxxxx/');

        // Validasi link Instagram/Reels
        if (!/instagram.com\/(reels|reel)/.test(text)) return m.reply('Link-nya harus dari Instagram Reels ya! 🌸');

        try {
            await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });
            
            // Eksekusi Scraper
            const data = await handleIgdl(text);
            const videoUrl = data.result[0]; // Ambil link pertama karena Reels biasanya cuma satu video

            if (!videoUrl) throw new Error("Link video tidak ditemukan.");

            // Kirim video langsung ke chat
            await conn.sendMessage(m.chat, { 
                video: { url: videoUrl }, 
                caption: `DONE`,
                contextInfo: {
                    externalAdReply: {
                        title: '𝙸𝙽𝚂𝚃𝙰𝙶𝚁𝙰𝙼 𝚁𝙴𝙴𝙻𝚂',
                        body: 'Success Download Video',
                        thumbnailUrl: global.imgall,
                        sourceUrl: text,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Gagal:* ${e.message}`);
        }
    }
};
