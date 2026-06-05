'use strict';

const {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const pino     = require('pino');
const { Boom } = require('@hapi/boom');
const fs       = require('fs');
const path     = require('path');
const chalk    = require('chalk');
const express  = require('express');
const readline = require('readline');
const cron     = require('node-cron');
const https    = require('https');
const { exec } = require('child_process');

require('./config');

const { smsg, makeWASocket } = require('./lib/simple');
const { uploadImage }        = require('./lib/uploadImage');

global.uploadImage = uploadImage;

// ════════════════════════════════════════════════════
//  LOGGER (Minimalist & Aesthetic Synthwave Theme)
// ════════════════════════════════════════════════════

const BADGES = {
    SYSTEM:  chalk.bgHex('#1a1a2e').hex('#00ffcc').bold('  SYS   '),
    INFO:    chalk.bgHex('#1a1a2e').hex('#61afef').bold('  INFO  '),
    WARN:    chalk.bgHex('#1a1a2e').hex('#e5c07b').bold('  WARN  '),
    ERROR:   chalk.bgHex('#1a1a2e').hex('#e06c75').bold('  ERR   '),
    PLUGIN:  chalk.bgHex('#1a1a2e').hex('#c678dd').bold(' PLUGIN '),
    CRON:    chalk.bgHex('#1a1a2e').hex('#ff8c42').bold('  CRON  '),
    DB:      chalk.bgHex('#1a1a2e').hex('#56b6c2').bold('   DB   '),
    BACKUP:  chalk.bgHex('#1a1a2e').hex('#e5c07b').bold(' BACKUP '),
    SESSION: chalk.bgHex('#1a1a2e').hex('#ff79c6').bold('  SESS  '),
    CONN:    chalk.bgHex('#1a1a2e').hex('#98c379').bold('  CONN  '),
    GROUP:   chalk.bgHex('#1a1a2e').hex('#61afef').bold(' GROUP  '),
    MSG:     chalk.bgHex('#1a1a2e').hex('#d19a66').bold('  MSG   '),
};

const dim  = (t) => chalk.hex('#555555')(t);
const bold = (t) => chalk.bold(t);

const cyanNeon    = chalk.hex('#00ffcc');
const purpleDim   = chalk.hex('#3d3d5c');
const purpleMuted = chalk.hex('#2a2a4a');
const blueSoft    = chalk.hex('#61afef');
const grayDim     = chalk.hex('#5c6370');

const log = (level, msg) => {
    const badge = BADGES[level] ?? chalk.bgGray.white(` ${level.toUpperCase().padEnd(5)} `);
    console.log(` ${badge} ${grayDim('│')} ${msg}`);
};

const divider = (char = '─', color = '#2a2a4a') => {
    console.log(chalk.hex(color)(char.repeat(60)));
};

const truncate = (str, max = 60) => {
    if (!str) return '';
    return str.length > max ? str.slice(0, max - 3) + '...' : str;
};

const printBanner = () => {
    console.clear();
    divider('─', '#1e1e3f');
    console.log(cyanNeon([
        '    ┌────────────────────────────────────────────────────┐',
        '    │          ★   W A   B O T   S Y S T E M   ★          │',
        '    │          v4.1  •  Efficient  •  Stable             │',
        '    └────────────────────────────────────────────────────┘'
    ].join('\n')));

    divider('─', '#1e1e3f');
    console.log();
};

// ════════════════════════════════════════════════════
//  DIRS
// ════════════════════════════════════════════════════

for (const dir of ['tmp', 'plugins', 'session', 'backups']) {
    const p = path.join(__dirname, dir);
    if (!fs.existsSync(p)) {
        fs.mkdirSync(p, { recursive: true });
        log('SYSTEM', 'Folder /' + dir + ' dibuat');
    }
}

// ════════════════════════════════════════════════════
//  EXPRESS
// ════════════════════════════════════════════════════

const app  = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_req, res) => res.json({ status: 'online', bot: 'Active', version: 'v4.1', uptime: process.uptime().toFixed(0) + 's' }));
app.listen(PORT, () => log('SYSTEM', 'Express server aktif di port ' + bold(PORT)));

// ════════════════════════════════════════════════════
//  DATABASE
// ════════════════════════════════════════════════════

const DB_PATH   = path.join(__dirname, 'database.json');
const defaultDB = { users: {}, chats: {}, settings: {} };

global.db = { data: { ...defaultDB } };

const loadDatabase = () => {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2));
        log('DB', 'Database baru dibuat');
        return;
    }
    try {
        global.db.data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        const u = Object.keys(global.db.data.users || {}).length;
        const c = Object.keys(global.db.data.chats || {}).length;
        log('DB', 'Loaded ' + dim('-- ' + u + ' users, ' + c + ' chats'));
    } catch {
        log('ERROR', 'Database korup! Reset ke default');
        global.db.data = { ...defaultDB };
        fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2));
    }
};

const saveDatabase = () => {
    try { fs.writeFileSync(DB_PATH, JSON.stringify(global.db.data, null, 2)); }
    catch (e) { log('ERROR', 'Gagal simpan DB: ' + e.message); }
};

loadDatabase();
setInterval(saveDatabase, 30_000);

// ════════════════════════════════════════════════════
//  WHATSAPP OWNER BACKUP (TAR.GZ to global.lidowner)
// ════════════════════════════════════════════════════

const runBackup = async (conn) => {
    try {
        if (!conn) {
            log('WARN', 'Koneksi WA belum siap, backup ditunda!');
            return;
        }

        saveDatabase();

        let ownerLid = global.lidowner;
        if (!ownerLid && global.owner) {
            const firstOwner = Array.isArray(global.owner) ? global.owner[0] : global.owner;
            if (firstOwner) {
                const rawNumber = firstOwner.split('@')[0];
                ownerLid = `${rawNumber}@lid`;
            }
        }

        if (!ownerLid) {
            log('WARN', 'Backup batal -- Konfigurasi global.lidowner atau global.owner tidak ditemukan!');
            return;
        }

        const stamp   = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }).replace(/[/:, ]/g, '-');
        const zipName = 'backup-sc-' + stamp + '.tar.gz';
        const zipPath = path.join(__dirname, 'backups', zipName);

        const cmd = `tar --exclude='node_modules' --exclude='session' --exclude='backups' --exclude='.git' -czf "${zipPath}" -C "${__dirname}" .`;

        exec(cmd, async (err) => {
            if (err) {
                log('ERROR', 'Gagal kompresi tar.gz: ' + err.message);
                return;
            }

            log('BACKUP', 'Bundle tar.gz dibuat ' + dim('-> ' + zipName));

            const u = Object.keys(global.db.data.users || {}).length;
            const c = Object.keys(global.db.data.chats || {}).length;

            const caption = '🗄️ *AUTO BACKUP SOURCE CODE — BOT SYSTEM*\n\n' +
                            '📅 ' + new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + '\n' +
                            '👥 Users  : ' + u + '\n' +
                            '💬 Chats  : ' + c + '\n' +
                            '📦 Format : Tar Gzip (.tar.gz)';

            try {
                await conn.sendMessage(ownerLid, {
                    document: fs.readFileSync(zipPath),
                    mimetype: 'application/gzip',
                    fileName: zipName,
                    caption: caption
                });

                log('BACKUP', 'Terkirim ke WA Owner');
            } catch (sendErr) {
                log('ERROR', 'Gagal kirim dokumen backup: ' + sendErr.message);
            }
            
            const backupDir  = path.join(__dirname, 'backups');
            const allBackups = fs.readdirSync(backupDir)
                .filter(f => f.startsWith('backup-sc-') && f.endsWith('.tar.gz'))
                .map(f => ({ f, t: fs.statSync(path.join(backupDir, f)).mtimeMs }))
                .sort((a, b) => a.t - b.t);

            while (allBackups.length > 24) {
                const old = allBackups.shift();
                fs.unlinkSync(path.join(backupDir, old.f));
                log('BACKUP', 'Rotate hapus: ' + dim(old.f));
            }
        });
    } catch (e) {
        log('ERROR', 'runBackup gagal: ' + e.message);
    }
};

// ════════════════════════════════════════════════════
//  SESSION CLEANER
// ════════════════════════════════════════════════════

const cleanSession = () => {
    try {
        const sessionDir = path.join(__dirname, 'session');
        if (!fs.existsSync(sessionDir)) return;

        const files = fs.readdirSync(sessionDir);
        let cleaned  = 0;
        const maxAge = 3 * 24 * 60 * 60 * 1000; // 3 hari

        for (const file of files) {
            if (file === 'creds.json') continue;
            const fp   = path.join(sessionDir, file);
            const stat = fs.statSync(fp);
            if (stat.size === 0 || (Date.now() - stat.mtimeMs) > maxAge) {
                fs.unlinkSync(fp);
                cleaned++;
            }
        }

        const total = files.length - 1;
        if (cleaned > 0) {
            log('SESSION', 'Clean: hapus ' + bold(cleaned) + ' file ' + dim('(sisa ' + (total - cleaned) + ')'));
        } else {
            log('SESSION', 'Bersih ' + dim('(' + total + ' file session aktif)'));
        }
    } catch (e) {
        log('ERROR', 'cleanSession: ' + e.message);
    }
};

// ════════════════════════════════════════════════════
//  HELPER
// ════════════════════════════════════════════════════

const question = (text) =>
    new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question(text, (ans) => { rl.close(); resolve(ans); });
    });

// ════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════

async function startBot() {

    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version }          = await fetchLatestBaileysVersion();

    log('INFO', 'Baileys ' + bold(version.join('.')));

    const conn = makeWASocket({
        version,
        logger:                pino({ level: 'silent' }),
        printQRInTerminal:     false,
        auth:                  state,
        browser:               ['Ubuntu', 'Chrome', '20.0.04'],
        connectTimeoutMs:      60_000,
        defaultQueryTimeoutMs: 60_000,
        keepAliveIntervalMs:   30_000,
        retryRequestDelayMs:   2_000
    });

    // Plugin Loader
    global.plugins = {};
    const pluginsDir = path.join(__dirname, 'plugins');

    const loadPlugin = (file) => {
        const fp = path.join(pluginsDir, file);
        try {
            delete require.cache[require.resolve(fp)];
            global.plugins[file] = require(fp);
        } catch (e) {
            log('PLUGIN', 'Gagal: ' + bold(file) + ' ' + dim('-> ' + e.message));
        }
    };

    const pluginFiles = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
    pluginFiles.forEach(loadPlugin);
    log('PLUGIN', bold(pluginFiles.length) + ' plugin dimuat');

    fs.watch(pluginsDir, (event, filename) => {
        if (!filename || !filename.endsWith('.js')) return;
        const fp = path.join(pluginsDir, filename);
        if (fs.existsSync(fp)) {
            loadPlugin(filename);
            log('PLUGIN', 'Update: ' + bold(filename));
        } else {
            delete global.plugins[filename];
            log('PLUGIN', 'Hapus:  ' + bold(filename));
        }
    });

    // Pairing
    if (!conn.authState.creds.registered) {
        divider('-', '#2a2a4a');
        log('SYSTEM', 'Sesi belum terdaftar, mulai pairing...');
        console.log('\n   ' + chalk.hex('#e5c07b')('Masukkan nomor WhatsApp') + ' ' + dim('(contoh: 628xxx)'));
        const phoneNumber = (await question('   ' + chalk.hex('#00ffcc')('> '))).replace(/\D/g, '');

        setTimeout(async () => {
            try {
                const raw  = await conn.requestPairingCode(phoneNumber, 'BOTSYSTEM');
                const code = raw && raw.match(/.{1,4}/g) ? raw.match(/.{1,4}/g).join('-') : raw;
                divider('-', '#2a2a4a');
                console.log('\n   ' + chalk.bgHex('#00ffcc').black(' PAIRING CODE ') + '  ' + chalk.bgWhite.black(' ' + code + ' ') + '\n');
                divider('-', '#2a2a4a');
            } catch (e) {
                log('ERROR', 'Pairing gagal: ' + e.message);
            }
        }, 3000);
    }

    // Connection Handler
    let reconnectCount = 0;

    conn.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'close') {
            const code      = new Boom(lastDisconnect && lastDisconnect.error).output.statusCode;
            const loggedOut = code === DisconnectReason.loggedOut;

            log('CONN', 'Terputus ' + dim('[kode: ' + code + ']'));

            if (loggedOut) {
                log('ERROR', 'Logged out -- hapus folder /session lalu restart');
                return process.exit(1);
            }

            reconnectCount++;
            const delay = Math.min(5000 * reconnectCount, 30_000);
            log('CONN', 'Reconnect #' + reconnectCount + ' dalam ' + (delay / 1000) + 's...');
            setTimeout(() => startBot(), delay);

        } else if (connection === 'connecting') {
            log('CONN', 'Menghubungkan...');

        } else if (connection === 'open') {
            reconnectCount = 0;
            const name = (conn.user && conn.user.name) || (conn.user && conn.user.id && conn.user.id.split(':')[0]) || '—';
            const jid  = (conn.user && conn.user.id)   || '—';
            
            divider('=', '#1e1e3f');
            console.log(chalk.hex('#98c379').bold([
                '',
                '    ┌──────────────────────────────────────────────────────┐',
                '    │  [OK] TERHUBUNG : ' + name.padEnd(35) + '│',
                '    │  [JID] ' + jid.padEnd(46) + '│',
                '    └──────────────────────────────────────────────────────┘',
                ''
            ].join('\n')));
            divider('=', '#1e1e3f');
            console.log();
        }
    });

    conn.ev.on('creds.update', saveCreds);

    // Group Welcome / Goodbye
    conn.ev.on('group-participants.update', async ({ id, participants, action }) => {
        try {
            const chat = global.db.data.chats[id] || {};
            if (!chat.welcome) return;

            const meta = await conn.groupMetadata(id);

            for (const num of participants) {
                let pp;
                try { pp = await conn.profilePictureUrl(num, 'image'); }
                catch { pp = 'https://i.pinimg.com/originals/f1/b9/d7/f1b9d702bae9274340cb7e9534233d32.jpg'; }

                const tag   = '@' + num.split('@')[0];
                const gname = meta.subject;
                const desc  = (meta.desc && meta.desc.toString()) || 'Tidak ada deskripsi';

                if (action === 'add') {
                    const teks = (chat.sWelcome ||
                        '🌸 *Yokoso!*\n\n> Selamat datang kak @user!\n> Senang kamu bergabung di *@group*.\n\nEnjoy your stay! ✨')
                        .replace(/@user/g, tag).replace(/@group/g, gname).replace(/@desc/g, desc);

                    await conn.sendMessage(id, { image: { url: pp }, caption: teks, mentions: [num] });
                    log('GROUP', 'Welcome ' + bold(num.split('@')[0]) + ' ' + dim('-> ' + gname));

                } else if (action === 'remove') {
                    const bye = (chat.sBye ||
                        '⛩️ *Sayonara*\n\n> Goodbye @user...\n> Sampai jumpa lagi ya! 👋')
                        .replace(/@user/g, tag).replace(/@group/g, gname);

                    await conn.sendMessage(id, { image: { url: pp }, caption: bye, mentions: [num] });
                    log('GROUP', 'Goodbye ' + bold(num.split('@')[0]) + ' ' + dim('<- ' + gname));
                }
            }
        } catch (e) {
            log('ERROR', 'group-participants.update: ' + e.message);
        }
    });

    const broadcastGrup = async (teks, imageUrl) => {
        try {
            const groups = Object.keys(await conn.groupFetchAllParticipating());
            log('CRON', 'Broadcast ke ' + bold(groups.length) + ' grup');
            let ok = 0, fail = 0;

            for (const id of groups) {
                try {
                    await conn.sendMessage(id, {
                        image: { url: imageUrl },
                        caption: teks,
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid:   global.idch,
                                serverMessageId: 143,
                                newsletterName:  String(global.namech)
                            }
                        }
                    });
                    ok++;
                    await new Promise(r => setTimeout(r, 350));
                } catch { fail++; }
            }

            log('CRON', 'Broadcast selesai ' + dim('-- ok:' + ok + ' gagal:' + fail));
        } catch (e) {
            log('ERROR', 'broadcastGrup: ' + e.message);
        }
    };

    // ── CRON JOBS ──────────────────────────────────────────────

    // Backup source code tiap 1 jam (Mengirim ke Owner WA via LID)
    cron.schedule('0 * * * *', () => {
        log('BACKUP', 'Auto backup dimulai...');
        runBackup(conn);
    }, { timezone: 'Asia/Jakarta' });

    // Clean session 2x sehari: 04:00 & 16:00
    cron.schedule('0 4 * * *',  () => { log('SESSION', 'Jadwal clean (04:00)'); cleanSession(); }, { timezone: 'Asia/Jakarta' });
    cron.schedule('0 16 * * *', () => { log('SESSION', 'Jadwal clean (16:00)'); cleanSession(); }, { timezone: 'Asia/Jakarta' });

    // Morning reminder — 06:00
    cron.schedule('0 6 * * *', () => {
        log('CRON', 'Morning Reminder');
        broadcastGrup('🏮 *Morning Reminder*\n\n> Awali pagi dengan sarapan dan senyuman.\n> Semoga harimu menyenangkan!', global.imgpagi);
    }, { timezone: 'Asia/Jakarta' });

    // Afternoon reminder — 12:00
    cron.schedule('0 12 * * *', () => {
        log('CRON', 'Afternoon Reminder');
        broadcastGrup('🌸 *Afternoon Reminder*\n\n> Jangan lupa makan siang ya!\n> Istirahat sejenak, kamu udah keren hari ini', global.imgpagi);
    }, { timezone: 'Asia/Jakarta' });

    // Nightly reminder — 21:00
    cron.schedule('0 21 * * *', () => {
        log('CRON', 'Nightly Reminder');
        broadcastGrup('⛩️ *Nighty Reminder*\n\n> Already 9 PM, waktunya istirahat.\n> Lanjut besok lagi ya...', global.imgmalam);
    }, { timezone: 'Asia/Jakarta' });

    // Cek sewa expired — 00:00
    cron.schedule('0 0 * * *', async () => {
        const now = Date.now(), chats = global.db.data.chats;
        let count = 0;
        for (const jid in chats) {
            if (!chats[jid].expired || now <= chats[jid].expired) continue;
            try {
                await conn.sendMessage(jid, { text: '⛩️ *Sewa Expired*\n\n> Masa sewa grup habis, aku pamit dulu ya.\n> Hubungi owner untuk perpanjang!' });
                await conn.groupLeave(jid);
                chats[jid].expired = 0;
                count++;
            } catch (e) { log('WARN', 'Gagal leave ' + jid + ': ' + e.message); }
        }
        if (count) log('CRON', 'Sewa expired: ' + bold(count) + ' grup ditinggalkan');
        saveDatabase();
    }, { timezone: 'Asia/Jakarta' });

    cron.schedule('30 * * * *', async () => {
        const now = Date.now(), users = global.db.data.users;
        let count = 0;
        for (const jid in users) {
            const u = users[jid];
            if (!u.premium || !u.premiumTime || now < u.premiumTime) continue;
            u.premium = false; u.premiumTime = 0; count++;
            try {
                await conn.sendMessage(jid, { text: '*--- PREMIUM EXPIRED ---*\n\nMasa premium kamu sudah habis!\nTerima kasih sudah berlangganan 🌟\nHubungi owner untuk perpanjang.' });
            } catch { log('WARN', 'Notif premium gagal: ' + jid.split('@')[0]); }
        }
        if (count) log('CRON', 'Premium expired: ' + bold(count) + ' user');
    }, { timezone: 'Asia/Jakarta' });

    cron.schedule('*/5 * * * *', () => {
        saveDatabase();
        const u = Object.keys(global.db.data.users || {}).length;
        const c = Object.keys(global.db.data.chats || {}).length;
        log('DB', 'Auto-save ' + dim('-- ' + u + ' users, ' + c + ' chats'));
    }, { timezone: 'Asia/Jakarta' });

    // ── MESSAGE HANDLER ────────────────────────────────────────

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m || !m.message) return;

            m.chat    = m.key.remoteJid || 'status@broadcast';
            m.sender  = m.key.participant || m.key.remoteJid;
            m.isGroup = m.chat.endsWith('@g.us');

            if (m.message.interactiveResponseMessage &&
                m.message.interactiveResponseMessage.nativeFlowResponseMessage &&
                m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson) {
                try {
                    const parsed = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
                    if (parsed.id) m.text = parsed.id;
                } catch {}
            }

            if (!m.text) {
                m.text = (m.message.conversation) ||
                         (m.message.extendedTextMessage && m.message.extendedTextMessage.text) || '';
            }

            if (m.text) {
                const sender  = (m.sender || '').split('@')[0];
                const chatTag = m.isGroup
                    ? dim('[grp:' + m.chat.split('@')[0] + ']')
                    : dim('[dm]');
                const preview = truncate(m.text, 55);
                log('MSG', chalk.hex('#d19a66')(sender) + ' ' + chatTag + ' ' + dim('->') + ' ' + preview);
            }

            const { handler } = require('./handler');
            await handler.call(conn, chatUpdate);

        } catch (e) {
            log('ERROR', 'messages.upsert: ' + e.message);
        }
    });

    log('SYSTEM', 'Bot siap -- menunggu koneksi...');
    divider('-', '#2a2a4a');
    console.log();
}


process.on('SIGINT',  () => { log('SYSTEM', 'SIGINT -- menyimpan data...'); saveDatabase(); process.exit(0); });
process.on('SIGTERM', () => { log('SYSTEM', 'SIGTERM -- menyimpan data...'); saveDatabase(); process.exit(0); });
process.on('uncaughtException',  (e) => log('ERROR', 'UncaughtException: '  + e.message));
process.on('unhandledRejection', (r)  => log('ERROR', 'UnhandledRejection: ' + r));


printBanner();
startBot();
