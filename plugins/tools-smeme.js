/**
 * Plugin: Smeme (Sticker Meme) Maker V3.3 🎨😂
 * Deskripsi: Membuat stiker meme tulisan atas-bawah menggunakan gabungan Theresav API & Sharp lokal.
 * Style: Clean, Fast, Modern & Saveable WebP Sticker ✨
 */

const fetch = require('node-fetch');
const FormData = require('form-data');
const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    command: ['smeme'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        // 1. Validasi Media: Harus berupa gambar atau stiker
        const isImage = /image/i.test(mime);
        const isSticker = /webp/i.test(mime);

        if (!isImage && !isSticker) {
            await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
            return m.reply(`Kirim atau balas foto/stiker dengan caption:\n*${usedPrefix + command} teks atas | teks bawah* 🌸`);
        }

        // 2. Validasi Teks
        if (!text) {
            await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
            return m.reply(`Teks memenya mana, senpai?\nContoh: *${usedPrefix + command} woylah | cik*`);
        }

        await conn.sendMessage(m.chat, { react: { text: '✍️', key: m.key } });

        // Pemisahan teks atas & bawah
        let [t1, t2] = text.split('|');
        t1 = (t1 || '').trim();
        t2 = (t2 || '').trim();

        try {
            // 3. Unduh Media (Mendukung custom function .download() atau fallback ke stream Baileys murni)
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

            // 4. Bangun Multi-Part Form Data untuk API
            const form = new FormData();
            form.append('bg', mediaBuffer, { 
                filename: `smeme_${Date.now()}.png`, 
                contentType: mime || 'image/png' 
            });
            form.append('top', t1);
            form.append('bottom', t2);
            form.append('apikey', global.thrsavapi);

            // 5. Kirim data ke API Maker Smeme Theresav
            const res = await fetch('https://api.theresav.biz.id/maker/smeme', {
                method: 'POST',
                body: form,
                headers: form.getHeaders(),
                timeout: 25000
            });

            if (!res.ok) throw new Error(`Server API Error: ${res.status} ${res.statusText}`);

            const resultImageBuffer = await res.buffer();

            // Proteksi pembacaan pesan error berbentuk JSON kecil dari API
            if (resultImageBuffer.length < 500) {
                const textCheck = resultImageBuffer.toString('utf-8');
                if (textCheck.includes('"status"') || textCheck.includes('"message"')) {
                    throw new Error(textCheck);
                }
            }

            // 6. ✅ SOLUSI UTAMA: Konversi hasil render gambar dari API ke format WebP Sticker resmi memakai Sharp
            // Langkah ini menjamin stiker tampil sempurna (tidak abu-abu) dan langsung bisa disimpan ke favorit!
            const finalStickerBuffer = await sharp(resultImageBuffer)
                .resize(512, 512, { 
                    fit: 'contain', 
                    background: { r: 0, g: 0, b: 0, alpha: 0 } 
                })
                .webp({ quality: 80 })
                .toBuffer();

            // 7. Kirim stiker hasil konversi murni tanpa iklan
            await conn.sendMessage(m.chat, { 
                sticker: finalStickerBuffer 
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error("Smeme API Error:", e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`❌ *Proses gagal:* ${e.message || "Terjadi kesalahan pada sistem pembuat stiker."}`);
        }
    }
};
