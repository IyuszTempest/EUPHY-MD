/**
 * Euphy-Bot - Plugin Tester / Evaluator
 * Jalankan kode JS langsung lewat chat!
 */

const { exec } = require('child_process');
const util = require('util');

module.exports = {
    command: ['eval', '>'],
    category: 'owner',
    noPrefix: true, // Sebaiknya pakai prefix biar gak sembarang ke-trigger
    owner: true,    // Pastikan bot kamu punya pengecekan status owner
    call: async (conn, m, { text, args, usedPrefix, command }) => {
        if (!text) return m.reply(`Masukkan kode JS yang mau dites!`);

        // Shortcut biar gak capek ngetik console.log
        let evalCmd;
        try {
            evalCmd = await eval(`(async () => { ${text} })()`);
        } catch (e) {
            evalCmd = e;
        }

        // Kirim hasil eksekusi balik ke chat
        return m.reply(util.format(evalCmd));
    }
};
