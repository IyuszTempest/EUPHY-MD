/**
 * Euphy-Bot - Terminal Executor
 * Fitur: Menjalankan perintah terminal via WhatsApp (Khusus Owner)
 */

const { exec } = require('child_process')

module.exports = {
    command: ['$'],
    category: 'owner',
    noPrefix: true,
    owner: true, // PENTING: Hanya kamu yang bisa pakai
    call: async (conn, m, { text, isOwner }) => {
        if (!text) return m.reply('Masukkan perintah terminalnya!')
        
        // Reaksi proses
        await conn.sendMessage(m.chat, { react: { text: "💻", key: m.key } })

        exec(text, (err, stdout, stderr) => {
            if (err) {
                return m.reply(`*— [ ERROR ] —*\n\n${err.message}`)
            }
            if (stderr) {
                return m.reply(`*— [ STDERR ] —*\n\n${stderr}`)
            }
            if (stdout) {
                return m.reply(`*— [ STDOUT ] —*\n\n${stdout}`)
            }
            m.reply('Perintah berhasil dijalankan tanpa output.')
        })
    }
}
