const fs = require('fs');
const path = require('path');

module.exports = {
    command: ['df'],
    category: 'owner',
    noPrefix: false,
    owner: true,
    call: async (conn, m, { args }) => {
        if (!args[0]) return m.reply('Sebutkan nama file yang mau dihapus!\nContoh: .df tiktok');
        
        let filename = args[0].endsWith('.js') ? args[0] : args[0] + '.js';
        let pathFile = path.join(__dirname, filename);

        if (!fs.existsSync(pathFile)) return m.reply(`File *${filename}* tidak ditemukan!`);

        try {
            fs.unlinkSync(pathFile);
            m.reply(`🗑️ Berhasil menghapus plugin: *${filename}*`);
        } catch (e) {
            console.error(e);
            m.reply(`❌ Gagal menghapus file: ${e.message}`);
        }
    }
};
