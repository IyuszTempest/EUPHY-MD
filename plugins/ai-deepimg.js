/**
 * Plugin: DeepAI Image Editor 🎨🤖
 * Deskripsi: Mengedit gambar berdasarkan deskripsi teks instruksi secara instan via Theresav API.
 * Style: Clean & Minimalist ✨
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fetch = require('node-fetch');
const FormData = require('form-data');

module.exports = {
    command: ['deepimg'],
    category: 'ai',
    premium: true,
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        const isImage = /image/i.test(mime);
        const isSticker = /webp/i.test(mime);

        if (!isImage && !isSticker) {
            await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
            return m.reply(`Kirim atau balas foto/stiker dengan caption berisi instruksi edit:\n*${usedPrefix + command} [instruksi edit]* 🌸\n\n*Contoh:* \`${usedPrefix + command} tolong hitamkan karakter ini\``);
        }

        if (!text) {
            await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
            return m.reply(`Tolong masukkan instruksi perintah edit gambarnya ya!\nContoh: *${usedPrefix + command} buat karakternya pakai baju maid*`);
        }

        await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });

        try {
            let mediaBuffer;
            if (typeof q.download === 'function') {
                mediaBuffer = await q.download();
            } else {
                const stream = await downloadContentFromMessage(q.msg || q, isImage ? 'image' : 'sticker');
                let buffer = Buffer.alloc(0);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                mediaBuffer = buffer;
            }

            if (!mediaBuffer || mediaBuffer.length === 0) throw new Error('Gagal mengunduh berkas media.');

            const form = new FormData();
            form.append('image', mediaBuffer, { 
                filename: `edit_${Date.now()}.png`, 
                contentType: mime || 'image/png' 
            });
            form.append('prompt', text.trim());
            form.append('apikey', global.thrsavapi);

            const res = await fetch('https://api.theresav.biz.id/ai/deepai/edit', {
                method: 'POST',
                body: form,
                headers: form.getHeaders(),
                timeout: 45000 
            });

            if (!res.ok) throw new Error(`Server API Error: ${res.status} ${res.statusText}`);

            const resultImageBuffer = await res.buffer();

            if (resultImageBuffer.length < 500) {
                const textCheck = resultImageBuffer.toString('utf-8');
                if (textCheck.includes('"status"') || textCheck.includes('"message"')) {
                    throw new Error(textCheck);
                }
            }

            await conn.sendMessage(m.chat, { 
                image: resultImageBuffer,
                caption: `✨ *AI IMAGE EDIT DONE* ✨\n\n💬 *Prompt:* ${text.trim()}`,
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

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error("DeepAI Edit API Error:", e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`❌ *Proses gagal:* ${e.message || "Terjadi kesalahan pada sistem editor AI."}`);
        }
    }
};
