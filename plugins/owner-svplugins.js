const fs = require('fs');
const path = require('path');

module.exports = {
    command: ['sp'],
    category: 'owner',
    noPrefix: false,
    owner: true,
    call: async (conn, m, { text, args }) => {
        if (!text) return m.reply(`Kirim/Reply kodenya dan kasih nama filenya!\nContoh: .sv tiktok`);
        
        // Menambahkan .js secara otomatis jika belum ada
        let filename = args[0].endsWith('.js') ? args[0] : args[0] + '.js';
        let pathFile = path.join(__dirname, filename);
        
        // Mengambil teks dari reply atau dari argumen setelah nama file
        let code = m.quoted ? m.quoted.text : text.replace(args[0], '').trim();
        if (!code) return m.reply('Kodenya mana? Reply atau ketik kodenya setelah nama file.');

        try {
            await fs.writeFileSync(pathFile, code);
            m.reply(`✅ Berhasil menyimpan plugin: *${filename}*`);
        } catch (e) {
            console.error(e);
            m.reply(`❌ Gagal menyimpan file: ${e.message}`);
        }
    }
};
