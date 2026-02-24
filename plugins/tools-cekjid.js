module.exports = {
    command: ['ceklid', 'cekjid'],
    category: 'tools',
    premium: true,
    noPrefix: true,
    call: async (conn, m, { isOwner }) => {
        let text = `*─── [ USER INFO ] ───*\n\n`;
        text += `📝 *Name:* ${m.name}\n`;
        text += `🆔 *Your ID:* ${m.sender}\n`;
        text += `👑 *Is Owner:* ${isOwner ? 'Yes (Raja Iblis)' : 'No (Rakyat Jelata)'}\n\n`;
        text += `_Gunakan ID ini jika ingin mendaftarkan owner baru di config._`;
        
        conn.reply(m.chat, text, m);
    }
};
