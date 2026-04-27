/**
 * MissAV Pro Tools 🔞⛩️
 * Fitur: Search Carousel & Detail Downloader
 * Powered by Neotex API ✨
 */

const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const axios = require('axios');

module.exports = {
    command: ['missav', 'missavdetail'],
    category: 'nsfw',
    noPrefix: false,
    premium: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        
        // --- HANDLER SEARCH (MISSAV) ---
        if (command === 'missav') {
            if (!text) return m.reply(`❌ Masukkan kata kunci pencarian!\nContoh: *${usedPrefix + command} Gangbang*`);

            await conn.sendMessage(m.chat, { react: { text: '🥵', key: m.key } });

            try {
                const api = `https://neotex.my.id/search/missav?q=${encodeURIComponent(text)}`;
                const res = await axios.get(api);

                if (!res.data.status || !res.data.results || !Array.isArray(res.data.results.data)) {
                    return m.reply("❌ Gagal mengambil data dari MissAV.");
                }

                const hasil = res.data.results.data.map(item => ({
                    code: item.title,
                    cover: item.thumbnail,
                    title: item.desc,
                    duration: item.duration,
                    url: item.url
                }));

                if (hasil.length === 0) return m.reply("❌ Tidak ada hasil ditemukan.");

                let selected = hasil.slice(0, 15); // Ambil 15 aja biar gak berat
                let cards = [];

                for (let img of selected) {
                    if (!img.cover) continue;
                    let prepared = await prepareWAMessageMedia(
                        { image: { url: img.cover } },
                        { upload: conn.waUploadToServer }
                    );

                    cards.push({
                        header: proto.Message.InteractiveMessage.Header.fromObject({
                            hasMediaAttachment: true,
                            ...prepared
                        }),
                        body: proto.Message.InteractiveMessage.Body.fromObject({
                            text: `📌 *MissAV Result*\n✨ Keyword: *${text}*\n\n*Code:* ${img.code}\n*Durasi:* ${img.duration}\n*Desc:* ${img.title.slice(0, 100)}...`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.fromObject({
                            text: `🔗 Source: MissAV`
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                            buttons: [
                                {
                                    name: "cta_url",
                                    buttonParamsJson: JSON.stringify({ display_text: "🔎 Lihat Detail", url: img.url })
                                },
                                {
                                    name: 'cta_copy',
                                    buttonParamsJson: JSON.stringify({ display_text: '📋 Salin Url', copy_code: img.url })
                                }
                            ]
                        })
                    });
                }

                const msg = await generateWAMessageFromContent(m.chat, {
                    viewOnceMessageV2Extension: {
                        message: {
                            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                                body: proto.Message.InteractiveMessage.Body.fromObject({
                                    text: `⛩️ Hasil pencarian MissAV untuk: *${text}*`
                                }),
                                footer: proto.Message.InteractiveMessage.Footer.fromObject({
                                    text: global.packname
                                }),
                                carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
                            })
                        }
                    }
                }, { userJid: conn.user.id, quoted: m });

                await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

            } catch (e) {
                console.error(e);
                m.reply("⚠️ Terjadi kesalahan saat mencari. Coba lagi nanti ya!");
            }
        }

        // --- HANDLER DETAIL (MISSAVDETAIL) ---
        if (command === 'missavdetail') {
            if (!text) return m.reply(`❌ Masukkan URL MissAV!\nContoh: *${usedPrefix + command} https://missav.live/en/hmn-731*`);
            
            await conn.sendMessage(m.chat, { react: { text: '🔎', key: m.key } });

            try {
                const api = `https://neotex.my.id/tools/missav-detail?url=${encodeURIComponent(text)}`;
                const res = await axios.get(api);
                
                // Pastikan akses data sesuai struktur JSON Neotex
                const r = res.data.results?.data || res.data.result;
                if (!r) return m.reply("❌ Gagal mengambil detail MissAV.");

                let code = (r.details?.code || r.code || "").toLowerCase();
                let cover = code ? `https://fourhoi.com/${code}/cover.jpg` : "https://missav.live/images/noimage.png";

                let teks = `╭━━〔 ⛩️ *𝙼𝙸𝚂𝚂𝙰𝚅 𝙳𝙴𝚃𝙰𝙸𝙻* ⛩️ 〕━━┓\n\n`;
                teks += `🎬 *Judul:* ${r.title}\n`;
                teks += `📅 *Rilis:* ${r.release_date || "-"}\n`;
                teks += `🔖 *Kode:* ${code.toUpperCase() || "-"}\n`;
                teks += `👩 *Aktris:* ${r.details?.actress?.name || "-"}\n\n`;
                teks += `📥 *Download Link:* \n${r.downloadLink || "Tidak tersedia"}\n`;
                teks += `\n┗━━━━━━━━━━━━━┛\n`;
                teks += `_Source: MissAV System_`;

                await conn.sendMessage(m.chat, {
                    image: { url: cover },
                    caption: teks
                }, { quoted: m });

            } catch (err) {
                console.error(err);
                m.reply("❌ Terjadi kesalahan saat mengambil detail. Coba lagi nanti!");
            }
        }
    }
};
