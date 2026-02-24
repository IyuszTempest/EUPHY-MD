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

    conn.ev.on("creds.update", saveCreds);

    // --- [ 6. MESSAGE HANDLER ] ---
    conn.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const { handler } = require('./handler');
            // Menjalankan handler dengan data yang sudah diproses smsg
            await handler.call(conn, chatUpdate);
        } catch (e) {
            console.error(chalk.red(`[ HANDLER ERROR ] ${e.message}`));
        }
    });

    // Auto-save database setiap 30 detik
    setInterval(() => {
        fs.writeFileSync(databasePath, JSON.stringify(global.db.data, null, 2));
    }, 30000);
}

startEuphy();
    
