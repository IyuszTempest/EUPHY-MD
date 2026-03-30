/**
 * Set Welcome & Goodbye Message 🚪✨
 * Custom pesan sambutan & perpisahan dengan PP Default.
 * Format: Unified Plugin System
 */

module.exports = {
    command: ['setwelcome', 'setbye', 'welcome', 'onwelcome', 'offwelcome'],
    category: 'group',
    admin: true,
    group: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        let chat = global.db.data.chats[m.chat];
        const cmd = command.toLowerCase();

        // 1. ON/OFF WELCOME
        if (cmd === 'onwelcome') {
            chat.welcome = true;
            return m.reply('✅ Fitur Welcome & Goodbye diaktifkan di grup ini!');
        }
        
        if (cmd === 'offwelcome') {
            chat.welcome = false;
            return m.reply('❌ Fitur Welcome & Goodbye dinonaktifkan.');
        }

        // 2. SET PESAN WELCOME
        if (cmd === 'setwelcome') {
            if (!text) return m.reply(`Contoh:\n${usedPrefix + command} Halo @user, selamat datang di @group!`);
            chat.sWelcome = text;
            return m.reply(`✅ Pesan Welcome berhasil diatur!`);
        }

        // 3. SET PESAN GOODBYE
        if (cmd === 'setbye') {
            if (!text) return m.reply(`Contoh:\n${usedPrefix + command} Sayonara @user, titip absen ya!`);
            chat.sBye = text;
            return m.reply(`✅ Pesan Goodbye berhasil diatur!`);
        }

        // 4. CEK STATUS & HELP
        if (cmd === 'welcome') {
            let status = `╭━━〔 🚪 *𝚆𝙴𝙻𝙲𝙾𝙼𝙴 𝚂𝙴𝚃𝚃𝙸𝙽𝙶* 〕━━┓\n`;
            status += `┃\n`;
            status += `┃ ⚙️ *Status:* ${chat.welcome ? '✅ Aktif' : '❌ Mati'}\n`;
            status += `┃ 📝 *Welcome:* ${chat.sWelcome || 'Default'}\n`;
            status += `┃ 👋 *Goodbye:* ${chat.sBye || 'Default'}\n`;
            status += `┃\n`;
            status += `┣━━〔 🛠️ *𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂* 〕━━┓\n`;
            status += `┃ 🟢 *${usedPrefix}onwelcome* / *offwelcome*\n`;
            status += `┃ ✍️ *${usedPrefix}setwelcome <teks>*\n`;
            status += `┃ ✍️ *${usedPrefix}setbye <teks>*\n`;
            status += `┃\n`;
            status += `┃*Note:* gunakan @user untuk tag & @group untuk nama grup\n`;
            status += `┗━━━━━━━━━━━━━━━━━┛`;
            
            return m.reply(status);
        }
    }
};
