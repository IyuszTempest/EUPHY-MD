/**
 * Plugin: Owner Welcome (Auto Greeting) 👑
 * Fitur: Memberikan sambutan otomatis saat Owner mengirim pesan di grup.
 */

module.exports = {
    // Menggunakan properti before untuk menangani setiap pesan masuk
    before: async function (m, { conn }) {
        if (!m.isGroup) return; // Hanya aktif di grup
        if (m.fromMe) return;   // Abaikan jika bot yang kirim pesan

        // Identitas Owner (Nomor kamu sendiri)
        const ownerNumber = global.targetjid;
        
        // Cek apakah pengirim adalah Owner
        if (m.sender !== ownerNumber) return;

        // Inisialisasi database user jika belum ada
        let user = global.db.data.users[m.sender] || {};
        let now = +new Date();

        // Cooldown: Hanya menyapa 1 jam sekali agar tidak spam
        if (user.ownerWelcome && now - user.ownerWelcome < 3600000) return;

        // Update waktu sambutan terakhir di database
        user.ownerWelcome = now;
        global.db.data.users[m.sender] = user;

        // Mengirim pesan sambutan
        await conn.sendMessage(m.chat, {
            text: `Waspada, ownerku dah datang.\n@${ownerNumber.split('@')[0]}`,
            mentions: [ownerNumber]
        }, { quoted: m });
    }
};
