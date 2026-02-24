/** * Plugin F2Anime - Convert Image to Anime
 * Fix: Uploader Catbox & API IyuszTempest
 */

const axios = require('axios');
const { uploadImage } = require('../lib/uploadImage'); // Pastikan path ke lib benar

module.exports = {
    command: ['toanime', 'jadianime'],
    category: 'ai',
    noPrefix: true, 
    premium: true,
    call: async (conn, m, { text, command, usedPrefix }) => {
        // Ambil media dari reply atau pesan itu sendiri
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        // Cek apakah ada gambar atau link
        if (!/image/.test(mime) && !text.startsWith('http')) {
            return m.reply(`Kirim atau reply gambar dengan caption *${usedPrefix + command}* untuk jadi anime! 🌸`);
        }

        try {
            // Reaksi loading awal
            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
            
            let url;
            if (/image/.test(mime)) {
                let media = await q.download();
                if (!media) throw new Error("Gagal mendownload media dari WhatsApp.");
                
                // Upload ke Catbox (lebih stabil dari Telegra.ph)
                url = await uploadImage(media); 
            } else {
                url = text;
            }

            // Reaksi saat memproses ke API
            await conn.sendMessage(m.chat, { react: { text: '🪄', key: m.key } });

            // Panggil API IyuszTempest
            const apiEndpoint = `https://iyusztempest.my.id/api/ai?feature=f2anime&apikey=yusz123&query=${encodeURIComponent(url)}`;
            const { data } = await axios.get(apiEndpoint);
            
            // Validasi hasil sesuai struktur JSON API-mu
            if (data.status !== "success") {
                return m.reply(`API Error: ${data.msg || 'Gagal memproses gambar.'}`);
            }

            // Kirim hasil dengan UI Euphylia Magenta
            await conn.sendMessage(m.chat, { 
                image: { url: data.result }, 
                caption: `🏮 *SUCCESS TO ANIME*\n\n👤 *Requester:* @${m.sender.split`@`[0]}\n✨ *Style:* F2Anime\n\n_Powered by IyuszTempest_`,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.idch,
                        newsletterName: `AI Anime - ${global.namech}`
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            // Detail error agar mudah di-debug di terminal
            m.reply(`Aduh gagal! ❌\nDetail: ${e.message}`);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
                                   
