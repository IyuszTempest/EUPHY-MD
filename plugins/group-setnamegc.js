/** * Plugin Set Name Group Chat
 * Feature: Mengganti nama grup via chat
 */

module.exports = {
    command: ['setnamegc'],
    category: 'group',
    noPrefix: true, 
    admin: true,       // Hanya admin grup yang bisa ganti
    botAdmin: true,    // Bot harus admin agar punya izin akses
    call: async (conn, m, { text, usedPrefix, command }) => {
        // Validasi input nama baru
        if (!text) return m.reply(`Mana nama barunya hah? 🌸\nContoh: *${usedPrefix + command} Group Wibu Jomokh*`);

        // Batasi panjang nama (WhatsApp maksimal 25 karakter untuk nama grup)
        if (text.length > 50) return m.reply('Aduh, kepanjangan! Maksimal 25 karakter ya. 🏮');

        try {
            await conn.sendMessage(m.chat, { react: { text: '📝', key: m.key } });

            // Update nama grup menggunakan JID chat saat ini
            await conn.groupUpdateSubject(m.chat, text);

            m.reply(`✨ Sukses mengganti nama grup menjadi: *${text}*\nSekarang makin keren deh!`);
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Gagal ganti nama grup. Pastikan Euphy masih admin ya! ❌');
        }
    }
};
                                  
