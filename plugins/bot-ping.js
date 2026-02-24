/**
 * Euphy-Bot - Ping Plugin (Fixed UI)
 * Fitur: Speed Test & System Info with Auto UI
 */

const os = require('os');
const { performance } = require('perf_hooks');

module.exports = {
    command: ['ping'],
    category: 'main',
    noPrefix: true,
    // Kita tambahkan parameter default {} biar gak error destructure
    call: async (conn, m, { usedPrefix = '/' }) => {
        const start = performance.now();
        const end = performance.now();
        const latensi = (end - start).toFixed(4);

        // Data Spek Server Lunes Host kamu
        let uptime = clockString(process.uptime() * 1000);
        let ramTerpakai = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        let ramTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);

        let pingMsg = `───「 *SYSTEM STATUS* 」───\n\n`
                    + `🚀 *Latensi:* ${latensi} ms\n`
                    + `⌚ *Uptime:* ${uptime}\n`
                    + `📟 *RAM:* ${ramTerpakai} MB / ${ramTotal} GB\n`
                    + `⚙️ *Engine:* Node.js ${process.version}\n`
                    + `📂 *Total Plugins:* ${Object.keys(global.plugins).length}\n\n`
                    + `_Server beroperasi dengan normal... ✨_`;

        // Cukup m.reply, otomatis muncul Fkontak & AdReply!
        return m.reply(pingMsg);
    }
};

function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}
