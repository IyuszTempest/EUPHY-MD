```javascript
/** * Plugin Kitsu Anime Search with List Selector ⛩️
 * Style: Euphylia Magenta - "The King of UI" Style 🌸
 * API: Kitsu API (Highly Stable & No Strict Rate Limits) 🚀
 * Adopted from Kuroyami Menu Structure
 */

const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const axios = require('axios');

// --- [ FUNGSI AMBIL DATA DARI KITSU API ] ---
const handleKitsuSearch = async (query) => {
    try {
        const res = await axios.get(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=10`, {
            headers: {
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json'
            }
        });
        return res.data.data;
    } catch (error) {
        console.error("Kitsu Search Error:", error);
        return null;
    }
};

const handleKitsuDetail = async (id) => {
    try {
        const res = await axios.get(`https://kitsu.io/api/edge/anime/${id}`, {
            headers: {
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json'
            }
        });
        return res.data.data;
    } catch (error) {
        console.error("Kitsu Detail Error:", error);
        return null;
    }
};

module.exports = {
    command: ['kitsu', 'anime', 'kitsuinfo'],
    category: 'anime',
    noPrefix: true, 
    call: async (conn, m, { text, command, usedPrefix: _p }) => {
        try {
            if (!text) {
                return m.reply(`> Mau cari anime apa hari ini?\nContoh: *${_p + command} Cyberpunk Edgerunners*`);
            }

            // --- MODE 1: DETAIL ANIME BERDASARKAN ID (Ketukan dari List) ---
            const isId = /^\d+$/.test(text.trim());
            if (command === 'kitsuinfo' || isId) {
                await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

                const animeId = text.trim();
                const anime = await handleKitsuDetail(animeId);

                if (!anime) {
                    return m.reply('> Gagal mengambil detail anime. Mungkin ID-nya salah atau server Kitsu sedang sibuk!');
                }

                const attr = anime.attributes;
                let media;

                // Mempersiapkan poster gambar anime
                try {
                    const imageUrl = attr.posterImage?.large || attr.posterImage?.original || attr.posterImage?.medium || global.imgall;
                    media = await prepareWAMessageMedia({ image: { url: imageUrl } }, { upload: conn.waUploadToServer });
                } catch (mediaError) {
                    console.error("Media upload error:", mediaError);
                    // Fallback jika gambar error
                    media = await prepareWAMessageMedia({ image: { url: global.imgall } }, { upload: conn.waUploadToServer });
                }

                // Format data statistik anime
                const rating = attr.averageRating ? `⭐️ ${attr.averageRating}%` : 'N/A';
                const status = attr.status === 'finished' ? 'Selesai Tayang' : attr.status === 'current' ? 'Sedang Tayang' : attr.status;
                const startDate = attr.startDate ? attr.startDate : 'N/A';
                const animeUrl = `https://kitsu.io/anime/${attr.slug}`;

                // Formating Body Info Detail
                let detailContent = `📌 *${attr.canonicalTitle || attr.titles.en_jp || attr.titles.en}*\n\n`;
                detailContent += `⭐ *Rating:* ${rating}\n`;
                detailContent += `🎞️ *Type:* ${attr.subtype ? attr.subtype.toUpperCase() : 'N/A'}\n`;
                detailContent += `📅 *Status:* ${status}\n`;
                detailContent += `🔢 *Episodes:* ${attr.episodeCount || '?'}\n`;
                detailContent += `📆 *Rilis:* ${startDate}\n\n`;
                detailContent += `📝 *Synopsis:*\n${attr.synopsis || 'Tidak ada sinopsis.'}`;

                // Generate Message dengan style Kuroyami LTD (Single CTA Button)
                const msg = generateWAMessageFromContent(
                    m.chat,
                    {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadata: {},
                                    deviceListMetadataVersion: 2
                                },
                                interactiveMessage: proto.Message.InteractiveMessage.create({
                                    header: proto.Message.InteractiveMessage.Header.create({
                                        title: 'Anime Detail',
                                        hasMediaAttachment: true,
                                        ...media
                                    }),
                                    body: proto.Message.InteractiveMessage.Body.create({
                                        text: detailContent
                                    }),
                                    footer: proto.Message.InteractiveMessage.Footer.create({
                                        text: global.wm
                                    }),
                                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                        messageVersion: 1,
                                        buttons: [{
                                            name: "cta_url",
                                            buttonParamsJson: JSON.stringify({ 
                                                display_text: "Lihat Selengkapnya", 
                                                url: animeUrl 
                                            })
                                        }]
                                    }),
                                    contextInfo: { 
                                        mentionedJid: [m.sender],
                                        forwardingScore: 999,
                                        isForwarded: true,
                                        forwardedNewsletterMessageInfo: {
                                            newsletterJid: global.idch,
                                            serverMessageId: 143,
                                            newsletterName: `${global.namech}`
                                        }
                                    }
                                })
                            }
                        }
                    },
                    { userJid: conn.user.id, quoted: m }
                );

                // Relay Message
                await conn.relayMessage(m.chat, msg.message, {
                    messageId: msg.key.id,
                    additionalNodes: [
                        {
                            tag: 'biz',
                            attrs: {},
                            content: [{
                                tag: 'interactive',
                                attrs: { type: 'native_flow', v: '1' },
                                content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }]
                            }]
                        }
                    ]
                });

                return await conn.sendMessage(m.chat, { react: { text: "✨", key: m.key } });
            }


            // --- MODE 2: PENCARIAN UTAMA (Menampilkan List Select Button) ---
            await conn.sendMessage(m.chat, { react: { text: "🤔", key: m.key } });

            const results = await handleKitsuSearch(text);

            if (!results || results.length === 0) {
                return m.reply('> Aduh, Aku nggak nemu info animenya di Kitsu. Coba cek lagi ejaannya ya!');
            }

            // Susun Rows untuk Button List
            let rows = [];
            results.forEach((anime, idx) => {
                const attr = anime.attributes;
                const title = attr.canonicalTitle || attr.titles.en_jp || attr.titles.en;
                const rating = attr.averageRating ? `⭐ ${attr.averageRating}%` : '⭐ N/A';
                const subtype = attr.subtype ? attr.subtype.toUpperCase() : 'N/A';
                const ep = attr.episodeCount ? `${attr.episodeCount} Eps` : '? Eps';

                rows.push({
                    header: '',
                    title: `${idx + 1}. ${title.slice(0, 35)}`,
                    description: `${subtype} | ${rating} | ${ep}`,
                    id: `${_p}kitsuinfo ${anime.id}` 
                });
            });

            let listMessage = {
                title: 'List Anime 🌸',
                sections: [{
                    title: 'Hasil Pencarian Kitsu',
                    highlight_label: 'Top Matches',
                    rows: rows
                }]
            };

            // Format body content pencarian
            let searchContent = `┃ ⛩️ *𝙰𝙽𝙸𝙼𝙴 𝚂𝙴𝙰𝚁𝙲𝙷 (𝙺𝙸𝚃𝚂𝚄)*\n`;
            searchContent += `┃ ✨ *Query:* ${text}\n`;
            searchContent += `┃ 🏮 *Hasil:* ${results.length} Pilihan ditemukan\n\n`;
            searchContent += `Halo @${m.sender.split`@`[0]}! Silahkan ketuk tombol di bawah ini untuk memilih anime yang ingin kamu lihat info detailnya ya! ✨`;

            // Persiapkan header image pencarian (menggunakan cover anime teratas agar dinamis & kece)
            let headerMedia;
            try {
                const topAnimeImg = results[0].attributes.posterImage?.large || results[0].attributes.posterImage?.medium || global.imgall;
                headerMedia = await prepareWAMessageMedia({ image: { url: topAnimeImg } }, { upload: conn.waUploadToServer });
            } catch (_) {
                headerMedia = await prepareWAMessageMedia({ image: { url: global.imgall } }, { upload: conn.waUploadToServer });
            }

            // Generate Message List Select
            const msg = generateWAMessageFromContent(
                m.chat,
                {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2
                            },
                            interactiveMessage: proto.Message.InteractiveMessage.create({
                                header: proto.Message.InteractiveMessage.Header.create({
                                    title: 'Kitsu Search',
                                    hasMediaAttachment: true,
                                    ...headerMedia
                                }),
                                body: proto.Message.InteractiveMessage.Body.create({
                                    text: searchContent
                                }),
                                footer: proto.Message.InteractiveMessage.Footer.create({
                                    text: global.wm
                                }),
                                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                    messageVersion: 1,
                                    buttons: [{
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify(listMessage) 
                                    }],
                                }),
                                contextInfo: { 
                                    mentionedJid: [m.sender],
                                    forwardingScore: 999,
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: global.idch,
                                        serverMessageId: 143,
                                        newsletterName: `${global.namech}`
                                    }
                                }
                            })
                        }
                    }
                },
                { userJid: conn.user.id, quoted: m }
            );

            // Relay Message
            await conn.relayMessage(m.chat, msg.message, {
                messageId: msg.key.id,
                additionalNodes: [
                    {
                        tag: 'biz',
                        attrs: {},
                        content: [{
                            tag: 'interactive',
                            attrs: { type: 'native_flow', v: '1' },
                            content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }]
                        }]
                    }
                ]
            });

        } catch (e) {
            console.error(e);
            m.reply(`> Error Kitsu Info: ${e.message}`);
        }
    }
};
