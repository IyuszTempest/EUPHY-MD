/**
 * Euphy-Bot - Smeme Maker V3.0 (Internal Engine - No API)
 * Solusi: Menggunakan Sharp untuk Render Teks Lokal (Anti Error 415)
 */

const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

module.exports = {
    command: ['smeme', 'sm'],
    category: 'tools',
    noPrefix: true, 
    call: async (conn, m, { text, usedPrefix, command, isOwner }) => {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        if (!/image|sticker/.test(mime)) return m.reply(`Kirim/Reply foto atau stiker dengan caption *smeme teks atas | teks bawah* 🌸`);
        if (!text) return m.reply(`Teksnya mana? 🗿\nContoh: *${usedPrefix + command} Atas | Bawah*`);

        await conn.sendMessage(m.chat, { react: { text: "✍️", key: m.key } });

        let [t1, t2] = text.split('|');
        t1 = (t1 || '').trim().toUpperCase();
        t2 = (t2 || '').trim().toUpperCase();

        try {
            // 1. Download Media ke Buffer
            let media = await q.download();
            if (!media) return m.reply('Gagal download media! ❌');

            // 2. Load Gambar & Ambil Ukurannya
            const image = sharp(media);
            const metadata = await image.metadata();
            const width = metadata.width || 512;
            const height = metadata.height || 512;

            // 3. Buat SVG untuk Overlay Teks (Mirip gaya Meme Impact)
            const svgText = `
            <svg width="${width}" height="${height}">
                <style>
                    .title { fill: white; font-size: ${Math.floor(width / 10)}px; font-weight: bold; font-family: sans-serif; stroke: black; stroke-width: ${Math.floor(width / 150)}px; }
                </style>
                ${t1 ? `<text x="50%" y="15%" text-anchor="middle" class="title">${t1}</text>` : ''}
                ${t2 ? `<text x="50%" y="90%" text-anchor="middle" class="title">${t2}</text>` : ''}
            </svg>`;

            // 4. Gabungkan Gambar Asli dengan Teks SVG secara Lokal
            const memeBuffer = await image
                .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
                .webp() // Langsung jadikan WebP biar jadi Sticker
                .toBuffer();

            // 5. Kirim sebagai Sticker
            await conn.sendMessage(m.chat, { 
                sticker: memeBuffer,
                contextInfo: {
                    externalAdReply: {
                        title: "𝙴𝚄𝙿𝙷𝚈 𝚂𝙼𝙴𝙼𝙴 𝙸𝙽𝚃𝙴𝚁𝙽𝙰𝙻",
                        body: "Render Local Engine Success! ✨",
                        thumbnail: memeBuffer,
                        sourceUrl: global.idch,
                        mediaType: 1
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Smeme Internal Error:* ${e.message}`);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        }
    }
};
