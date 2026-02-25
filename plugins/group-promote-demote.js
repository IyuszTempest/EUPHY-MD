/** * Euphy-Bot - Admin Management V2 (Safe Target Detection)
 * Fitur: Promote & Demote Member (Owner/Admin Only)
 */

module.exports = {
    command: ['promote', 'demote'],
    category: 'admin',
    noPrefix: true,
    group: true, // Hanya bisa di grup
    admin: true, // Hanya admin grup yang bisa pakai
    botAdmin: true, // Euphy harus jadi admin grup
    call: async (conn, m, { command, text }) => {
        // --- [ LOGIKA DETEKSI TARGET AMAN ] ---
        let users;
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            users = m.mentionedJid[0]; // Ambil dari tag @
        } else if (m.quoted && m.quoted.sender) {
            users = m.quoted.sender; // Ambil dari reply chat
        } else if (text && text.replace(/[^0-9]/g, '').length > 0) {
            users = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'; // Ambil dari ketikan nomor
        }

        // Jika target tidak ditemukan, ingatkan user daripada bikin error
        if (!users) return m.reply(`Tag atau reply orang yang mau di ${command}, Yus! [cite: 2025-05-24]`);

        try {
            if (command === 'promote') {
                await conn.groupParticipantsUpdate(m.chat, [users], 'promote');
                m.reply(`╭━━〔 ⛩️ *𝙿𝚁𝙾𝙼𝙾𝚃𝙴* ⛩️ 〕━━┓\n┃ ✨ @${users.split('@')[0]} Berhasil jadi admin!\n┗━━━━━━━━━━━━━━━━━━━━┛`, null, { mentions: [users] });
            } else if (command === 'demote') {
                await conn.groupParticipantsUpdate(m.chat, [users], 'demote');
                m.reply(`╭━━〔 ⛩️ *𝙳𝙴𝙼𝙾𝚃𝙴* ⛩️ 〕━━┓\n┃ 🏮 @${users.split('@')[0]} Turun jabatan!\n┗━━━━━━━━━━━━━━━━━━━━┛`, null, { mentions: [users] });
            }
        } catch (e) {
            console.error(e);
            m.reply(`Gagal ${command}, ada error: ${e.message}`);
        }
    }
};
