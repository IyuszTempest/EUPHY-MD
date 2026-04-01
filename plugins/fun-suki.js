/**
 * Plugin: Top 5 Member Suki (Minimalist) 🏮
 */

module.exports = {
    command: ['suki'],
    category: 'fun',
    group: true,
    noPrefix: true,
    call: async (conn, m, { participants }) => {
        // Ambil member, acak, lalu ambil 5 orang
        let member = participants.map(u => u.id).filter(v => v !== conn.user.id);
        let shuffled = member.sort(() => 0.5 - Math.random());
        let top5 = shuffled.slice(0, 5);
        
        let teks = `🏮 *TOP 5 MEMBER SUKI DI GRUP INI* 🏮\n\n`;

        top5.forEach((jid, i) => {
            teks += `${i + 1}. @${jid.split('@')[0]}\n`;
        });

        teks += `\n_Fix no debat!_ 🗿`;

        return conn.sendMessage(m.chat, { 
            text: teks, 
            mentions: top5 
        }, { quoted: m });
    }
};
