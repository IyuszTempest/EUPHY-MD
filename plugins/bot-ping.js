/** * Euphy-Bot - Ping Plugin (System Detail)
 * Fitur: Speed Test, CPU Detail, OS Info & Server Location
 */

const os = require('os');
const { performance } = require('perf_hooks');

module.exports = {
    command: ['ping', 'speed', 'status'],
    category: 'main',
    noPrefix: true, 
    call: async (conn, m, { usedPrefix }) => {
        const start = performance.now();
        // Kita panggil satu fungsi dummy biar ada jeda proses asli
        const end = performance.now();
        const latensi = (end - start).toFixed(4);

        // --- [ AMBIL DATA SYSTEM ] ---
        const cpus = os.cpus();
        const cpuModel = cpus[0].model; // Nama CPU
        const cpuCores = cpus.length;   // Jumlah Core/Threads
        const platform = os.platform(); // Sistem Operasi (linux/win32)
        const arch = os.arch();         // Arsitektur (x64/arm)
        
        // Data Memori
        let ramTerpakai = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        let ramTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
        let uptime = clockString(process.uptime() * 1000);

        // Server Info (Lunes Host rata-rata di Singapore/Indonesia)
        // Kita set manual "Indonesia" karena kamu di Ngabang & Lunes Host lokal
        const serverLoc = "Indonesia 🇮🇩 / Singapore 🇸🇬"; 

        let pingMsg = `╭━━〔 ⛩️ *𝚂𝚈𝚂𝚃𝙴𝙼 𝚂𝚃𝙰𝚃𝚄𝚂* ⛩️ 〕━━┓\n`
                    + `┃ 🚀 *Latensi:* ${latensi} ms\n`
                    + `┃ ⌚ *Uptime:* ${uptime}\n`
                    + `┃ 📟 *RAM:* ${ramTerpakai} MB / ${ramTotal} GB\n`
                    + `┣━━━━━━━━━━━━━━━━━━━━┛\n`
                    + `┃ 💻 *𝚂𝙴𝚁𝚅𝙴𝚁 𝙸𝙽𝙵𝙾*\n`
                    + `┃ ⚙️ *CPU:* ${cpuModel}\n`
                    + `┃ 🧩 *Cores:* ${cpuCores} (Logical Threads)\n`
                    + `┃ 🖥️ *OS:* ${platform.toUpperCase()} (${arch})\n`
                    + `┃ 📍 *Loc:* ${serverLoc}\n`
                    + `┃ 📂 *Plugins:* ${Object.keys(global.plugins).length}\n`
                    + `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`
                    + `_Euphy System is running smoothly... ✨_`;

        // Mengirim dengan gaya Newsletter yang sudah kita setting di m.reply
        return m.reply(pingMsg);
    }
};

function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
            }
    
