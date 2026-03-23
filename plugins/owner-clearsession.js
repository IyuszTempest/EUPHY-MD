/**
 * Euphy-Bot - Clear Sessions/Store ✨
 * Biar bot nggak lag tapi tetap aman (nggak perlu scan ulang)
 */

const fs = require('fs');
const path = require('path');

module.exports = {
    command: ['clearsession'],
    category: 'owner', // Sebaiknya hanya owner yang bisa akses
    owner: true, 
    noPrefix: true,
    call: async (conn, m) => {
        const sessionPath = './session'; // Sesuaikan dengan nama folder session kamu

        try {
            await conn.sendMessage(m.chat, { react: { text: "🧹", key: m.key } });

            if (!fs.existsSync(sessionPath)) {
                return m.reply("Folder session nggak ketemu, aman kok!");
            }

            const files = fs.readdirSync(sessionPath);
            let deletedFilesCount = 0;

            files.forEach(file => {
                // KUNCI UTAMA: Jangan hapus creds.json
                if (file !== 'creds.json') {
                    const filePath = path.join(sessionPath, file);
                    try {
                        // Hapus file atau folder (pre-key, store, dsb)
                        fs.rmSync(filePath, { recursive: true, force: true });
                        deletedFilesCount++;
                    } catch (err) {
                        console.error(`Gagal hapus ${file}:`, err);
                    }
                }
            });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            m.reply(`*Pembersihan Selesai!* 🧹\n\nBerhasil menghapus *${deletedFilesCount}* file sampah.\nFile *creds.json* tetap aman, jadi nggak perlu scan ulang. Bot harusnya makin enteng sekarang! ✨`);

        } catch (e) {
            console.error("Error Clear Session:", e);
            m.reply("❌ Waduh, gagal bersih-bersih nih...");
        }
    }
};
