/** * Plugin Jikan Moe (Anime Search Carousel) ✨
 * Style: Euphylia Magenta - Interactive UI ⛩️
 */

const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const axios = require('axios');

// --- [ FUNGSI SCRAPE JIKANMOE ] ---
const handleJikanmoe = async (query) => {
    try {
        const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}`);
        return res.data.data; // Mengembalikan array hasil pencarian
    } catch (error) {
        throw new Error("Gagal mengambil data dari JikanMoe");
    }
};

module.exports = {
    command: ['jikanmoe', 'anime'],
    category: 'anime',
    noPrefix: true, 
    call: async (conn, m, { text, command, usedPrefix }) => {
        if (!text) return m.reply(`Mau cari anime apa hari ini? 🌸\nContoh: *${usedPrefix + command} tenten kakumei*`);

        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

        try {
            const results = await handleJikanmoe(text);

            if (!results || results.length === 0) {
                return m.reply('Aduh, Euphy nggak nemu info animenya. Coba cek judulnya lagi ya! 🏮');
            }

            // Ambil 5 hasil teratas untuk dijadikan Carousel
            const topResults = results.slice(0, 5);
            let cards = [];

            for (let i = 0; i < topResults.length; i++) {
                const data = topResults[i];
                
                const media = await prepareWAMessageMedia(
                    { image: { url: data.images.jpg.large_image_url || data.images.jpg.image_url } },
                    { upload: conn.waUploadToServer }
                );

                let cardBody = `⭐ *Score:* ${data.score || 'N/A'}\n`;
                cardBody += `🎞️ *Type:* ${data.type} | 📅 *Status:* ${data.status}\n`;
                cardBody += `🔢 *Episodes:* ${data.episodes || '?'}\n\n`;
                cardBody += `${data.synopsis ? data.synopsis.slice(0, 150) + '...' : 'No synopsis.'}`;

                cards.push({
                    body: proto.Message.InteractiveMessage.Body.create({ text: cardBody }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: `MAL ID: ${data.mal_id}` }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        title: `🏮 ${data.title}`,
                        hasMediaAttachment: true,
                        ...media
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: [{
                            name: "cta_url",
                            buttonParamsJson: JSON.stringify({ 
                                display_text: "Lihat di MAL", 
                                url: data.url 
                            })
                        }]
                    })
                });
            }

            const msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: proto.Message.InteractiveMessage.create({
                            body: proto.Message.InteractiveMessage.Body.create({ 
                                text: `╭━━〔 ⛩️ *𝙰𝙽𝙸𝙼𝙴 𝚂𝙴𝙰𝚁𝙲𝙷* ⛩️ 〕━━┓\n┃ ✨ *Query:* ${text}\n┃ 🏮 *Hasil:* ${topResults.length} Slides\n┗━━━━━━━━━━━━━━━━━┛` 
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({ text: global.wm }),
                            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({ cards })
                        })
                    }
                }
            }, { userJid: conn.user.id, quoted: m });

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Database JikanMoe lagi sibuk! ❌');
        }
    }
};
