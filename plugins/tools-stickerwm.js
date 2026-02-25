/** * Euphy-Bot - Sticker Watermark Changer
 * Fitur: Mengubah WM stiker atau membuat stiker dengan WM kustom
 */

const { Sticker, StickerTypes } = require('wa-sticker-formatter'); // Pastikan sudah install library ini

module.exports = {
    command: ['stickerwm', 'wm'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { text }) => {
        // Deteksi media yang di-reply atau dikirim
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';
        
        if (!/image|webp|video/.test(mime)) return m.reply('Reply stiker untuk diubah WM-nya, contoh: .wm iyus|ganteng');

        // Ambil nama paket dan author dari input text [cite: 2025-05-24]
        // Format: .swm PackName|Author
        let [packname, author] = text.split('|');
        if (!packname) packname = 'Euphy-Bot'; // Default packname
        if (!author) author = 'IyuszTempest'; // Default author

        try {
            await conn.sendMessage(m.chat, { react: { text: "🎨", key: m.key } });
            let img = await q.download();
            
            // Proses pembuatan stiker dengan metadata baru
            let sticker = new Sticker(img, {
                pack: packname.trim(), // Nama Paket Stiker
                author: author.trim(), // Nama Pembuat (Yus) [cite: 2025-05-24]
                type: StickerTypes.FULL,
                categories: ['🤩', '✨'],
                id: '12345',
                quality: 70, // Menjaga penggunaan RAM tetap irit
                background: '#00000000'
            });

            const buffer = await sticker.toBuffer();
            await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`Gagal mengubah WM stiker! ❌\nError: ${e.message}`);
        }
    }
};
              
