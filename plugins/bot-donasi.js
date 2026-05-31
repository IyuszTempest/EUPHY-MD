/**
 * Euphy-Bot - Donation System 💸
 * Support perkembangan bot Euphy lewat QRIS Natalius!
 */

module.exports = {
    command: ['donasi', 'donate', 'sedekah', 'qris'],
    category: 'main',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        const namabt = global.namebot;
        let caption = `*☕ Support ${namabt} ☕*\n\n`;
        caption += `Halo Kak! Terima kasih sudah menggunakan ${namabt}. Jika kakak ingin membantu biaya maintenance server dan pengembangan bot ini, bisa melalui QRIS di atas ya!\n\n`;
        caption += `*Bisa lewat:* \n`;
        caption += `• Dana / OVO / GoPay / LinkAja / Dll\n`;
        caption += `• All Bank (Scan via Mobile Banking)\n\n`;
        caption += `_Berapapun donasinya, sangat berarti buat kelangsungan hidup bot ini. Terima kasih!_ `;

        // Ambil link dari global.qris
        const qrisUrl = global.qris; 

        try {
            if (qrisUrl) {
                await conn.sendMessage(m.chat, { 
                    image: { url: qrisUrl }, 
                    caption: caption 
                }, { quoted: m });
            } else {
                // Jika global.qris kosong
               return m.reply(caption + `\n\n*(Ssst, Owner belum setting link QRIS di config!)*`);
            }
        } catch (e) {
            console.error(e);
            m.reply(`⚠️ Gagal memuat gambar QRIS. Pastikan link di config.js aktif!`);
        }
    }
};
    
