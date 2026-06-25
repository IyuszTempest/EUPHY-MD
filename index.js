'use strict';

const {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateWAMessageFromContent,
    prepareWAMessageMedia,
    proto
} = require('@whiskeysockets/baileys');

const pino     = require('pino');
const { Boom } = require('@hapi/boom');
const fs       = require('fs');
const path     = require('path');
const chalk    = require('chalk');
const readline = require('readline');
const cron     = require('node-cron');
const { exec } = require('child_process');
const axios    = require('axios');

let gradient = require('gradient-string');
if (gradient && gradient.default) {
    gradient = gradient.default;
}

require('./config');

const { smsg, makeWASocket } = require('./lib/simple');
const { uploadImage }        = require('./lib/uploadImage');

global.uploadImage = uploadImage;




// ════════════════════════════════════════════════════
//  LOGGER (Minimalist & Clean Theme)
// ════════════════════════════════════════════════════

const BADGES = {
    SYSTEM:  chalk.cyan('SYSTEM'),
    INFO:    chalk.blue('INFO'),
    WARN:    chalk.yellow('WARN'),
    ERROR:   chalk.red('ERROR'),
    PLUGIN:  chalk.magenta('PLUGIN'),
    CRON:    chalk.hex('#ff8c42')('SCHED'),
    DB:      chalk.green('DATABASE'),
    BACKUP:  chalk.yellow('BACKUP'),
    SESSION: chalk.magenta('SESSION'),
    CONN:    chalk.green('CONNECT'),
    GROUP:   chalk.blue('GROUP'),
    MSG:     chalk.hex('#d19a66')('MESSAGE'),
};

const dim = (t) => chalk.dim(t);
const bold = (t) => chalk.bold(t);

const log = (level, msg) => {
    const badge = BADGES[level] ?? chalk.white(level.toUpperCase());
    console.log(`[${badge}] ${msg}`);
};

const divider = () => {
    console.log(chalk.dim('─'.repeat(60)));
};

const truncate = (str, max = 50) => {
    if (!str) return '';
    return str.length > max ? str.slice(0, max - 3) + '...' : str;
};

const printBanner = () => {
    console.clear();
    const cyan = chalk.cyan;
    console.log(cyan.bold("   ██████╗██╗   ██╗██████╗ ██╗  ██╗██╗   ██╗"));
    console.log(cyan.bold("   ██╔═══╝██║   ██║██╔══██╗██║  ██║╚██╗ ██╔╝"));
    console.log(cyan.bold("   █████╗ ██║   ██║██████╔╝███████║ ╚████╔╝ "));
    console.log(cyan.bold("   ██╔══╝ ██║   ██║██╔═══╝ ██╔══██║  ╚██╔╝  "));
    console.log(cyan.bold("   ██████╗╚██████╔╝██║     ██║  ██║   ██║   "));
    console.log(cyan.bold("   ╚═════╝ ╚═════╝ ╚═╝     ╚═╝  ╚═╝   ╚═╝   "));
    console.log(chalk.dim("   ─────────────────────────────────────────"));
    console.log(`   ${chalk.cyan.bold('System:')} v3.3.0  ${chalk.dim('|')}  ${chalk.magenta.bold('Theme:')} Clean Minimalist`);
    console.log();
};




// ════════════════════════════════════════════════════
//  DIRS
// ════════════════════════════════════════════════════

for (const dir of ['tmp', 'plugins', 'session', 'backups']) {
    const p = path.join(__dirname, dir);
    if (!fs.existsSync(p)) {
        fs.mkdirSync(p, { recursive: true });
        log('SYSTEM', `Folder /${dir} berhasil dibuat`);
    }
}




// ════════════════════════════════════════════════════
//  DATABASE
// ════════════════════════════════════════════════════

const DB_PATH   = path.join(__dirname, 'database.json');
const defaultDB = { users: {}, chats: {}, settings: {} };

global.db = { data: { ...defaultDB } };

const loadDatabase = () => {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2));
        log('DB', 'Database baru berhasil dibuat');
        return;
    }
    try {
        global.db.data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        const u = Object.keys(global.db.data.users || {}).length;
        const c = Object.keys(global.db.data.chats || {}).length;
        log('DB', `Loaded database (${u} users, ${c} chats)`);
    } catch {
        log('ERROR', 'Database korup! Melakukan reset ke default');
        global.db.data = { ...defaultDB };
        fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2));
    }
};

const saveDatabase = () => {
    try { fs.writeFileSync(DB_PATH, JSON.stringify(global.db.data, null, 2)); }
    catch (e) { log('ERROR', 'Gagal menyimpan database: ' + e.message); }
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

        // Membuat salinan static database agar tidak error "File shrank" saat proses kompresi berjalan
        const dbSnapshotPath = path.join(__dirname, 'database-snapshot.json');
        fs.copyFileSync(DB_PATH, dbSnapshotPath);

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
            if (fs.existsSync(dbSnapshotPath)) fs.unlinkSync(dbSnapshotPath);
            return;
        }

        const stamp   = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }).replace(/[/:, ]/g, '-');
        const zipName = 'backup-sc-' + stamp + '.tar.gz';
        const zipPath = path.join(__dirname, 'backups', zipName);

        // FIX: Mengecualikan database.json dinamis, memasukkan database-snapshot.json statis, dan otomatis men-transform namanya kembali menjadi database.json di dalam arsip
        const cmd = `tar --exclude='node_modules' --exclude='.npm' --exclude='session' --exclude='backups' --exclude='tmp' --exclude='.git' --exclude='database.json' --transform='s/database-snapshot.json/database.json/' -czf "${zipPath}" -C "${__dirname}" .`;

        exec(cmd, async (err) => {
            // Selalu hapus file snapshot sementara di root setelah tar selesai
            try {
                if (fs.existsSync(dbSnapshotPath)) {
                    fs.unlinkSync(dbSnapshotPath);
                }
            } catch (snapErr) {
                log('WARN', 'Gagal menghapus file snapshot: ' + snapErr.message);
            }

            if (err) {
                log('ERROR', 'Gagal kompresi tar.gz: ' + err.message);
                return;
            }

            log('BACKUP', `Bundle tar.gz berhasil dibuat -> ${zipName}`);

            const u = Object.keys(global.db.data.users || {}).length;
            const c = Object.keys(global.db.data.chats || {}).length;

            const caption = '🗄️ *AUTO BACKUP SOURCE CODE + DATABASE — BOT SYSTEM*\n\n' +
                            '📅 ' + new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + '\n' +
                            '👥 Users  : ' + u + '\n' +
                            '💬 Chats  : ' + c + '\n' +
                            '📦 Format : Tar Gzip (.tar.gz)\n\n' +
                            '💡 *INFO RESTORE*:\n' +
                            'Database kamu aman di dalam backup ini langsung dengan nama *database.json* asli! Tidak perlu mengubah nama file lagi saat melakukan restore!';

            try {
                await conn.sendMessage(ownerLid, {
                    document: fs.readFileSync(zipPath),
                    mimetype: 'application/gzip',
                    fileName: zipName,
                    caption: caption
                });

                log('BACKUP', 'File backup berhasil dikirim ke Owner WA');
            } catch (sendErr) {
                log('ERROR', 'Gagal mengirim dokumen backup: ' + sendErr.message);
            }
            
            const backupDir  = path.join(__dirname, 'backups');
            const allBackups = fs.readdirSync(backupDir)
                .filter(f => f.startsWith('backup-sc-') && f.endsWith('.tar.gz'))
                .map(f => ({ f, t: fs.statSync(path.join(backupDir, f)).mtimeMs }))
                .sort((a, b) => a.t - b.t);

            while (allBackups.length > 24) {
                const old = allBackups.shift();
                fs.unlinkSync(path.join(backupDir, old.f));
                log('BACKUP', 'Rotasi backup: Menghapus file usang -> ' + old.f);
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
            log('SESSION', `Hapus ${bold(cleaned)} file sampah (Sisa session aktif: ${total - cleaned})`);
        } else {
            log('SESSION', `Session bersih (${total} file aktif)`);
        }
    } catch (e) {
        log('ERROR', 'cleanSession gagal: ' + e.message);
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

    log('INFO', `Menggunakan Baileys engine versi ${bold(version.join('.'))}`);

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
            log('PLUGIN', `Gagal memuat ${bold(file)} -> ${e.message}`);
        }
    };

    const pluginFiles = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
    pluginFiles.forEach(loadPlugin);
    log('PLUGIN', `Berhasil memuat ${bold(pluginFiles.length)} plugin`);

    fs.watch(pluginsDir, (event, filename) => {
        if (!filename || !filename.endsWith('.js')) return;
        const fp = path.join(pluginsDir, filename);
        if (fs.existsSync(fp)) {
            loadPlugin(filename);
            log('PLUGIN', `Update plugin: ${bold(filename)}`);
        } else {
            delete global.plugins[filename];
            log('PLUGIN', `Hapus plugin: ${bold(filename)}`);
        }
    });

    
    // Pairing
    if (!conn.authState.creds.registered) {
        divider();
        log('SYSTEM', 'Sesi belum terdaftar, memulai proses pairing...');
        console.log(`\n   ${chalk.yellow('Masukkan nomor WhatsApp')} ${dim('(contoh: 628xxx)')}`);
        const phoneNumber = (await question(`   ${chalk.cyan('> ')}`)).replace(/\D/g, '');

        setTimeout(async () => {
            try {
                const raw  = await conn.requestPairingCode(phoneNumber, 'EUPYMGTA');
                const code = raw && raw.match(/.{1,4}/g) ? raw.match(/.{1,4}/g).join('-') : raw;
                
                console.log(`\n   ${chalk.bold('Pairing Code Anda:')}`);
                console.log(`   ${chalk.bgGray.black.bold(' ' + code + ' ')}\n`);
                
                divider();
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

            log('CONN', `Koneksi terputus [Kode: ${code}]`);

            if (loggedOut) {
                log('ERROR', 'Sesi telah keluar. Hapus folder /session lalu restart kembali.');
                return process.exit(1);
            }

            reconnectCount++;
            const delay = Math.min(5000 * reconnectCount, 30_000);
            log('CONN', `Mencoba menyambungkan kembali #${reconnectCount} dalam ${delay / 1000} detik...`);
            setTimeout(() => startBot(), delay);

        } else if (connection === 'connecting') {
            log('CONN', 'Sedang menghubungkan ke server WhatsApp...');

        } else if (connection === 'open') {
            reconnectCount = 0;
            const name = (conn.user && conn.user.name) || (conn.user && conn.user.id && conn.user.id.split(':')[0]) || '—';
            const jid  = (conn.user && conn.user.id)   || '—';

            global.lidbot = conn.user.lid || (conn.user.id && conn.user.id.split(':')[0] + '@s.whatsapp.net') || '';
            
            console.log();
            divider();
            log('CONN', chalk.green.bold(`TERHUBUNG SEBAGAI -> ${name} (${jid})`));
            if (conn.user.lid) log('CONN', chalk.green(`LID BOT -> ${conn.user.lid}`));
            divider();
            console.log();
        }
    });

    conn.ev.on('creds.update', saveCreds);


    // ════════════════════════════════════════════════════
    //  GROUP WELCOME / GOODBYE (Image & Tag Mention Standard)
    // ════════════════════════════════════════════════════
    conn.ev.on('group-participants.update', async ({ id, participants, action }) => {
    if (action !== 'add' && action !== 'remove') return;

    log('GROUP', `Mendeteksi perubahan partisipan (${action}) di grup: ${id}`);

    const chat = global.db?.data?.chats?.[id] || {};
    
    let groupName = 'Grup';
    let groupDesc = 'Tidak ada deskripsi';
    try {
        const meta = await conn.groupMetadata(id);
        if (meta) {
            groupName = meta.subject || 'Grup';
            groupDesc = (meta.desc && meta.desc.toString()) || 'Tidak ada deskripsi';
        }
    } catch (err) {
        log('WARN', `Gagal mendapatkan metadata grup ${id}, menggunakan data default: ${err.message}`);
    }

    for (const num of participants) {
        try {
            if (!num) continue;

            let rawJid = '';
            if (typeof num === 'string') {
                rawJid = num;
            } else if (num && typeof num === 'object') {
                rawJid = num.id || num.jid || '';
            }

            if (!rawJid || rawJid.includes('[object')) {
                log('WARN', `Partisipan dilewati karena format tidak valid: ${JSON.stringify(num)}`);
                continue;
            }

            const cleanJid   = rawJid;
            const rawNumber  = rawJid.split(':')[0].split('@')[0];

            let staticImageUrl = global.imgwelbye;

            let userName = '';

            if (global.db?.data?.users?.[cleanJid]?.name) {
                userName = global.db.data.users[cleanJid].name;
            }

            if (!userName || userName === 'User' || /^[0-9]+$/.test(userName)) {
                try {
                    userName = conn.getName ? conn.getName(cleanJid) : '';
                } catch {}
            }

            const tagMention = `@${rawNumber}`;

            if (action === 'add') {
                if (global.imgwelcome) staticImageUrl = global.imgwelcome;
                
                const penomoranNama = userName && !/^[0-9]+$/.test(userName) ? `${userName} (${tagMention})` : tagMention;

                const templateWelcome = chat.sWelcome ||
                    `🌸 *Yokoso!*\n\n> Selamat datang kak ${penomoranNama}!\n> Senang kamu bergabung di *@group*.\n\nEnjoy your stay! ✨`;

                const captionText = templateWelcome
                    .replace(/@user/g, tagMention)
                    .replace(/\${name}/g, tagMention)
                    .replace(/@group/g, groupName)
                    .replace(/@desc/g, groupDesc);

                await conn.sendMessage(id, {
                    image: { url: staticImageUrl },
                    caption: captionText,
                    contextInfo: {
                        mentionedJid: [cleanJid],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: global.idch || '120363198372621021@newsletter',
                            serverMessageId: 143,
                            newsletterName: String(global.namech || 'Bot Info Channel')
                        }
                    }
                });

                log('GROUP', `Welcome message sukses terkirim untuk ${cleanJid}`);

            } else if (action === 'remove') {
                if (global.imgbye) staticImageUrl = global.imgbye;

                const penomoranNama = userName && !/^[0-9]+$/.test(userName) ? `${userName} (${tagMention})` : tagMention;

                const templateBye = chat.sBye ||
                    `⛩️ *Sayonara*\n\n> Goodbye ${penomoranNama}\n> Sampai jumpa lagi ya! 👋`;

                const captionText = templateBye
                    .replace(/@user/g, tagMention)
                    .replace(/\${name}/g, tagMention)
                    .replace(/@group/g, groupName);

                await conn.sendMessage(id, {
                    image: { url: staticImageUrl },
                    caption: captionText,
                    contextInfo: {
                        mentionedJid: [cleanJid]
                    }
                });

                log('GROUP', `Goodbye message sukses terkirim untuk ${cleanJid}`);
            }
        } catch (perUserError) {
            log('ERROR', `Gagal memproses partisipan ${JSON.stringify(num)}: ${perUserError.message}`);
        }
    }

})

    // ════════════════════════════════════════════════════
    //  BROADCAST HELPER & CRON JOBS
    // ════════════════════════════════════════════════════
    const broadcastGrup = async (teks, imageUrl) => {
        try {
            const groups = Object.keys(await conn.groupFetchAllParticipating());
            log('CRON', `Memulai broadcast ke ${bold(groups.length)} grup`);
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

            log('CRON', `Broadcast selesai (Berhasil: ${ok}, Gagal: ${fail})`);
        } catch (e) {
            log('ERROR', 'Gagal menjalankan broadcast: ' + e.message);
        }
    };


    // Backup source code tiap 1 jam
    cron.schedule('0 * * * *', () => {
        log('BACKUP', 'Auto backup berkala dimulai...');
        runBackup(conn);
    }, { timezone: 'Asia/Jakarta' });

    // Clean session 2x sehari: 04:00 & 16:00
    cron.schedule('0 4 * * *',  () => { log('SESSION', 'Pembersihan berkala (04:00)'); cleanSession(); }, { timezone: 'Asia/Jakarta' });
    cron.schedule('0 16 * * *', () => { log('SESSION', 'Pembersihan berkala (16:00)'); cleanSession(); }, { timezone: 'Asia/Jakarta' });

    // Morning reminder — 06:00
    cron.schedule('0 6 * * *', () => {
        log('CRON', 'Mengirim Morning Reminder...');
        broadcastGrup('🏮 *Morning Reminder*\n\n> Awali pagi dengan sarapan dan senyuman.\n> Semoga harimu menyenangkan!', global.imgpagi);
    }, { timezone: 'Asia/Jakarta' });

    // Afternoon reminder — 12:00
    cron.schedule('0 12 * * *', () => {
        log('CRON', 'Mengirim Afternoon Reminder...');
        broadcastGrup('🌸 *Afternoon Reminder*\n\n> Jangan lupa makan siang ya!\n> Istirahat sejenak, kamu udah keren hari ini', global.imgpagi);
    }, { timezone: 'Asia/Jakarta' });

    // Nightly reminder — 21:00
    cron.schedule('0 21 * * *', () => {
        log('CRON', 'Mengirim Nightly Reminder...');
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
            } catch (e) { log('WARN', `Gagal keluar dari grup ${jid}: ${e.message}`); }
        }
        if (count) log('CRON', `Sewa expired: meninggalkan ${bold(count)} grup`);
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
            } catch { log('WARN', 'Gagal mengirim notif expired ke: ' + jid.split('@')[0]); }
        }
        if (count) log('CRON', `Premium expired: menonaktifkan ${bold(count)} user`);
    }, { timezone: 'Asia/Jakarta' });

    cron.schedule('*/5 * * * *', () => {
        saveDatabase();
        const u = Object.keys(global.db.data.users || {}).length;
        const c = Object.keys(global.db.data.chats || {}).length;
        log('DB', `Auto-save database (${u} users, ${c} chats)`);
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
                const chatTag = m.isGroup ? dim(`[grp:${m.chat.split('@')[0]}]`) : dim('[dm]');
                const preview = truncate(m.text, 40);
                log('MSG', `${chalk.yellow(sender)} ${chatTag} ${dim('→')} ${preview}`);
            }

            const { handler } = require('./handler');
            await handler.call(conn, chatUpdate);

        } catch (e) {
            log('ERROR', 'Gagal memproses pesan: ' + e.message);
        }
    });

    log('SYSTEM', 'Bot siap dan aktif -- menunggu koneksi...');
    divider();
    console.log();
}


process.on('SIGINT',  () => { log('SYSTEM', 'SIGINT diterima -- menyimpan database...'); saveDatabase(); process.exit(0); });
process.on('SIGTERM', () => { log('SYSTEM', 'SIGTERM diterima -- menyimpan database...'); saveDatabase(); process.exit(0); });
process.on('uncaughtException',  (e) => log('ERROR', 'UncaughtException: '  + e.message));
process.on('unhandledRejection', (r)  => log('ERROR', 'UnhandledRejection: ' + r));


printBanner();
startBot();
