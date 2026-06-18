/**
 * Plugin: Live Report & Request Hub 🛠️
 * Deskripsi: Sistem penerus laporan error dan ide fitur langsung ke Owner.
 * Style: Clean, Modern & Friendly ✨
 */

module.exports = {
    command: ['lapor', 'report', 'request', 'req'],
    category: 'main',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        const ownerNomor = (global.owner && global.owner[0] ? global.owner[0] : conn.user.id.split(':')[0]) + '@s.whatsapp.net';
        const cmd = command.toLowerCase();

        // 1. Panduan penggunaan jika input kosong
        if (!text) {
            return m.reply(
                `✨ *REPORT & REQUEST HUB* ✨\n\n` +
                `Ada fitur yang error atau punya ide keren? Kirim lewat sini ya!\n` +
                `└ \`${usedPrefix + command} [isi pesan]\`\n\n` +
                `*Contoh:* \`${usedPrefix + command} Fitur Spotify tidak bisa memutar lagu\``
            );
        }

        // 2. Validasi panjang teks
        if (text.length < 5) return m.reply('❌ Pesan terlalu pendek! Berikan keterangan minimal 5 karakter.');
        if (text.length > 1000) return m.reply('❌ Pesan terlalu panjang! Batas maksimal adalah 1000 karakter.');

        // Penentuan tipe kategori laporan
        const isRequest = cmd === 'request' || cmd === 'req';
        const label = isRequest ? '💡 REQUEST FITUR' : '⚠️ LAPORAN ERROR';
        

        let laporanToOwner = `*${label}*\n\n`
                           + `👤 *Pengirim:* ${m.pushName || 'User'}\n`
                           + `💬 *Isi Pesan:* ${text.trim()}`;

        try {
            // Kirim pesan ke nomor Owner
            await conn.sendMessage(ownerNomor, { text: laporanToOwner }, { quoted: m });
            
            // Memberikan feedback reaksi emoji pada pesan user
            await conn.sendMessage(m.chat, { react: { text: '🚀', key: m.key } });
            
            return m.reply(
                `🎉 *Laporan Sukses Terkirim!*\n\n` +
                `Pesan kamu sudah masuk ke room chat Owner bot, nih. ` +
                `Makasih banyak ya atas kontribusinya! Oh iya, pantau terus perkembangan dan perbaikannya di Channel WA kita, ya! ✨`
            );

        } catch (e) {
            console.error("Report System Error:", e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply('❌ *Gagal Mengirim:* Terjadi pemutusan gerbang koneksi internal pada bot.');
        }
    }
};
