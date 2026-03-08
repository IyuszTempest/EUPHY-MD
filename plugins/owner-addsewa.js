/** * Fitur Add Sewa - Owner Only
 * Contoh: .addsewa 30 (untuk 30 hari)
 */

module.exports = {
    command: ['addsewa'],
    category: 'owner',
    noPrefix: true,
    call: async (conn, m, { text }) => {
        // Cek apakah yang manggil owner/lidowner
        const isOwner = [...global.owner.map(v => v[0]), ...(global.lidowner || [])].some(number => m.sender.includes(number.replace(/[^0-9]/g, '')));
        if (!isOwner) return m.reply('Fitur ini khusus Owner! 🏮');

        if (!text) return m.reply('Masukkan durasi hari! Contoh: .addsewa 30');
        
        let jumlahHari = parseInt(text);
        let expired = Date.now() + (jumlahHari * 86400000);
        
        if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { expired: 0 };
        global.db.data.chats[m.chat].expired = expired;

        let tgl = new Date(expired).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        m.reply(`╭━━〔 ⛩️ *𝚂𝙴𝚆𝙰 𝙰𝙲𝚃𝙸𝚅𝙴* ⛩️ 〕━━┓\n┃ ✨ Berhasil set sewa: ${jumlahHari} Hari\n┃ 📅 Expired pada: ${tgl}\n┗━━━━━━━━━━━━━━━━━━━━┛`);
    }
};
