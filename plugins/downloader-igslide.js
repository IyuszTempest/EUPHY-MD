/** * Euphy-Bot - Instagram Slider (Carousel Mode) ✨
 * Fitur: Mengirim media Instagram dalam bentuk Slide/Carousel yang bisa digeser.
 */

const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');
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

        if (result.length === 0) throw new Error("Gagal mengambil media Instagram.");

        return { status: "success", result: result };
    } catch (error) {
        throw new Error(`IGDL Error: ${error.message}`);
    }
};

module.exports = {
    command: ['igslide'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { text }) => {
        if (!text) return m.reply('Mana link Instagram-nya? ✨');
        if (!/instagram.com/.test(text)) return m.reply('Link harus valid ya! 🌸');

        try {
            await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });
            
            const data = await handleIgdl(text);
            const results = data.result;

            if (results.length > 1) {
                // --- LOGIKA CAROUSEL MESSAGE ---
                let cards = [];
                for (let i = 0; i < results.length; i++) {
                    const url = results[i];
                    const isVideo = url.includes('.mp4') || url.includes('video');
                    
                    // Siapkan media untuk tiap card
                    const media = await prepareWAMessageMedia(
                        { [isVideo ? 'video' : 'image']: { url: url } },
                        { upload: conn.waUploadToServer }
                    );

                    cards.push({
                        body: proto.Message.InteractiveMessage.Body.create({ text: `Media ke-${i + 1}` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: global.wm }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            hasMediaAttachment: true,
                            ...media
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [{
                                name: "cta_url",
                                buttonParamsJson: JSON.stringify({ display_text: "Source", url: text })
                            }]
                        })
                    });
                }

                const msg = generateWAMessageFromContent(m.chat, {
                    viewOnceMessage: {
                        message: {
                            interactiveMessage: proto.Message.InteractiveMessage.create({
                                body: proto.Message.InteractiveMessage.Body.create({ text: `🏮 *Instagram Carousel* 🏮\nDitemukan ${results.length} media dari link tersebut.` }),
                                footer: proto.Message.InteractiveMessage.Footer.create({ text: "Gunakan tombol di atas untuk melihat detail." }),
                                carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({ cards })
                            })
                        }
                    }
                }, { userJid: conn.user.id, quoted: m });

                await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            } else {
                // Single media fallback
                const url = results[0];
                const isVideo = url.includes('.mp4') || url.includes('video');
                await conn.sendMessage(m.chat, {
                    [isVideo ? 'video' : 'image']: { url: url },
                    caption: `✨ *Instagram Single DL*`
                }, { quoted: m });
            }

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Gagal:* ${e.message}`);
        }
    }
};
