/** * Plugin Cleanup System
 * Feature: Membersihkan folder tmp dan file session yang tidak penting
 */

const fs = require('fs');
const path = require('path');

module.exports = {
    command: ['cleartmp', 'clearsession', 'cleanup'],
    category: 'owner',
    owner: true, // Khusus Yus supaya aman
    noPrefix: true,
    call: async (conn, m, { command }) => {
        await conn.sendMessage(m.chat, { react: { text: '🧹', key: m.key } });

        if (command === 'cleartmp') {
            const tmpDir = path.join(__dirname, '../tmp');
            if (!fs.existsSync(tmpDir)) return m.reply('Folder tmp tidak ditemukan.');
            
            const files = fs.readdirSync(tmpDir);
            if (files.length === 0) return m.reply('Folder tmp sudah bersih! ✨');

            files.forEach(file => {
                fs.unlinkSync(path.join(tmpDir, file));
            });
            return m.reply(`✨ Berhasil menghapus ${files.length} file sampah di folder tmp.`);
        }

        if (command === 'clearsession' || command === 'cleanup') {
            // Path folder session kamu (sesuaikan jika namanya bukan 'session')
            const sessionDir = path.join(__dirname, '../session'); 
            if (!fs.existsSync(sessionDir)) return m.reply('Folder session tidak ditemukan.');

            const files = fs.readdirSync(sessionDir);
            let deletedFilesCount = 0;

            files.forEach(file => {
                // JANGAN HAPUS creds.json
                if (file !== 'creds.json') {
                    fs.unlinkSync(path.join(sessionDir, file));
                    deletedFilesCount++;
                }
            });

            return m.reply(`🧹 Cleanup Selesai!\n\n🗑️ File dihapus: ${deletedFilesCount}\n✅ File aman: creds.json\n\nBot tetap login, sekarang jadi lebih enteng! 🌸`);
        }
    }
};
