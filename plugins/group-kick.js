/** * Plugin Group Kick
 * Feature: Mengeluarkan member dari grup
 */

module.exports = {
    command: ['kick'],
    category: 'group',
    admin: true,     // User yang manggil harus admin
    botAdmin: true,  // Bot harus admin
    call: async (conn, m, { text }) => {
        // Ambil target (bisa dari reply atau mention)
        let users = m.quoted ? [m.quoted.sender] : m.mentionedJid;
        
        if (!users || users.length === 0) {
            return m.reply('Tag atau reply orang yang mau dikick! 🌸');
        }

        try {
            await conn.sendMessage(m.chat, { react: { text: '👢', key: m.key } });

            // Proses mengeluarkan member
            for (let user of users) {
                await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
            }

            m.reply('✨ Sukses mengeluarkan member tersebut. Jangan nakal lagi ya!');
        } catch (e) {
            console.error(e);
            m.reply('Gagal kick member. Pastikan Euphy masih admin dan orangnya masih ada di grup! ❌');
        }
    }
};
