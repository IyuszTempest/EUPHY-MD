module.exports = {
    command: ['me', 'profil'],
    category: 'main',
    noPrefix: true,
    call: async (conn, m) => {
        let user = global.db.data.users[m.sender];
        let status = user.premium ? 'PREMIUM ✨' : 'GRATISAN 👤';
        
        let cap = `*─── [ USER PROFILE ] ───*\n\n`;
        cap += `👤 *Nama:* ${user.name || m.name}\n`;
        cap += `🔢 *Umur:* ${user.age || '-'} Tahun\n`;
        cap += `💎 *Status:* ${status}\n\n`;
        cap += `_Terus gunakan Euphy untuk fitur menarik lainnya!_`;

        conn.reply(m.chat, cap, m);
    }
};
