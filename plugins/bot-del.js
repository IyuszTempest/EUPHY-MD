/** * Plugin Delete Chat
 * Feature: Menghapus pesan bot atau pesan orang lain (jika bot admin)
 */

module.exports = {
    command: ['del'],
    category: 'tools',
    noPrefix: true, 
    call: async (conn, m, { isBotAdmin, isAdmin }) => {
        // Cek apakah user me-reply pesan yang mau dihapus
        if (!m.quoted) return m.reply('Reply pesan yang mau kamu hapus, Yus! 🌸');

        try {
            // Data pesan yang di-reply
            const key = {
                remoteJid: m.chat,
                fromMe: m.quoted.fromMe,
                id: m.quoted.id,
                participant: m.quoted.sender
            };

            // Logika penghapusan:
            // 1. Jika itu pesan bot sendiri, bot bisa langsung hapus.
            // 2. Jika itu pesan orang lain, bot HARUS jadi admin grup.
            if (!m.quoted.fromMe && !isBotAdmin) {
                return m.reply('Euphy nggak bisa hapus pesan orang lain kalau bukan admin grup! 🏮');
            }

            // Eksekusi penghapusan pesan
            await conn.sendMessage(m.chat, { delete: key });

            // Reaksi sukses
            await conn.sendMessage(m.chat, { react: { text: '🗑️', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Gagal menghapus pesan. Sepertinya Euphy nggak punya izin atau pesannya sudah hilang. ❌');
        }
    }
};
      
