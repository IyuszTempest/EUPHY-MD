/**
 * Euphy-Bot - Index (V3.3 Optimized)
 * Fix: Global Uploader Registration & Plugin Sync
 */

const { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const os = require("os");
const express = require("express");
const readline = require("readline");

// --- [ 1. CONFIG & GLOBAL UPLOADER ] ---
require('./config');
const { uploadImage } = require('./lib/uploadImage');
global.uploadImage = uploadImage; // Registrasi global uploader

// --- [ 2. AUTO FIX DIRECTORY ] ---
const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
    console.log(chalk.green('[ SYSTEM ] Folder tmp berhasil dibuat otomatis! 📂'));
}

// PENTING: Ambil smsg & makeWASocket dari lib/simple agar downloadM & LID support aktif
const { smsg, makeWASocket } = require('./lib/simple');

const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Euphy System Is Online ✨'));
app.listen(port, () => console.log(chalk.cyan(`[ INFO ] Server active on port ${port}`)));

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(text, (answer) => {
        rl.close();
        resolve(answer);
    }));
};

// --- [ 3. DATABASE SYSTEM ] ---
const databasePath = './database.json';
global.db = { data: { users: {}, chats: {}, settings: {} } };
if (fs.existsSync(databasePath)) {
    try {
        global.db.data = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
    } catch (e) {
        console.log(chalk.red('[ ERROR ] Database korup, memuat data kosong.'));
    }
}

async function startEuphy() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // --- [ 4. UNIVERSAL PLUGIN LOADER ] ---
    global.plugins = {};
    const pluginsFolder = path.join(__dirname, "plugins");
    if (!fs.existsSync(pluginsFolder)) fs.mkdirSync(pluginsFolder);

    const files = fs.readdirSync(pluginsFolder);
    for (let file of files) {
        if (file.endsWith(".js")) {
            try {
                const pluginPath = path.join(pluginsFolder, file);
                global.plugins[file] = require(pluginPath);
            } catch (e) {
                console.log(chalk.red(`  [ ERROR ] Gagal muat ${file}: ${e.message}`));
            }
        }
    }

    // --- [ 5. PAIRING SYSTEM ] ---
    if (!conn.authState.creds.registered) {
        console.log(chalk.yellow("[!] Masukkan nomor WhatsApp (628xxx):"));
        let phoneNumber = await question(chalk.cyan("> "));
        phoneNumber = phoneNumber.replace(/[^0-9]/g, "");
        
        setTimeout(async () => {
            let code = await conn.requestPairingCode(phoneNumber, "EUPYMGTA");
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(chalk.black(chalk.bgGreen("\n KODE PAIRING : ")), chalk.black(chalk.bgWhite(` ${code} `)), "\n");
        }, 3000);
    }

    conn.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason !== DisconnectReason.loggedOut) startEuphy();
        } else if (connection === "open") {
            console.log(chalk.cyan.bold("--- EUPHY BERHASIL TERHUBUNG ---"));
        }
    });

    const cron = require('node-cron');

            // Fungsi Broadcast ke semua grup
            const broadcastGrup = async (teks) => {
                let groups = Object.keys(await conn.groupFetchAllParticipating());
                for (let id of groups) {
                    await conn.sendMessage(id, { 
                        text: teks,
                        contextInfo: {
                            externalAdReply: {
                                title: "𝙴𝚄𝙿𝙷𝚈 𝙰𝚄𝚃𝙾-𝚁𝙴𝙼𝙸𝙽𝙳𝙴𝚁",
                                body: "Sistem Pengingat Otomatis",
                                thumbnailUrl: global.imgall,
                                sourceUrl: global.idch,
                                mediaType: 1
                            }
                        }
                    });
                }
            };
                // --- [ JADWAL PENGINGAT KHUSUS YUS ] ---

            // 1. Jam 9 Malam (21:00) - Pengingat Tidur
            cron.schedule('0 0 21 * * *', () => {
                broadcastGrup(`╭━━〔 ⛩️ *𝙽𝙸𝙶𝙷𝚃𝚈 𝚁𝙴𝙼𝙸𝙽𝙳𝙴𝚁* ⛩️ 〕━━┓\n┃ 🏮 Sudah jam 9 malam!\n┃ 💤 Waktunya istirahat biar besok\n┃ ✨ Badan-nya tetep seger.\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n_Lanjut besok lagi ya... ✨_`);
            }, { timezone: "Asia/Jakarta" });

            // 2. Jam 6 Pagi (06:00) - Pengingat Produktivitas
            cron.schedule('0 0 6 * * *', () => {
                broadcastGrup(`╭━━〔 ⛩️ *𝙼𝙾𝚁𝙽𝙸𝙽𝙶 𝚂𝙿𝙸𝚁𝙸𝚃* ⛩️ 〕━━┓\n┃ 🌅 Bangun! Sudah pagi woy.\n┃ 🚀 Ayo yang semangat kak!!\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n_The world is waiting for your magic... ✨_`);
            }, { timezone: "Asia/Jakarta" });

// --- [ SISTEM AUTO-OUT SEWA ] ---
// Cek setiap hari jam 00:00
cron.schedule('0 0 0 * * *', async () => {
    let now = Date.now();
    let chats = global.db.data.chats;
    for (let jid in chats) {
        if (chats[jid].expired && now > chats[jid].expired) {
            let caption = `╭━━〔 ⛩️ *𝚂𝙴𝚆𝙰 𝙴𝚇𝙿𝙸𝚁𝙴𝙳* ⛩️ 〕━━┓\n┃ 🏮 Masa sewa grup ini telah habis!\n┃ 🚀 Saatnya Euphy pamit undur diri.\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n_Hubungi Owner untuk perpanjang!_`;
            await conn.sendMessage(jid, { text: caption });
            await conn.groupLeave(jid); // Otomatis keluar grup
            chats[jid].expired = 0; // Reset data expired
        }
    }
}, { timezone: "Asia/Jakarta" });

    // --- [ SISTEM AUTO-CLEAN PREMIUM ] ---
// Cek setiap jam untuk membersihkan user premium yang sudah expired
cron.schedule('0 * * * *', async () => {
    let now = Date.now();
    let users = global.db.data.users;
    let count = 0;

    for (let jid in users) {
        let user = users[jid];
        // Cek jika user premium dan punya waktu expired yang sudah lewat
        if (user.premium && user.premiumTime > 0 && now >= user.premiumTime) {
            user.premium = false;
            user.premiumTime = 0;
            count++;
            
            // Kirim notifikasi ke user via Private Chat
            try {
                await conn.sendMessage(jid, { 
                    text: `*─── [ PREMIUM EXPIRED ] ───*\n\nMasa premium kamu sudah habis! 🌸\nTerima kasih sudah berlangganan. Hubungi owner untuk perpanjang ya!` 
                });
            } catch (e) {
                console.log(`Gagal kirim notif expired ke ${jid}`);
            }
        }
    }
    if (count > 0) console.log(chalk.yellow(`[ SYSTEM ] Berhasil membersihkan ${count} user premium expired.`));
}, { timezone: "Asia/Jakarta" });

    
    conn.ev.on("creds.update", saveCreds);
    // --- [ 6. MESSAGE HANDLER ] ---
    conn.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            // --- [ AUTO VIEW & REACT STATUS ] ---
            let m = chatUpdate.messages[0]
            if (m.key.remoteJid === 'status@broadcast') {
                await conn.readMessages([m.key]) // Lihat Status
                
                // Beri reaksi emoji random
                const emojis = ['🏮', '✨', '🗿', '🌸', '🔥']
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
                
                await conn.sendMessage('status@broadcast', {
                    react: { text: randomEmoji, key: m.key }
                }, { statusJidList: [m.key.participant] })
                
                console.log(chalk.green(`[ STORY ] View & React: ${m.pushName || 'Seseorang'}`))
            }

            // --- [ MAIN HANDLER ] ---
            const { handler } = require('./handler');
            await handler.call(conn, chatUpdate);
        } catch (e) {
            console.error(chalk.red(`[ HANDLER ERROR ] ${e.message}`));
        }
    });


startEuphy();
    
