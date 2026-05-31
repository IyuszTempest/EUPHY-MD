const os = require('os');
const { performance } = require('perf_hooks');

module.exports = {
    command: ['ping', 'status', 'speed'],
    category: 'main',
    noPrefix: true,

    call: async (conn, m) => {
        const start = performance.now();
        const latency = (performance.now() - start).toFixed(4);

        const cpus = os.cpus();
        const cpuModel = cpus[0].model.replace(/\(R\)|\(TM\)|Core|Processor|CPU/g, '').trim();
        const cpuSpeed = cpus[0].speed;
        const cpuCores = cpus.length;

        const usage = process.memoryUsage();
        const ramUsed = (usage.rss / 1024 / 1024).toFixed(2);
        const heapUsed = (usage.heapUsed / 1024 / 1024).toFixed(2);
        const heapTotal = (usage.heapTotal / 1024 / 1024).toFixed(2);
        const external = (usage.external / 1024 / 1024).toFixed(2);

        const ramTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeRam = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        const usedRam = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2);

        const uptime = clockString(process.uptime() * 1000);
        const osUptime = clockString(os.uptime() * 1000);

        const totalPlugins = typeof global.plugins !== 'undefined' ? Object.keys(global.plugins).length : 0;
        const totalChats = Object.keys(global.db?.data?.chats || {}).length;

        const botName = global.namebot;
        const ownerName = global.namowner;
        const nodeVersion = process.version;
        const hostname = os.hostname();
        const arch = os.arch();

        const botNumber = conn.user && conn.user.id ? conn.user.id.split(':')[0] : m.chat;
        const botMode = global.db?.data?.settings?.[botNumber]?.self ? 'Self' : 'Public';

        let teks += `${botName} • Advanced System Monitor\n\n`;
        teks += `🤖 BOT INFO\n`;
        teks += `│ Bot Name : ${nameowner}\n`;
        teks += `│ Owner    : ${ownerName}\n`;
        teks += `│ Mode     : ${botMode}\n`;
        teks += `│ Plugins  : ${totalPlugins}\n`;

        teks += `⚡ PERFORMANCE\n`;
        teks += `│ Latency  : ${latency} ms\n`;
        teks += `│ Uptime   : ${uptime}\n`;
        teks += `│ OS Uptime: ${osUptime}\n`;
        teks += `│ RAM Used : ${ramUsed} MB\n`;
        
        teks += `🖥️ SERVER INFO\n`;
        teks += `│ OS       : ${os.platform()} (${arch})\n`;
        teks += `│ CPU      : ${cpuModel}\n`;
        teks += `│ Speed    : ${cpuSpeed} MHz\n`;
        teks += `│ Cores    : ${cpuCores}\n\n`;

        teks += `💾 MEMORY INFO\n`;
        teks += `│ Total RAM: ${ramTotal} GB\n`;
        teks += `│ Used RAM : ${usedRam} GB\n`;
        teks += `│ Free RAM : ${freeRam} GB\n`;
        teks += `│ Usage    : ${((usedRam / ramTotal) * 100).toFixed(1)}%\n`;

        await m.reply(teks, m.chat, {
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.idch,
                    serverMessageId: 143,
                    newsletterName: `System Online - ${global.namech}`
                }
            }
        });
    }
};

function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}
