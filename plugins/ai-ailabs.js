/** * Plugin AI Image Generator (AILabs)
 * Style: Euphylia Magenta - "The King of UI"
 */

const axios = require('axios');

module.exports = {
    command: ['ailabs', 'aiimg'],
    category: 'ai',
    premium: true,
    noPrefix: true, // Disarankan pakai prefix biar rapi
    call: async (conn, m, { text, command, usedPrefix }) => {
        // Cek input prompt
        if (!text) return m.reply(`Mau buat gambar apa hari ini? 🌸\nContoh: *${usedPrefix + command} cyber-city background*`);

        // Reaksi loading
        await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });

        try {
            // Memanggil API IyuszTempest
            const apiEndpoint = `https://iyusztempest.my.id/api/ai?feature=ailabs&query=${encodeURIComponent(text)}&type=image&apikey=${global.apiyus}`;
            const { data } = await axios.get(apiEndpoint);
            
            // Validasi sukses (code: 0)
            if (data.code !== 0) {
                return m.reply('Aduh, gagal bikin gambarnya. Coba prompt lain yuk! 🏮');
            }

            const imageUrl = data.url;

            // Kirim hasil dengan UI mewah
            await conn.sendMessage(m.chat, { 
                image: { url: imageUrl }, 
                caption: `╭━━〔 ⛩️ *AILABS GENERATOR* ⛩️ 〕━━┓\n┃ 🏮 *Prompt:* ${text}\n┃ 👤 *Requester:* @${m.sender.split`@`[0]}\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n_✨ Berhasil dibuat oleh Euphy System_`,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.idch,
                        newsletterName: `AI Generation - ${global.namech}`
                    }
                }
            }, { quoted: m });

            // Reaksi sukses
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Terjadi kesalahan saat menghubungi server AI. Coba lagi nanti ya! ❌');
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
                                   
