/** * Plugin Kitsu Anime Search Carousel ✨
 * Style: Euphylia Magenta - Interactive UI ⛩️
 * API: Kitsu API (Highly Stable & No Strict Rate Limits) 🚀
 */

const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const axios = require('axios');

const handleKitsu = async (query) => {
    try {
        const res = await axios.get(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=5`, {
            headers: {
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json'
            }
        });
        return res.data.data; 
    } catch (error) {
        console.error(error);
        throw new Error("Gagal mengambil data dari Kitsu API");
    }
};

module.exports = {
    command: ['kitsu', 'anime', 'kitsuinfo'],
    category: 'anime',
    noPrefix: true, 
    call: async (conn, m, { text, command, usedPrefix }) => {
        if (!text) {
            return m.reply(`> Mau cari anime apa hari ini?\nContoh: *${usedPrefix + command} Cyberpunk Edgerunners*`);
        }
        
        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

        try {
            const results = await handleKitsu(text);

            if (!results || results.length === 0) {
                return m.reply('> Aduh, Aku nggak nemu info animenya di Kitsu. Coba cek lagi ejaannya ya!');
            }

            let cards = [];

            for (let i = 0; i < results.length; i++) {
                const anime = results[i];
                const attr = anime.attributes;
                let media;

    
                    const imageUrl = attr.posterImage?.large || attr.posterImage?.original || attr.posterImage?.medium;
                    if (imageUrl) {
                        media = await prepareWAMessageMedia(
                            { image: { url: imageUrl } },
                            { upload: conn.waUploadToServer }
                        );
                    }
                } catch (mediaError) {
                    console.error(`Gagal memproses gambar untuk Kitsu ID ${anime.id}:`, mediaError);
                    // Fallback gambar jika gambar asli bermasalah
                    try {
                        media = await prepareWAMessageMedia(
                            { image: { url: 'https://placehold.co/600x400/magenta/white?text=No+Image' } },
                            { upload: conn.waUploadToServer }
                        );
                    } catch (_) {
                        media = null;
                    }
                }

                // Format Rating Kitsu biasanya dalam skala 100% (contoh: 78.43%)
                const rating = attr.averageRating ? `⭐️ ${attr.averageRating}%` : 'N/A';
                
                // Format Status & Tanggal Tayang
                const status = attr.status === 'finished' ? 'Selesai Tayang' : attr.status === 'current' ? 'Sedang Tayang' : attr.status;
                const startDate = attr.startDate ? attr.startDate : 'N/A';

                // Format isi body kartu carousel agar rapi & estetik ala Euphylia
                let cardBody = `⭐ *Rating:* ${rating}\n`;
                cardBody += `🎞️ *Type:* ${attr.subtype ? attr.subtype.toUpperCase() : 'N/A'} | 📅 *Status:* ${status}\n`;
                cardBody += `🔢 *Episodes:* ${attr.episodeCount || '?'}\n`;
                cardBody += `📆 *Rilis:* ${startDate}\n\n`;
                cardBody += `📝 *Synopsis:*\n${attr.synopsis ? attr.synopsis.slice(0, 150) + '...' : 'No synopsis available.'}`;

                // Link menuju Kitsu Anime
                const animeUrl = `https://kitsu.io/anime/${attr.slug}`;

                const cardData = {
                    body: proto.Message.InteractiveMessage.Body.create({ text: cardBody }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: `Kitsu ID: ${anime.id}` }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        title: `🏮 ${attr.canonicalTitle || attr.titles.en_jp || attr.titles.en}`,
                        hasMediaAttachment: !!media,
                        ...media
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: [{
                            name: "cta_url",
                            buttonParamsJson: JSON.stringify({ 
                                display_text: "Lihat di Kitsu ↗️", 
                                url: animeUrl 
                            })
                        }]
                    })
                };

                cards.push(cardData);
            }

            // Generate pesan interaktif dengan format carousel
            const msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: proto.Message.InteractiveMessage.create({
                            body: proto.Message.InteractiveMessage.Body.create({ 
                                text: `╭━━〔 ⛩️ *𝙰𝙽𝙸𝙼𝙴 𝚂𝙴𝙰𝚁𝙲𝙷 (𝙺𝙸𝚃𝚂𝚄)* ⛩️ 〕━━┓\n┃ ✨ *Query:* ${text}\n┃ 🏮 *Hasil:* ${results.length} Slides\n\nGeser ke samping buat intip anime seru lainnya ya! 👇` 
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({ text: global.wm }),
                            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({ cards })
                        })
                    }
                }
            }, { userJid: conn.user.id, quoted: m });

            // Kirim pesan ke chat WhatsApp
            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

        } catch (e) {
            console.error("Eror pada command Kitsu Anime:", e);
            m.reply('> Waduh, Kitsu API lagi bermasalah! Coba lagi nanti ya!');
        }
    }
};
