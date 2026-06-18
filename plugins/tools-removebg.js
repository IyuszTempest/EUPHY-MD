/**
 * Plugin: AI Remove Background via Theresav API 📸
 * Deskripsi: Menghapus latar belakang gambar menggunakan endpoint external API Theresav.
 * Style: Clean & Minimalist ✨
 */

const fetch = require('node-fetch');
const FormData = require('form-data');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    command: ['removebg', 'nobg'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        const quoted = m.quoted ? m.quoted : m;
        const msg = quoted.msg || quoted;
        const mime = msg.mimetype || '';

        if (!/image\/(jpe?g|png)/i.test(mime)) {
            await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
            return m.reply(`Kirim atau *balas gambar* dengan perintah:\n*${command}*`);
        }

        try {
            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

            const mediaType = /image\/(jpe?g|png)/i.test(mime) ? 'image' : null;
            if (!mediaType) throw new Error('Tipe media tidak didukung');

            const stream = await downloadContentFromMessage(msg, mediaType);

            let media = Buffer.alloc(0);
            for await (const chunk of stream) {
                media = Buffer.concat([media, chunk]);
            }

            if (!media || media.length === 0) throw new Error('Gagal mengunduh media dari pesan.');

            const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
            const filename = `image_${Date.now()}.${ext}`;

            const form = new FormData();
            form.append('apikey', global.thrsavapi);
            form.append('image', media, { filename, contentType: mime });

            const res = await fetch('https://api.theresav.biz.id/tools/removebg', {
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
                caption: `*R E M O V E  B G  D O N E*`,
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
            console.error("Theresav RemoveBG Error:", err);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`❌ *Proses gagal:* ${err.message || "Terjadi masalah pada API."}`);
        }
    }
};
