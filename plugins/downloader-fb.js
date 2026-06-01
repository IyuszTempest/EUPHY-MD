/**
 * Euphy-Bot - Facebook Downloader ✨
 * Scraper: fdown.net
 */

const cloudscraper = require('cloudscraper');
function clean(url) {
    return url?.replace(/&amp;/g, '&') || null;
}

module.exports = {
    command: ['fb', 'facebook'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        if (!args[0]) return m.reply(`*Contoh:* ${usedPrefix + command} https://www.facebook.com/share/r/1Cbddc8AD6/`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

            const res = await cloudscraper.post({
                uri: 'https://www.fdown.net/download.php',
                formData: { URLz: args[0] },
                headers: {
                    'Origin': 'https://www.fdown.net',
                    'Referer': 'https://www.fdown.net/',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36 EdgA/145.0.0.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
                }
            });

            let sdlink = clean(res.match(/id="sdlink" href="([^"]+)"/)?.[1]);
            let hdlink = clean(res.match(/id="hdlink" href="([^"]+)"/)?.[1]);

            let finalVideo = hdlink || sdlink;

            if (!finalVideo) throw new Error("> Gagal mendapatkan link download. Pastikan video publik!");

            await conn.sendMessage(m.chat, {
                    video: { url: finalVideo },
                    caption: `> Done`,
                    contextInfo: {
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: idch,
                            newsletterName: namech,
                            serverMessageId: 143
                        }
                    }
                }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "😹", key: m.key } });

        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { react: { text: "😑", key: m.key } });
            m.reply(`❌ *Error:* ${e.message || "> Terjadi kesalahan saat mendownload video."}`);
        }
    }
};
