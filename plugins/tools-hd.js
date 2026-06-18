/**
 * Plugin: AI Image Upscaler (HD) via Theresav API 📸
 * Deskripsi: Meningkatkan resolusi gambar menggunakan endpoint external API Theresav.
 * Style: Clean & Minimalist ✨
 */

const fetch = require('node-fetch');
const FormData = require('form-data');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    command: ['hd'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        const quoted = m.quoted ? m.quoted : m;

        const mime = (quoted.msg || quoted).mimetype || '';
        
        const messageType = quoted.message ? Object.keys(quoted.message)[0] : m.mtype;

        if (!/image\/(jpe?g|png)/i.test(mime)) {
            await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
            return m.reply(`Kirim atau *balas gambar* dengan perintah:\n*${command}*`);
        }

        try {
            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

            const stream = await downloadContentFromMessage(
                quoted.msg || quoted,
                messageType.replace('Message', '')
            );
            
            let media = Buffer.alloc(0);
            for await (const chunk of stream) {
                media = Buffer.concat([media, chunk]);
            }

            const ext = mime.split('/')[1] || 'jpg';
            const filename = `image_${Date.now()}.${ext}`;

            const form = new FormData();
            form.append('scale', '2');
            form.append('apikey', global.thrsavapi);
            form.append('image', media, { filename, contentType: mime });

            const res = await fetch('https://api.theresav.biz.id/tools/hd', {
                method: 'POST',
                body: form,
                headers: form.getHeaders()
            });

            if (!res.ok) throw new Error(`Server API Error: ${res.status} ${res.statusText}`);

            const resultBuffer = await res.buffer();

            if (resultBuffer.length < 500) {
                const textCheck = resultBuffer.toString('utf-8');
                if (textCheck.includes('"status"') || textCheck.includes('"message"')) {
                    throw new Error(textCheck);
                }
            }

            await conn.sendMessage(m.chat, {
                image: resultBuffer,
                caption: `*H D  D O N E*`,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.idch,
                        newsletterName: global.namech,
                        serverMessageId: 143
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

        } catch (err) {
            console.error("Theresav HD Error:", err);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`❌ *Upscaling gagal:* ${err.message || "Terjadi masalah pada API."}`);
        }
    }
};
