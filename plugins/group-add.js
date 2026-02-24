/** * Plugin Group Add
 * Feature: Menambah member baru ke grup via nomor
 */

module.exports = {
    command: ['add', 'invite'],
    category: 'group',
    admin: true,
    botAdmin: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`Masukkan nomor yang mau ditambah!\nContoh: *${usedPrefix + command} 628xxx*`);

        // Bersihkan nomor dari spasi atau simbol
        let users = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

        try {
            await conn.sendMessage(m.chat, { react: { text: '➕', key: m.key } });

            // Proses menambahkan member
            const response = await conn.groupParticipantsUpdate(m.chat, [users], 'add');
            
            // Cek jika nomor tidak bisa ditambah (privasi)
            if (response[0].status === "403") {
                return m.reply('Nomor tersebut diprivasi. Euphy nggak bisa add langsung! 🏮');
            }

            m.reply('✨ Sukses menambahkan member baru ke grup!');
        } catch (e) {
            console.error(e);
            m.reply('Gagal menambah member. Pastikan nomornya benar dan aktif! ❌');
        }
    }
};
