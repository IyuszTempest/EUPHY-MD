/** * Plugin Set PP Group Chat
 * Feature: Mengganti foto profil grup via reply gambar
 */

const { uploadImage } = require('../lib/uploadImage'); // Pakai uploader yang sudah kita fix tadi

module.exports = {
    command: ['setppgc'],
    category: 'group',
    noPrefix: true, 
    admin: true,       // Hanya admin grup yang bisa ganti
    botAdmin: true,    // Bot harus admin agar punya izin akses
    call: async (conn, m, { usedPrefix, command }) => {
        // Cek apakah ada media yang di-reply
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        if (!/image/.test(mime)) {
            return m.reply(`Mana gambarnya, Yus? Reply atau kirim gambar dengan caption *${usedPrefix + command}* 🌸`);
        }

        try {
            await conn.sendMessage(m.chat, { react: { text: '🖼️', key: m.key } });

            // Download media menjadi buffer
            let media = await q.download();
            
            // Update foto profil grup menggunakan buffer
            await conn.updateProfilePicture(m.chat, media);

            m.reply('✨ Sukses mengganti foto profil grup! Sekarang makin estetik deh.');
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Gagal ganti PP Grup. Coba pastiin ukuran gambarnya nggak terlalu besar ya! ❌');
        }
    }
};
