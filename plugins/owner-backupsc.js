/** * Plugin Auto Backup Source Code 🗄️⚡
 * Style: Euphylia Magenta / Kuroyami Module
 * Features: Compressing Source Code to .tar.gz, Auto Sent to Owner, and Auto-Rotate Backups
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function log(type, msg) {
    console.log(`[${type}] ${msg}`);
}
function dim(msg) {
    return `\x1b[2m${msg}\x1b[0m`;
}

module.exports = {
    command: ['backup', 'backupsc'],
    category: 'owner',
    owner: true, 

    call: async (conn, m, ctx) => {
        try {
            if (!conn) {
                log('WARN', 'Koneksi WA belum siap, backup ditunda!');
                return m.reply('Koneksi belum siap!');
            }

            if (typeof saveDatabase === 'function') {
                saveDatabase();
            } else if (global.db && typeof global.db.write === 'function') {
                await global.db.write();
            }

            let ownerLid = global.lidowner;
            if (!ownerLid && global.owner) {
                const firstOwner = Array.isArray(global.owner) ? global.owner[0] : global.owner;
                if (firstOwner) {
                    const rawNumber = firstOwner.split('@')[0];
                    ownerLid = `${rawNumber}@lid`; 
                }
            }

            const targetJid = ownerLid || m.sender;

            await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
            
            const rootDir = process.cwd(); 
            const backupDir = path.join(rootDir, 'backups');

            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }

            const stamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }).replace(/[/:, ]/g, '-');
            const zipName = 'backup-sc-' + stamp + '.tar.gz';
            const zipPath = path.join(backupDir, zipName);

            const cmd = `tar --exclude='node_modules' --exclude='.npm' --exclude='session' --exclude='backups' --exclude='tmp' --exclude='.git' -czf "${zipPath}" -C "${rootDir}" .`;

            exec(cmd, async (err) => {
                if (err) {
                    log('ERROR', 'Gagal kompresi tar.gz: ' + err.message);
                    return m.reply(`❌ Gagal membuat kompresi berkas backup: ${err.message}`);
                }

                log('BACKUP', 'Bundle tar.gz dibuat ' + dim('-> ' + zipName));

                const u = global.db?.data?.users ? Object.keys(global.db.data.users).length : 0;
                const c = global.db?.data?.chats ? Object.keys(global.db.data.chats).length : 0;

                const caption = '🗄️ *AUTO BACKUP SOURCE CODE — BOT SYSTEM*\n\n' +
                                '📅 ' + new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + '\n' +
                                '👥 Users  : ' + u + '\n' +
                                '💬 Chats  : ' + c + '\n' +
                                '📦 Format : Tar Gzip (.tar.gz)\n\n' +
                                `🌸 _${global.wm}_`;

                try {
                    await conn.sendMessage(targetJid, {
                        document: fs.readFileSync(zipPath),
                        mimetype: 'application/gzip',
                        fileName: zipName,
                        caption: caption
                    });

                    log('BACKUP', 'Terkirim ke WA Owner');
                    
                    if (m.chat !== targetJid) {
                        m.reply(`✅ *Backup Berhasil!* Berkas sukses dikirim langsung ke chat pribadi Owner.`);
                    }
                    await conn.sendMessage(m.chat, { react: { text: "👍", key: m.key } });

                } catch (sendErr) {
                    log('ERROR', 'Gagal kirim dokumen backup: ' + sendErr.message);
                    m.reply(`❌ Gagal mengirimkan file dokumen backup ke WA: ${sendErr.message}`);
                }
                
                try {
                    const allBackups = fs.readdirSync(backupDir)
                        .filter(f => f.startsWith('backup-sc-') && f.endsWith('.tar.gz'))
                        .map(f => ({ f, t: fs.statSync(path.join(backupDir, f)).mtimeMs }))
                        .sort((a, b) => a.t - b.t);

                    while (allBackups.length > 24) {
                        const old = allBackups.shift();
                        fs.unlinkSync(path.join(backupDir, old.f));
                        log('BACKUP', 'Rotate hapus: ' + dim(old.f));
                    }
                } catch (rotateErr) {
                    log('ERROR', 'Gagal rotasi backup: ' + rotateErr.message);
                }
            });

        } catch (e) {
            log('ERROR', 'runBackup gagal: ' + e.message);
            m.reply(`Error Script Backup: ${e.message}`);
        }
    }
};
