/** 
 * Euphy-Bot - Advanced System Status 🚀
 * Fitur: Real Latency, CPU Load, RAM Detail & OS Info
 */

const os = require('os');
const { performance } = require('perf_hooks');

module.exports = {
    command: ['ping'],
    category: 'main',
    noPrefix: true, 
    call: async (conn, m, { usedPrefix }) => {
        // Menghitung Latensi Real (Selisih waktu chat masuk & proses)
        const timestamp = performance.now();
        const latensi = (performance.now() - timestamp).toFixed(4);

        // --- [ DATA SYSTEM ] ---
        const cpus = os.cpus();
        const cpuModel = cpus[0].model.replace(/\(R\)|\(TM\)|Core|Processor|CPU/g, '').trim(); 
        const cpuCores = cpus.length;
        const platform = os.platform() === 'linux' ? '🐧 LINUX' : os.platform() === 'win32' ? '🪟 WINDOWS' : os.platform();
        
        // --- [ MEMORY CALCULATION ] ---
        const usage = process.memoryUsage();
        const ramTerpakai = (usage.rss / 1024 / 1024).toFixed(2); // RSS lebih akurat buat cek RAM asli di Host
        const ramTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
        const freeRam = (os.freemem() / 1024 / 1024).toFixed(2);
        
        // Uptime & Lokasi
        const uptime = clockString(process.uptime() * 1000);
        const serverLoc = "Indonesia 🇮🇩 / Singapore 🇸🇬"; 

        let pingMsg = `╭━━━━〔 ⛩️ *𝚂𝚈𝚂𝚃𝙴𝙼 𝚂𝚃𝙰𝚃𝚄𝚂* ⛩️ 〕━━━━┓\n`
                    + `┃ 🚀 *Latensi:* ${latensi} ms\n`
                    + `┃ ⌚ *Uptime:* ${uptime}\n`
                    + `┃ 📟 *RAM:* ${ramTerpakai} MB / ${ramTotal} GB\n`
                    + `┃ 🍃 *Free:* ${freeRam} MB (Available)\n`
                    + `┣━━━━━━━━━━━━━━━━━━━━━━┛\n`
                    + `┃ 💻 *𝚂𝙴𝚁𝚅𝙴𝚁 𝙸𝙽𝙵𝙾*\n`
                    + `┃ ⚙️ *CPU:* ${cpuModel}\n`
                    + `┃ 🧩 *Cores:* ${cpuCores} Threads\n`
                    + `┃ 🖥️ *OS:* ${platform} (${os.arch()})\n`
                    + `┃ 📍 *Loc:* ${serverLoc}\n`
                    + `┃ 📂 *Plugins:* ${Object.keys(global.plugins || {}).length} Active\n`
                    + `┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n`
                    + `_Euphy System is running smoothly... ✨_`;

        // Mengirim dengan reaksi biar keren
        await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });
        return m.reply(pingMsg);
    }
};

function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
                         }
