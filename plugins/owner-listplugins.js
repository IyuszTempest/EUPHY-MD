const fs = require('fs');

module.exports = {
    command: ['listplugin'],
    category: 'owner',
    noPrefix: false,
    owner: true,
    call: async (conn, m, { text, command }) => {
        const files = fs.readdirSync(__dirname).filter(file => file.endsWith('.js'));
        
        // Logika Cari Plugin (jika menggunakan command cp atau ada input text di lp)
        if (command === 'cp' || (command === 'lp' && text)) {
            let query = text.toLowerCase();
            let result = files.filter(f => f.toLowerCase().includes(query));
            
            if (result.length === 0) return m.reply(`Plugin dengan kata kunci *"${text}"* tidak ditemukan.`);
            
            let cap = `🔍 *Hasil Pencarian Plugin:* "${text}"\n\n`;
            result.forEach((v, i) => { cap += `${i + 1}. ${v}\n`; });
            return m.reply(cap);
        }

        // Logika List Plugin standar
        let cap = `📂 *LIST PLUGINS EUPHY*\n\n`;
        files.forEach((v, i) => {
            cap += `${i + 1}. ${v}\n`;
        });
        cap += `\n*Total:* ${files.length} file plugin aktif.`;
        
        conn.reply(m.chat, cap, m);
    }
};
