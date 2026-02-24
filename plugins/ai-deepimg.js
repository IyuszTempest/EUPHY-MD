/** * Plugin DeepImage AI - Image Generator
 * Feature: Realistic & Anime Style Switcher
 */

const axios = require('axios');

module.exports = {
    command: ['deepimg', 'deepai'],
    category: 'ai',
    noPrefix: false, // Diubah ke false agar lebih rapi dengan usedPrefix
    premium: true,
    call: async (conn, m, { text, command, usedPrefix }) => {
        // Pisahkan gaya dan prompt
        // Penggunaan: .deepimg anime|loli cute atau .deepimg realistic|futuristic car
        let [style, ...promptParts] = text.split('|');
        let prompt = promptParts.join('|');
        let selectedStyle = (style || '').toLowerCase();

        // Validasi input
        if (!text || !prompt) {
            return m.reply(`Cara pakai: *${usedPrefix + command} style|prompt*\n\nContoh:\n1. *${usedPrefix + command} anime|kawaii girl*\n2. *${usedPrefix + command} realistic|cyberpunk city*`);
        }

        // Default ke realistic jika gaya yang dimasukkan salah
        if (!['anime', 'realistic'].includes(selectedStyle)) {
            selectedStyle = 'realistic';
        }

        // Reaksi kamera untuk kesan realistik
        await conn.sendMessage(m.chat, { react: { text: '📸', key: m.key } });

        try {
            // Memanggil API IyuszTempest
            const apiEndpoint = `https://iyusztempest.my.id/api/ai?feature=deepimg&query=${encodeURIComponent(prompt)}&style=${selectedStyle}&apikey=${global.apiyus}`;
            const { data } = await axios.get(apiEndpoint);
            
            // Validasi sukses sesuai JSON: result.url
            if (data.status !== "success" || !data.result?.url) {
                return m.reply('Maaf, Euphy gagal memproses gambar tersebut. Coba prompt lain yuk! 🏮');
            }

            const imageUrl = data.result.url;

            // Kirim hasil dengan UI Estetik
            await conn.sendMessage(m.chat, { 
                image: { url: imageUrl }, 
                caption: `╭━━〔 ⛩️ *DEEPIMAGE AI* ⛩️ 〕━━┓\n┃ 🏮 *Prompt:* ${prompt}\n┃ ✨ *Style:* ${selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)}\n┃ 👤 *Requester:* @${m.sender.split`@`[0]}\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n_Powered by IyuszTempest AI_`,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.idch,
                        newsletterName: `Deep AI Gen - ${global.namech}`
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Terjadi kesalahan saat menghubungi server DeepImage AI. ❌');
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
        
