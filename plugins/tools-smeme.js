/**
 * Euphy-Bot - Smeme Maker V3.1 (Clean Mode) 🎨⛩️
 * Fokus: Render lokal Sharp tanpa External Ad Reply.
 */

const sharp = require('sharp');

module.exports = {
    command: ['smeme', 'sm'],
    category: 'tools',
    noPrefix: true, 
    call: async (conn, m, { text, usedPrefix, command }) => {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        if (!/image|sticker/.test(mime)) return m.reply(`Kirim/Reply foto atau stiker dengan caption:\n*${usedPrefix + command} teks atas | teks bawah* 🌸`);
        if (!text) return m.reply(`Teksnya mana?\nContoh: *${usedPrefix + command} teks atas | teks bawah*`);

        await conn.sendMessage(m.chat, { react: { text: "✍️", key: m.key } });

        let [t1, t2] = text.split('|');
        t1 = (t1 || '').trim().toUpperCase();
        t2 = (t2 || '').trim().toUpperCase();

        try {
            let media = await q.download();
            if (!media) return m.reply('Gagal download media! ❌');

            const image = sharp(media);
            const metadata = await image.metadata();
            const width = metadata.width || 512;
            const height = metadata.height || 512;

            const fontSize = Math.floor(width / 10);
            const strokeWidth = Math.floor(width / 150);

            const svgText = `
            <svg width="${width}" height="${height}">
                <style>
                    .title { 
                        fill: white; 
                        font-size: ${fontSize}px; 
                        font-weight: bold; 
                        font-family: sans-serif; 
                        stroke: black; 
                        stroke-width: ${strokeWidth}px; 
                    }
                </style>
                ${t1 ? `<text x="50%" y="15%" text-anchor="middle" class="title">${t1}</text>` : ''}
                ${t2 ? `<text x="50%" y="90%" text-anchor="middle" class="title">${t2}</text>` : ''}
            </svg>`;

            const stikerBuffer = await image
                .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
                .webp({ quality: 80 })
                .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .toBuffer();

            // PENGIRIMAN BIASA (CLEAN)
            await conn.sendMessage(m.chat, { 
                sticker: stikerBuffer 
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Error:* ${e.message}`);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        }
    }
};
