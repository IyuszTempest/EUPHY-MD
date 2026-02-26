const fs = require('fs');

module.exports = {
    command: ['backupdb'],
    category: 'owner',
    owner: true, // Biar cuma kamu yang bisa panggil
    call: async (conn, m) => {
        try {
            if (!fs.existsSync('./database.json')) return m.reply('Database gak ketemu!');
            
            await conn.sendMessage(m.chat, {
                document: fs.readFileSync('./database.json'),
                mimetype: 'application/json',
                fileName: `backup_${Date.now()}.json`,
                caption: 'Ini backup database kamu ya!'
            }, { quoted: m });
        } catch (e) {
            m.reply(`Gagal backup: ${e.message}`);
        }
    }
};
