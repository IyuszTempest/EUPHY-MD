/**
 * Euphy-Bot - Donation System 💸
 * Support perkembangan bot Euphy lewat QRIS Natalius!
 */

const fs = require('fs');

module.exports = {
    command: ['donasi', 'donate', 'sedekah', 'qris'],
    category: 'info',
    call: async (conn, m, { usedPrefix, command }) => {
        let caption = `*☕ SUPPORT EUPHY-BOT ☕*\n\n`;
        caption += `Halo Kak! Terima kasih sudah menggunakan Euphy-Bot. Jika kakak ingin membantu biaya maintenance server dan pengembangan bot ini, bisa melalui QRIS di atas ya!\n\n`;
        caption += `*Bisa lewat:* \n`;
        caption += `• Dana / OVO / GoPay / LinkAja / Dll\n`;
        caption += `• All Bank (Scan via Mobile Banking)\n\n`;
        caption += `_Berapapun donasinya, sangat berarti buat kelangsungan hidup bot ini. Terima kasih Sensei!_ 🌸`;

        // Ganti dengan path foto QRIS kamu
        const qrisPath = global.qris; 

        if (fs.existsSync(qrisPath)) {
            await conn.sendMessage(m.chat, { 
                image: { url: qrisPath }, 
                caption: caption 
            }, { quoted: m });
        } else {
            // Jika file gambar tidak ditemukan, kirim teks saja
            m.reply(caption + `\n\n*(Ssst, Owner belum pasang foto QRIS-nya nih!)*`);
        }
    }
};
