/** * Plugin Live3D AI - Anime Style Generator
 * Style: Euphylia Magenta UI
 */

const axios = require('axios');

module.exports = {
    command: ['live3d'],
    category: 'ai',
    noPrefix: true, // Disarankan pakai prefix agar tidak bentrok dengan chat biasa
    premium: false,
    call: async (conn, m, { text, command, usedPrefix }) => {
        // Cek input prompt dari user
        if (!text) return m.reply(`Mau buat gambar anime 3D apa? 🌸\nContoh: *${usedPrefix + command} anime cute girls*`);

        // Reaksi loading biar bot terasa responsif [cite: 2025-05-24]
        await conn.sendMessage(m.chat, { react: { text: '🌀', key: m.key } });

        try {
            // Memanggil API IyuszTempest
            // Pastikan global.apikey sudah terdefinisi di config.js kamu
            const apiEndpoint = `https://iyusztempest.my.id/api/ai?feature=live3d&query=${encodeURIComponent(text)}&style=Anime&apikey=${global.apiyus}`;
            const { data } = await axios.get(apiEndpoint);
            
            // Validasi status response API
            if (data.status !== "success") {
                return m.reply('Maaf, AI gagal memproses gambar 3D tersebut. Coba prompt lain yang lebih spesifik ya! 🏮');
            }

            const imageUrl = data.result;

            // Kirim hasil gambar dengan UI estetik
            await conn.sendMessage(m.chat, { 
                image: { url: imageUrl }, 
                caption: `╭━━〔 ⛩️ *LIVE3D GENERATOR* ⛩️ 〕━━┓\n┃ 🏮 *Prompt:* ${text}\n┃ ✨ *Style:* Anime 3D\n┃ 👤 *Requester:* @${m.sender.split`@`[0]}\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n_Powered by IyuszTempest AI_`,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.idch,
                        newsletterName: `AI Art - ${global.namech}`
                    }
                }
            }, { quoted: m });

            // Reaksi sukses
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Terjadi kesalahan saat menghubungi server Live3D AI. Coba lagi nanti ya! ❌');
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
                                                                                                                              
