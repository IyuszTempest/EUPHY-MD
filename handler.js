/**
 * Euphy-Bot - Handler V3.0 (Ultimate Edition)
 * Feature: Auto-Clean Premium, Dual ID Sync, PC Notifications
 */

const { smsg } = require('./lib/simple');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

module.exports = {
    async handler(chatUpdate) {
        if (!chatUpdate) return;
        let m = chatUpdate.messages[chatUpdate.messages.length - 1];
        if (!m) return;
        
        try {
            if (global.db.data == null) await global.loadDatabase();
            m = smsg(this, m);

            // --- [ 1. SMART GROUP DETECTION ] ---
            m.isGroup = m.chat.endsWith('@g.us');

            // --- [ 2. INITIALIZATION UI ] ---
            const fkontak = {
                key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" },
                message: { contactMessage: { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${global.numberowner}:${global.numberowner}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } },
                participant: "0@s.whatsapp.net"
            };

            m.reply = (text, chatId, options) => {
                return this.sendMessage(chatId || m.chat, { 
                    text: text, mentions: [m.sender],
                    contextInfo: {
                        isForwarded: true, forwardingScore: 999,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: global.idch, serverMessageId: 143, newsletterName: global.namech
                        }
                    }
                }, { quoted: fkontak, ...options }); 
            };

            // --- [ 3. DATABASE USER SETUP & SUPER AUTO-CLEAN ] ---
            let user = global.db.data.users[m.sender];
            if (typeof user !== 'object') {
                global.db.data.users[m.sender] = {
                    name: m.name || 'User', registered: false, premium: false, premiumTime: 0,
                    afk: -1, afkReason: ''
                };
            }

            // JURUS SAKTI: Sinkronisasi ID Ganda (LID & JID)
            // Jika ID yang chat tidak premium, cari apakah nomornya terdaftar premium di ID lain
            if (!global.db.data.users[m.sender].premium) {
                let idOnly = m.sender.split('@')[0];
                let findOtherId = Object.keys(global.db.data.users).find(k => k.includes(idOnly) && global.db.data.users[k].premium);
                if (findOtherId) user = global.db.data.users[findOtherId];
            } else {
                user = global.db.data.users[m.sender];
            }

            // LOGIC AUTO-CLEAN & AUTO-NOTIFY
            if (user.premium && user.premiumTime > 0 && Date.now() >= user.premiumTime) {
                user.premium = false;
                user.premiumTime = 0; 
                
                let target = m.sender;
                let ownerId = global.owner[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                let expMsg = `*─── [ PREMIUM EXPIRED ] ───*\n\nWaktu premium kamu sudah habis, @${target.split('@')[0]}! 🌸`;

                // 1. Notif di chat saat ini
                await this.reply(m.chat, expMsg, null, { mentions: [target] });

                // 2. Notif Pribadi (PC) ke USER
                await this.sendMessage(target, { text: `Halo! Masa premium kamu di Euphy-Bot sudah habis hari ini. Terima kasih banyak sudah berlangganan sebelumnya! 🙏✨` }).catch(() => null);

                // 3. Notif Pribadi (PC) ke OWNER (Yus)
                await this.sendMessage(ownerId, { text: `[ INFO EXPIRED ]\n\nUser: @${target.split('@')[0]}\nID: ${target}\nStatus premium telah otomatis dicabut oleh sistem. ✅` }).catch(() => null);
            }

            // --- [ 4. LOGIC OWNER (Hybrid JID/LID) ] ---
            const ownerList = Array.isArray(global.owner) ? global.owner : [global.owner];
            const cleanOwners = ownerList.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
            const isOwner = m.fromMe || (m.sender === global.lidowner) || cleanOwners.includes(m.sender);

            // --- [ 5. AFK DETECTOR PRIORITY ] ---
            for (let name in global.plugins) {
                let plugin = global.plugins[name];
                if (!plugin || plugin.disabled) continue;
                if (typeof plugin.before === 'function') {
                    if (await plugin.before.call(this, m, { conn: this, isOwner, fkontak })) continue;
                }
            }

            // --- [ 6. COMMAND PARSING ] ---
            let body = (typeof m.text === 'string' ? m.text : ''); 
            let isPrefix = /^[.!]/.test(body);
            let usedPrefix = isPrefix ? body[0] : '';
            let noPrefix = isPrefix ? body.slice(1).trim() : body.trim();
            let [command, ...args] = noPrefix.split` `.filter(v => v);
            command = (command || '').toLowerCase();

            // --- [ 7. EXECUTE COMMAND & ADMIN DETECTOR ] ---
            const groupMetadata = m.isGroup ? await this.groupMetadata(m.chat).catch(_ => ({})) : {};
            const participants = m.isGroup ? (groupMetadata.participants || []) : [];
            
            const botJid = this.user.id.split(':')[0] + '@s.whatsapp.net';
            const botLid = this.user.lid || global.lidbot || ''; 
            
            const userInGroup = m.isGroup ? participants.find(u => u.id === m.sender) : {};
            const botInGroup = m.isGroup ? participants.find(u => 
                u.id === botJid || (botLid && u.id === botLid) || u.id === (this.user.id.split(':')[0] + '@lid')
            ) : {};
            
            const isAdmin = userInGroup?.admin || userInGroup?.isAdmin || false;
            const isBotAdmin = botInGroup?.admin || botInGroup?.isAdmin || false;

            for (let name in global.plugins) {
                let plugin = global.plugins[name];
                if (!plugin || plugin.disabled) continue;

                const isAccept = Array.isArray(plugin.command) 
                    ? plugin.command.includes(command) 
                    : (plugin.command instanceof RegExp ? plugin.command.test(command) : plugin.command === command);

                if (isAccept) {
                    if (!isPrefix && !plugin.noPrefix) continue;
                    if (plugin.owner && !isOwner) return m.reply(`Akses Ditolak! ❌ Khusus *Owner*.`);
                    if (plugin.group && !m.isGroup) return m.reply(`Fitur ini hanya bisa digunakan di dalam *Grup*!`);
                    if (plugin.admin && !isAdmin && !isOwner) return m.reply(`Akses Ditolak! ❌ Khusus *Admin Grup*.`);
                    if (plugin.botAdmin && !isBotAdmin) return m.reply(`Euphy harus jadi *Admin* dulu untuk menjalankan perintah ini! 🌸`);
                    if (plugin.premium && !user.premium && !isOwner) return m.reply(`⚠️ Fitur khusus user *PREMIUM*!`);

                    try {
                        await plugin.call(this, m, {
                            conn: this, args, text: args.join(' '), command, usedPrefix, 
                            isOwner, isAdmin, isBotAdmin, participants, fkontak, chatUpdate 
                        });
                    } catch (e) {
                        console.error(e);
                        m.reply(`Error: ${e.message}`);
                    }
                    break; 
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
};

// --- [ 8. AUTO-PLUGIN RELOAD SYSTEM ] ---
const pluginFolder = path.join(__dirname, 'plugins');
fs.watch(pluginFolder, (event, filename) => {
    if (filename && filename.endsWith('.js')) {
        const filePath = path.join(pluginFolder, filename);
        try {
            if (fs.existsSync(filePath)) {
                delete require.cache[require.resolve(filePath)];
                global.plugins[filename] = require(filePath);
                console.log(chalk.greenBright(`[UPDATE] Plugin '${filename}' reloaded.`));
            } else {
                delete global.plugins[filename];
                console.log(chalk.yellowBright(`[DELETE] Plugin '${filename}' removed.`));
            }
        } catch (e) {
            console.error(chalk.redBright(`[ERROR] Reload '${filename}': ${e.message}`));
        }
    }
});

// Watch handler.js 
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    delete require.cache[file];
    console.log(chalk.redBright("Handler.js Updated! All Systems Normal."));
});
