/**
 * Euphy-Bot - Tag All Members
 * Category: Group
 */

module.exports = {
    command: ['tagall', 'everyone', 'semua'],
    category: 'group',
    premium: true,
    noPrefix: false, 
    call: async (conn, m, { args, text, isOwner }) => {
        // Cek apakah pesan dikirim di grup
        if (!m.isGroup) return m.reply('Fitur ini cuma bisa dipake di dalam grup ya! 👥');

        // Ambil metadata grup dan daftar member
        const groupMetadata = await conn.groupMetadata(m.chat);
        const participants = groupMetadata.participants;
        
        // Logika Admin (Hanya admin atau owner yang bisa tagall)
        const admins = participants.filter(p => p.admin !== null).map(p => p.id);
        const isAdmin = admins.includes(m.sender) || isOwner;
        
        if (!isAdmin) return m.reply('Waduh, fitur ini cuma buat Admin grup atau Owner Euphy aja! 👑');

        // Susun teks pesan
        let pesan = text ? text : 'Tanpa Pesan';
        let teksall = `*─── [ ⛩️ TAG ALL MEMBERS ⛩️ ] ───*\n\n`;
        teksall += `📢 *Pesan:* ${pesan}\n\n`;
        
        for (let mem of participants) {
            teksall += `  ◦ ⁠✿ @${mem.id.split('@')[0]}\n`;
        }
        
        teksall += `\n*Total:* ${participants.length} Member\n${global.wm}`;

        // Kirim pesan dengan mention semua member
        conn.sendMessage(m.chat, { 
            text: teksall, 
            mentions: participants.map(a => a.id) 
        }, { quoted: m });
    }
};
