/**
 * Random Waifu Generator (Update Method) 🌸🎎
 * Powered by Furinn API System ✨
 * Format: Direct Image Fetch
 */

module.exports = {
    command: ['waifu2'],
    category: 'anime',
    premium: false,
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        // Beri reaksi proses (Emoji Mata Bulat)
        await conn.sendMessage(m.chat, { react: { text: '🙄', key: m.key } });

        try {
            // Karena metodenya Update (Direct Image), kita langsung tembak URL-nya ke Baileys
            const imageUrl = `https://apii.furinn.my.id/api/random/waifu`;

            let caption = `╭━━〔 🎎 *𝚁𝙰𝙽𝙳𝙾𝙼 𝚆𝙰𝙸𝙵𝚄* 〕━━┓\n`;
            caption += `┃\n`;
            caption += `┃ ✨ Ini adalah istri owner\n`;
            caption += `┃\n`;
            caption += `┗━━━━━━━━━━━━━━━━━┛\n`;
            caption += `_Nih kak ✨_`;

            // Langsung kirim gambarnya
            await conn.sendMessage(m.chat, { 
                image: { url: imageUrl }, 
                caption: caption 
            }, { quoted: m });

            // Beri reaksi sukses (Emoji Love)
            await conn.sendMessage(m.chat, { react: { text: '💖', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`⚠️ Gagal mengambil gambar: ${e.message}.`);
        }
    }
};
