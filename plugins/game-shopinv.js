/**
 * Plugin: Inventory & Showcase 🎒
 */
module.exports = {
    command: ['inv', 'koleksi'],
    category: 'game',
    noPrefix: true,
    call: async (conn, m, { usedPrefix }) => {
        let user = global.db.data.users[m.sender];
        if (!user.koleksi) user.koleksi = { figure: [], baju: [], harian: [], waifu: [], husbu: [] };
        let k = user.koleksi;

        let daftar = `╭━━〔 🎎 *𝙸𝙽𝚅𝙴𝙽𝚃𝙾𝚁𝚈* 〕━━┓\n┃\n`;
        if (k.waifu?.length) daftar += `┣ ❤️ *WAIFU:* ${k.waifu.join(', ')}\n`;
        if (k.husbu?.length) daftar += `┣ 💙 *HUSBU:* ${k.husbu.join(', ')}\n`;
        if (k.figure?.length) daftar += `┣ 🎎 *FIGURE:* ${k.figure.join(', ')}\n`;
        if (k.harian?.length) daftar += `┣ 🛠️ *DAILY:* ${k.harian.join(', ')}\n`;
        
        daftar += `┃\n┣ 🥤 *REDBULL:* ${user.inventory?.redbull || 0} pcs\n`;
        daftar += `┗━━━━━━━━━━━━━┛\n`;
        daftar += `💰 Saldo: Rp${(user.money || 0).toLocaleString()}`;
        return m.reply(daftar);
    }
};
