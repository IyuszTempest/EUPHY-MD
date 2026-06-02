/**
 * ╔══════════════════════════════════════════════╗
 * ║           𝙴𝚄𝙿𝙷𝚈 - 𝙱𝙾𝚃 𝚂𝚈𝚂𝚃𝙴𝙼  V3.3          ║
 * ║         Optimized · Clean · Stable           ║
 * ╚══════════════════════════════════════════════╝
 */

'use strict';

// ════════════════════════════════════════════════
//  [ 1. IMPORTS & DEPENDENCIES ]
// ════════════════════════════════════════════════

const {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const pino      = require('pino');
const { Boom }  = require('@hapi/boom');
const fs        = require('fs');
const path      = require('path');
const chalk     = require('chalk');
const express   = require('express');
const readline  = require('readline');
const cron      = require('node-cron');

require('./config');

const { smsg, makeWASocket }  = require('./lib/simple');
const { uploadImage }         = require('./lib/uploadImage');
const kuroyami                = require('./plugins/ai-euphy');

global.uploadImage = uploadImage;


// ════════════════════════════════════════════════
//  [ 2. DIRECTORY SETUP ]
// ════════════════════════════════════════════════

const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
    console.log(chalk.green('[ SYSTEM ] Folder /tmp berhasil dibuat 📂'));
}


// ════════════════════════════════════════════════
//  [ 3. EXPRESS SERVER ]
// ════════════════════════════════════════════════

const app  = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_req, res) => res.send('✨ System Is Online'));
app.listen(PORT, () =>
    console.log(chalk.cyan(`[ SERVER ] Aktif di port ${PORT}`))
);


// ════════════════════════════════════════════════
//  [ 4. HELPERS ]
// ════════════════════════════════════════════════

const question = (text) =>
    new Promise((resolve) => {
        const rl = readline.createInterface({
            input:  process.stdin,
            output: process.stdout
        });
        rl.question(text, (answer) => {
            rl.close();
            resolve(answer);
        });
    });


// ════════════════════════════════════════════════
//  [ 5. DATABASE SYSTEM ]
// ════════════════════════════════════════════════

const DB_PATH = './database.json';

global.db = {
    data: {
        users:    {},
        chats:    {},
        settings: {}
    }
};

if (fs.existsSync(DB_PATH)) {
    try {
        global.db.data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        console.log(chalk.green('[ DATABASE ] Berhasil dimuat ✅'));
    } catch {
        console.log(chalk.red('[ DATABASE ] Korup! Memuat data kosong...'));
        fs.writeFileSync(DB_PATH, JSON.stringify(global.db.data, null, 2));
    }
} else {
    fs.writeFileSync(DB_PATH, JSON.stringify(global.db.data, null, 2));
    console.log(chalk.yellow('[ DATABASE ] Database baru berhasil dibuat 🗄️'));
}

setInterval(() => {
    fs.writeFileSync(DB_PATH, JSON.stringify(global.db.data, null, 2));
}, 30_000);


// ════════════════════════════════════════════════
//  [ 6. MAIN FUNCTION ]
// ════════════════════════════════════════════════

async function startEuphy() {

    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version }          = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        version,
        logger:           pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth:             state,
        browser:          ['Ubuntu', 'Chrome', '20.0.04']
    });


    // ── [ 6.1. PLUGIN LOADER ] ───────────────────

    global.plugins = {};
    const pluginsDir = path.join(__dirname, 'plugins');
    if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);

    for (const file of fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))) {
        try {
            global.plugins[file] = require(path.join(pluginsDir, file));
        } catch (e) {
            console.log(chalk.red(`[ PLUGIN ] Gagal muat "${file}": ${e.message}`));
        }
    }

    fs.watch(pluginsDir, (event, filename) => {
        if (!filename?.endsWith('.js')) return;
        const filePath = path.join(pluginsDir, filename);
        if (fs.existsSync(filePath)) {
            try {
                delete require.cache[require.resolve(filePath)];
                global.plugins[filename] = require(filePath);
                console.log(chalk.green(`[ WATCHER ] Plugin diperbarui: ${filename}`));
            } catch (e) {
                console.log(chalk.red(`[ WATCHER ] Gagal muat "${filename}": ${e.message}`));
            }
        } else {
            delete global.plugins[filename];
            console.log(chalk.yellow(`[ WATCHER ] Plugin dihapus: ${filename}`));
        }
    });


    // ── [ 6.2. PAIRING SYSTEM ] ──────────────────

    if (!conn.authState.creds.registered) {
        console.log(chalk.yellow('\n[!] Masukkan nomor WhatsApp (contoh: 628xxx):'));
        let phoneNumber = (await question(chalk.cyan('> '))).replace(/\D/g, '');

        setTimeout(async () => {
            const raw  = await conn.requestPairingCode(phoneNumber, 'EUPYMGTA');
            const code = raw?.match(/.{1,4}/g)?.join('-') || raw;
            console.log(
                chalk.bgGreen.black('\n KODE PAIRING : '),
                chalk.bgWhite.black(` ${code} `),
                '\n'
            );
        }, 3000);
    }


    // ── [ 6.3. CONNECTION HANDLER ] ──────────────

    conn.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log(chalk.yellow('[ CONN ] Reconnecting...'));
                startEuphy();
            } else {
                console.log(chalk.red('[ CONN ] Logged out. Hentikan bot & hapus sesi.'));
            }
        } else if (connection === 'open') {
            console.log(chalk.cyan.bold('\n┌─────────────────────────────────┐'));
            console.log(chalk.cyan.bold('│   ✅  AKU BERHASIL TERHUBUNG  │'));
            console.log(chalk.cyan.bold('└─────────────────────────────────┘\n'));
        }
    });

    conn.ev.on('creds.update', saveCreds);


    // ── [ 6.4. AUTO BACKUP DATABASE ] ────────────
    // Setiap 1 jam kirim backup ke owner

    setInterval(async () => {
        try {
            if (!fs.existsSync(DB_PATH)) return;

            const targetJid = `${global.targetjid}`;
            await conn.sendMessage(targetJid, {
                document:  fs.readFileSync(DB_PATH),
                mimetype:  'application/json',
                fileName:  'database.json',
                caption:   `*AUTO BACKUP DATABASE*`
            });
            console.log(chalk.green(`[ BACKUP ] Sukses → ${targetJid}`));
        } catch (e) {
            console.log(chalk.red(`[ BACKUP ] Gagal: ${e.message}`));
        }
    }, 60 * 60 * 1000);


    // ── [ 6.5. GROUP WELCOME / GOODBYE ] ─────────

    conn.ev.on('group-participants.update', async ({ id, participants, action }) => {
        try {
            const chat = global.db.data.chats[id] || {};
            if (!chat.welcome) return;

            const metadata = await conn.groupMetadata(id);

            for (const num of participants) {
                let ppuser;
                try {
                    ppuser = await conn.profilePictureUrl(num, 'image');
                } catch {
                    ppuser = 'https://i.pinimg.com/originals/f1/b9/d7/f1b9d702bae9274340cb7e9534233d32.jpg';
                }

                const tag  = `@${num.split('@')[0]}`;
                const name = metadata.subject;
                const desc = metadata.desc?.toString() || 'Tidak ada deskripsi';

                if (action === 'add') {
                    const teks = (chat.sWelcome ||
                        `🌸 Yokoso!\n\n> Selamat datang kak @user! Senang kamu bisa bergabung di grup @group. Enjoy your stay!`)
                        .replace('@user',  tag)
                        .replace('@group', name)
                        .replace('@desc',  desc);

                    await conn.sendMessage(id, {
                        image:    { url: ppuser },
                        caption:  teks,
                        mentions: [num]
                    });

                } else if (action === 'remove') {
                    const bye = (chat.sBye ||
                        `⛩️ Sayonara\n\n> Goodbye @user... Sampai jumpa lagi ya! See you next time`)
                        .replace('@user',  tag)
                        .replace('@group', name);

                    await conn.sendMessage(id, {
                        image:    { url: ppuser },
                        caption:  bye,
                        mentions: [num]
                    });
                }
            }
        } catch (e) {
            console.log(chalk.red(`[ GROUP UPDATE ] ${e.message}`));
        }
    });


    // ── [ 6.6. BROADCAST HELPER ] ─────────────────
    const broadcastGrup = async (teks) => {
    const groups = Object.keys(await conn.groupFetchAllParticipating());
    for (const id of groups) {
        await conn.sendMessage(id, {
            text: teks,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.idch,
                    serverMessageId: 143,
                    newsletterName: `${global.namech}`
                }
            }
        });
    }
};


    // ── [ 6.7. JADWAL PENGINGAT (CRON) ] ──────────

    // Malam — jam 21:00 WIB
    cron.schedule('0 21 * * *', () => {
        broadcastGrup(
            `⛩️ Nighty Reminder\n\n> Already 9 PM. Waktunya turu biar besok badan tetep seger. Lanjut besok lagi ya...`
        );
    }, { timezone: 'Asia/Jakarta' });

    // Pagi — jam 06:00 WIB
    cron.schedule('0 6 * * *', () => {
        broadcastGrup(
            `🏮 Morning Reminder\n\n> Awali pagi dengan sarapan dan senyuman. Semoga harimu menyenangkan! Have a great day`
        );
    }, { timezone: 'Asia/Jakarta' });

    cron.schedule('0 0 * * *', async () => {
        const now   = Date.now();
        const chats = global.db.data.chats;

        for (const jid in chats) {
            if (chats[jid].expired && now > chats[jid].expired) {
                await conn.sendMessage(jid, {
                    text: `⛩️ Sewa Expired\n\n> Masa sewa grup ini telah habis, saatnya aku pamit undur diri. Hubungi owner untuk perpanjang ya!`
                });
                await conn.groupLeave(jid);
                chats[jid].expired = 0;
            }
        }
    }, { timezone: 'Asia/Jakarta' });

    cron.schedule('0 * * * *', async () => {
        const now   = Date.now();
        const users = global.db.data.users;
        let count   = 0;

        for (const jid in users) {
            const user = users[jid];
            if (user.premium && user.premiumTime > 0 && now >= user.premiumTime) {
                user.premium     = false;
                user.premiumTime = 0;
                count++;

                try {
                    await conn.sendMessage(jid, {
                        text: `*─── [ PREMIUM EXPIRED ] ───*\n\nMasa premium kamu sudah habis!\nTerima kasih sudah berlangganan.\nHubungi owner untuk perpanjang ya!`
                    });
                } catch {
                    console.log(chalk.yellow(`[ PREMIUM ] Gagal kirim notif ke ${jid}`));
                }
            }
        }

        if (count > 0)
            console.log(chalk.yellow(`[ PREMIUM ] ${count} user expired dibersihkan.`));
    }, { timezone: 'Asia/Jakarta' });


    // ── [ 6.8. MESSAGE HANDLER ] ──────────────────

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            let m = chatUpdate.messages[0];
            if (!m?.message) return;

            m.chat   = m.key.remoteJid || 'status@broadcast';
            m.sender = m.key.participant || m.key.remoteJid;
            m.isGroup = m.chat.endsWith('@g.us');

            if (m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
                try {
                    const json = JSON.parse(
                        m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson
                    );
                    if (json.id) m.text = json.id;
                } catch {}
            }

            if (!m.text) {
                m.text = m.message?.conversation
                      || m.message?.extendedTextMessage?.text
                      || '';
            }

            await kuroyami.handleMessage(conn, m);

            const { handler } = require('./handler');
            await handler.call(conn, chatUpdate);

        } catch (e) {
            console.log(chalk.red(`[ FATAL ] ${e.stack}`));
        }
    });

}


// ════════════════════════════════════════════════
//  BOOT
// ════════════════════════════════════════════════

startEuphy();
