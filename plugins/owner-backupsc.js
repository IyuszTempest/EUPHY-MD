const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = {
    command: ['backupsc', 'backup'],
    category: 'owner',
    noPrefix: true,
    call: async (conn, m, { usedPrefix }) => {
        try {
            const ownerJid = global.lidowner || m.sender;
            
            if (m.sender !== ownerJid) {
                return m.reply("> Maaf, perintah ini sangat rahasia dan hanya bisa digunakan oleh Owner bot!");
            }

            await conn.sendMessage(m.chat, { react: { text: '📦', key: m.key } });
            await m.reply("> ⏳ Sedang mencadangkan berkas source code menggunakan utilitas sistem, mohon tunggu...");

            const zipPath = './bot_backup.zip';
            const tarPath = './bot_backup.tar.gz';

            if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
            if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);

            const zipCommand = `zip -r ${zipPath} . -x "node_modules/*" "session/*" "sessions/*" "bot_backup.zip" "bot_backup.tar.gz" ".git/*" ".npm/*" "package-lock.json"`;

            exec(zipCommand, async (error, stdout, stderr) => {
                const zipExists = fs.existsSync(zipPath);
                const zipSize = zipExists ? fs.statSync(zipPath).size : 0;

                if (!error && zipExists && zipSize > 0) {
                    try {
                        const fileSizeMB = (zipSize / 1024 / 1024).toFixed(2);
                        
                        await conn.sendMessage(ownerJid, { 
                            document: fs.readFileSync(zipPath), 
                            fileName: 'Kuroyami_Backup.zip',
                            mimetype: 'application/zip',
                            caption: `🌸 *BACKUP COMPLETED (ZIP)* 🌸\n\n📄 *File:* Kuroyami_Backup.zip\n📦 *Size:* ${fileSizeMB} MB\n📅 *Date:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB\n\n_Simpan backup ini baik-baik ya!_`
                        });
                        
                        await m.reply("> 🚀 Selesai! Berkas backup ZIP sukses dikirim langsung ke chat pribadi kamu!");
                        
                        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
                    } catch (sendError) {
                        console.error("Gagal mengirim berkas zip:", sendError);
                        m.reply(`❌ Gagal mengirim berkas backup: ${sendError.message}`);
                    }
                } else {
                    const tarCommand = `tar -czf ${tarPath} --exclude="node_modules" --exclude="session" --exclude="sessions" --exclude="bot_backup.zip" --exclude="bot_backup.tar.gz" --exclude=".git" --exclude=".npm" --exclude="package-lock.json" .`;
                    
                    exec(tarCommand, async (tarError, tarStdout, tarStderr) => {
                        const tarExists = fs.existsSync(tarPath);
                        const tarSize = tarExists ? fs.statSync(tarPath).size : 0;
                      
                        if (tarExists && tarSize > 0) {
                            try {
                                const fileSizeMB = (tarSize / 1024 / 1024).toFixed(2);
                                
                                await conn.sendMessage(ownerJid, { 
                                    document: fs.readFileSync(tarPath), 
                                    fileName: 'Kuroyami_Backup.tar.gz',
                                    mimetype: 'application/gzip',
                                    caption: `🌸 *BACKUP COMPLETED (TAR.GZ)* 🌸\n\n📄 *File:* Kuroyami_Backup.tar.gz\n📦 *Size:* ${fileSizeMB} MB\n📅 *Date:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB\n\n_Catatan: Pencadangan sukses dialihkan ke kompresi Gzip tarball. Simpan baik-baik ya!_`
                                });
                                
                                await m.reply("> 🚀 Selesai! Berkas backup TAR.GZ sukses dikirim langsung ke chat pribadi kamu!");
                                
                                if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);
                            } catch (sendError) {
                                console.error("Gagal mengirim berkas tarball:", sendError);
                                m.reply(`❌ Gagal mengirim berkas backup tar.gz: ${sendError.message}`);
                            }
                        } else {
                            m.reply(`❌ Gagal melakukan backup dengan utilitas sistem!\n\n• ZIP Error: ${error ? error.message : 'Unknown'}\n• TAR Error: ${tarError ? tarError.message : 'Unknown'}`);
                        }
                    });
                }
            });

        } catch (e) {
            console.error('[BackupSC Error]', e.message);
            m.reply('❌ Gagal melakukan backup: ' + e.message);
        }
    }
};
