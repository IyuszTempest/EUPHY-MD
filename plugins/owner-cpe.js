module.exports = {
    command: ['cpe'],
    category: 'owner',
    noPrefix: false,
    owner: true,
    call: async (conn, m, { usedPrefix }) => {
        const plugins = global.plugins;
        let errList = [];
        let total = 0;

        for (let name in plugins) {
            total++;
            if (!plugins[name] || plugins[name].error) {
                errList.push(`│ ❌ ${name}`);
            }
        }

        let text = `*─── [ PLUGIN CHECKER ] ───*\n\n`;
        text += `📊 *Total Plugin:* ${total}\n`;
        text += `✅ *Status:* ${errList.length === 0 ? 'Semua Berjalan Normal' : 'Ditemukan Masalah'}\n\n`;
        
        if (errList.length > 0) {
            text += `┌── [ *LIST ERROR* ]\n`;
            text += errList.join('\n') + '\n';
            text += `└───────────────\n`;
        } else {
            text += `Semua plugin ter-load dengan sempurna! ✨`;
        }

        conn.reply(m.chat, text, m);
    }
};
