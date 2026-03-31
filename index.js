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
// Inisialisasi awal agar tidak undefined [cite: 2026-01-09]
global.db = { data: { users: {}, chats: {}, settings: {} } };

if (fs.existsSync(databasePath)) {
    try {
        global.db.data = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
        console.log(chalk.green('[ SUCCESS ] Database loaded!'));
    } catch (e) {
        console.log(chalk.red('[ ERROR ] Database korup, memuat data kosong.'));
        fs.writeFileSync(databasePath, JSON.stringify(global.db.data, null, 2));
    }
} else {
    // WAJIB: Bikin file fisik kalau belum ada biar Premium gak default 30 hari terus
    fs.writeFileSync(databasePath, JSON.stringify(global.db.data, null, 2));
    console.log(chalk.yellow('[ SYSTEM ] Database baru berhasil dibuat!'));
}

// AUTO SAVE TIAP 30 DETIK (Biar data Sewa/Premium aman di Lunes Host)
setInterval(() => {
    fs.writeFileSync(databasePath, JSON.stringify(global.db.data, null, 2));
}, 30 * 1000);

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

     // AUTO RELOAD PLUGINS (WATCHER)
    fs.watch(pluginsFolder, (event, filename) => {
        if (filename && filename.endsWith('.js')) {
            const filePath = path.join(pluginsFolder, filename);
            if (fs.existsSync(filePath)) {
                try {
                    // Hapus cache agar file terbaca ulang
                    delete require.cache[require.resolve(filePath)];
                    global.plugins[filename] = require(filePath);
                    console.log(chalk.green(`  [ WATCHER ] Plugin Updated: ${filename}`));
                } catch (e) {
                    console.log(chalk.red(`  [ WATCHER ERROR ] Gagal muat ${filename}: ${e.message}`));
                }
            } else {
                delete global.plugins[filename];
                console.log(chalk.yellow(`  [ WATCHER ] Plugin Deleted: ${filename}`));
            }
        }
    });

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

    // --- [ AUTO BACKUP DATABASE - FINAL STABLE ] ---
setInterval(async () => {
    try {
        const fs = require('fs');
        const path = './database.json';
        
        if (fs.existsSync(path)) {
            // Kita pakai JID yang sudah terbukti berhasil di tes tadi
            let targetJid = '6282255810534@s.whatsapp.net'; 

            await conn.sendMessage(targetJid, {
                document: fs.readFileSync(path),
                mimetype: 'application/json',
                fileName: `database.json`,
                caption: `🏮 *AUTO BACKUP DATABASE* 🏮\n\nData user aman terkirim otomatis!`
            });
            
            console.log(`[ SYSTEM ] Auto backup sukses terkirim ke: ${targetJid}`);
        }
    } catch (e) {
        console.log(`[ ERROR BACKUP ] Gagal kirim backup otomatis: ${e.message}`);
    }
}, 1000 * 60 * 60); // Eksekusi setiap 1 jam
    
        // --- [ 7. GROUP PARTICIPANTS UPDATE (Welcome/Goodbye) - FIXED ] ---
    // Update otomatis sesuai pengaturan di database (.setwelcome / .setbye)
    conn.ev.on('group-participants.update', async (anu) => {
        try {
            let chat = global.db.data.chats[anu.id] || {};
            if (!chat.welcome) return; // Jika fitur welcome di grup itu OFF, bot diam saja.

            let metadata = await conn.groupMetadata(anu.id);
            let participants = anu.participants;

            for (let num of participants) {
                // --- LOGIC FOTO PROFIL (PP) ---
                let ppuser;
                try {
                    // Coba ambil PP dari WhatsApp
                    ppuser = await conn.profilePictureUrl(num, 'image');
                } catch {
                    // Jika gagal (User gak pakai PP/Privasi), pakai PP Anime Default
                    ppuser = 'https://i.pinimg.com/originals/f1/b9/d7/f1b9d702bae9274340cb7e9534233d32.jpg'; 
                }

                // --- LOGIC ACTION: MEMBER BARU (ADD) ---
                if (anu.action == 'add') {
                    // Ambil pesan dari database, kalau kosong pakai template default Euphy
                    let teks = chat.sWelcome || `╭━━〔 ⛩️ *𝚆𝙴𝙻𝙲𝙾𝙼𝙴* ⛩️ 〕━━┓\n┃ ✨ Selamat datang kak @user!\n┃ 🏮 Di grup: *@group*\n┗━━━━━━━━━━━━━━━┛`;
                    
                    // Ganti Placeholder agar interaktif
                    let welcomeText = teks
                        .replace('@user', `@${num.split("@")[0]}`) // Tag orangnya
                        .replace('@group', metadata.subject)       // Nama grup
                        .replace('@desc', metadata.desc?.toString() || 'Tidak ada deskripsi'); // Deskripsi grup
                    
                    await conn.sendMessage(anu.id, { 
                        image: { url: ppuser }, 
                        caption: welcomeText, 
                        mentions: [num] 
                    });

                // --- LOGIC ACTION: MEMBER KELUAR (REMOVE) ---
                } else if (anu.action == 'remove') {
                    // Ambil pesan goodbye dari database
                    let bye = chat.sBye || `╭━━〔 ⛩️ *𝙶𝙾𝙾𝙳𝙱𝚈𝙴* ⛩️ 〕━━┓\n┃ 🏮 Sayonara @user...\n┃ ✨ Sampai jumpa lagi ya!\n┗━━━━━━━━━━━━━━━━┛`;
                    
                    let goodbyeText = bye
                        .replace('@user', `@${num.split("@")[0]}`)
                        .replace('@group', metadata.subject);
                                
                    await conn.sendMessage(anu.id, { 
                        image: { url: ppuser }, 
                        caption: goodbyeText, 
                        mentions: [num] 
                    });
                }
            }
        } catch (err) {
            // Biar gak ganggu log, kita pakai chalk merah kalau ada error
            console.log(chalk.red(`[ GROUP UPDATE ERROR ] ${err.message}`));
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
                broadcastGrup(`╭━━〔 ⛩️ *𝙽𝙸𝙶𝙷𝚃𝚈 𝚁𝙴𝙼𝙸𝙽𝙳𝙴𝚁* ⛩️ 〕━━┓\n┃ 🏮 Udah jam 9 malam uy!\n┃ 💤 Waktunya turu biar besok\n┃ ✨ Badan-nya tetep seger.\n┗━━━━━━━━━━━━━━━┛\n\n_Lanjut besok lagi ya... ✨_`);
            }, { timezone: "Asia/Jakarta" });

            // 2. Jam 12 Siang (12:00) - Pengingat Produktivitas (FIXED)
cron.schedule('0 0 6 * * *', () => {
    broadcastGrup(`╭━━〔 ⛩️ *Selamat Pagi* ⛩️ 〕━━┓\n┃ 😼 Udah pagi aja nih, udh sarapan belom?\n┗━━━━━━━━━━━━━━━━┛\n\n_Tetap semangat demi masa depan yang cerah..✨_`);
}, { timezone: "Asia/Jakarta" });.
    

// --- [ SISTEM AUTO-OUT SEWA ] ---
// Cek setiap hari jam 00:00
cron.schedule('0 0 0 * * *', async () => {
    let now = Date.now();
    let chats = global.db.data.chats;
    for (let jid in chats) {
        if (chats[jid].expired && now > chats[jid].expired) {
            let caption = `╭━━〔 ⛩️ *𝚂𝙴𝚆𝙰 𝙴𝚇𝙿𝙸𝚁𝙴𝙳* ⛩️ 〕━━┓\n┃ 🏮 Masa sewa grup ini telah habis!\n┃ 🚀 Saatnya Euphy pamit undur diri.\n┗━━━━━━━━━━━━━━┛\n\n_Hubungi Owner untuk perpanjang!_`;
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
            let m = chatUpdate.messages[0];
            if (!m || !m.message) return;

            // --- [ AUTO VIEW & REACT STATUS ] ---
            if (m.key.remoteJid === 'status@broadcast') {
                // JANGAN react kalau itu status dari nomor bot sendiri
                if (m.key.fromMe) return; 

                await conn.readMessages([m.key]);
                
                let participant = m.key.participant || m.participant || m.key.remoteJid;
                
                const emojis = ['🏮', '✨', '🗿', '🌸', '🔥'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                
                await conn.sendMessage('status@broadcast', {
                    react: { text: randomEmoji, key: m.key }
                }, { statusJidList: [participant] });
                
                console.log(chalk.green(`[ STORY ] View & React: ${m.pushName || 'Seseorang'}`));
                return;
            }


            // --- [ HANDLER UTAMA ] ---
            // Jalankan handler utama untuk perintah bot lainnya
            const { handler } = require('./handler');
            await handler.call(conn, chatUpdate);

        } catch (e) {
            // Mencatat error agar tidak membuat bot mati di Lunes Host
            console.log(chalk.red(`[ ERROR HANDLER ] ${e.message}`));
        }
    }); // <--- Penutup messages.upsert

} // <--- Tambahkan satu kurung ini untuk menutup fungsi startEuphy() kamu!

startEuphy();
                
