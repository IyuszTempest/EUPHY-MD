/**
 * Report & Request System 🛠️
 * Feature: Lapor Error, Request Fitur, & Help
 * Format: Unified Plugin System
 */

module.exports = {
    command: ['lapor', 'report', 'request', 'req', 'helplapor'],
    category: 'main',
    premium: false,
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        const ownerNomor = global.owner[0] + '@s.whatsapp.net'; // Ambil nomor owner dari config

        const cmd = command.toLowerCase();

        // --- 1. MENU HELP ---
        if (cmd === 'helplapor') {
            let h = `╭━━〔 🛠️ *𝙿𝚄𝚂𝙰𝚃 𝙻𝙰𝙿𝙾𝚁𝙰𝙽* 〕━━┓\n`;
            h += `┃\n`;
            h += `┃ 1️⃣ *Lapor Error:* \n`;
            h += `┃ \`${usedPrefix}lapor <pesan>\` \n`;
            h += `┃ Gunakan jika ada fitur yang mati.\n`;
            h += `┃\n`;
            h += `┃ 2️⃣ *Request Fitur:* \n`;
            h += `┃ \`${usedPrefix}request <ide fitur>\` \n`;
            h += `┃ Ajukan ide plugin baru kamu.\n`;
            h += `┃\n`;
            h += `┃ ⚠️ *Catatan:* \n`;
            h += `┃ Jangan main-main atau spam lapor!\n`;
            h += `┃\n`;
            h += `┗━━━━━━━━━━━━━━━━━━━━┛\n`;
            h += `_Laporanmu akan langsung terkirim ke Owner._`;
            return m.reply(h);
        }

        // --- 2. LOGIKA LAPOR / REQUEST ---
        if (!text) return m.reply(`Mana pesannya? Contoh: \`${usedPrefix + command} Bang, fitur Sawit error pas mau panen! ketik .helplapor untuk selengkapnya\``);
        if (text.length < 5) return m.reply(`Laporan terlalu pendek! Minimal 5 karakter.`);
        if (text.length > 1000) return m.reply(`Laporan terlalu panjang! Maksimal 1000 karakter.`);

        let jenis = (cmd === 'request' || cmd === 'req') ? '💡 REQUEST FITUR' : '⚠️ LAPORAN ERROR';
        
        let laporanToOwner = `*─── [ ${jenis} ] ───*\n\n`;
        laporanToOwner += `👤 *Pengirim:* ${m.pushName || 'User'}\n`;
        laporanToOwner += `📱 *Nomor:* wa.me/${m.sender.split('@')[0]}\n`;
        laporanToOwner += `💬 *Pesan:* ${text}\n\n`;
        laporanToOwner += `*──────────────────*`;

        try {
            // Kirim ke Owner
            await conn.sendMessage(ownerNomor, { text: laporanToOwner }, { quoted: m });
            
            // Reaksi Berhasil
            await conn.sendMessage(m.chat, { react: { text: '📩', key: m.key } });
            
            let resUser = `✅ *TERKIRIM!*\n\n`;
            resUser += `Laporan/Request kamu sudah diteruskan ke Owner.\n`;
            resUser += `Mohon tunggu tanggapan dan ikuti channel untuk melihat respon dari owner. Terima kasih!\n`;
            resUser += `Link CH: https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c`;
            return m.reply(resUser);

        } catch (e) {
            console.error(e);
            return m.reply(`❌ Gagal mengirim laporan. Sepertinya ada masalah pada koneksi bot.`);
        }
    }
};
