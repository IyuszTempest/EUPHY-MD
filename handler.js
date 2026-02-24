/**
 * Euphy-Bot - Handler V2.2 (LID & JID Support)
 * Fix: Owner detection for new WhatsApp LID system
 * Feature: Auto-Plugin Reload & AFK Priority
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

            // --- [ 1. INITIALIZATION UI ] ---
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

            // --- [ 2. DATABASE USER SETUP ] ---
            let user = global.db.data.users[m.sender];
            if (typeof user !== 'object') {
                global.db.data.users[m.sender] = {
                    name: m.name || 'User', registered: false, premium: false, afk: -1, afkReason: ''
                };
            }
            user = global.db.data.users[m.sender]; 

            // --- [ 3. LOGIC OWNER (Dual Detection: JID & LID) ] ---
            // Mengambil daftar nomor owner dari config
            const ownerList = Array.isArray(global.owner) ? global.owner : [global.owner];
            const cleanOwners = ownerList.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net');

            // Deteksi owner berdasarkan m.fromMe, LID, atau JID
            const isOwner = m.fromMe || 
                            (m.sender === global.lidowner) || 
                            cleanOwners.includes(m.sender);

            // --- [ 4. AFK DETECTOR PRIORITY ] ---
            // Harus dijalankan sebelum command agar chat biasa bisa mematikan AFK
            for (let name in global.plugins) {
                let plugin = global.plugins[name];
                if (!plugin || plugin.disabled) continue;
                if (typeof plugin.before === 'function') {
                    if (await plugin.before.call(this, m, { conn: this, isOwner, fkontak })) continue;
                }
            }

            // --- [ 5. COMMAND PARSING ] ---
            let body = (typeof m.text === 'string' ? m.text : ''); 
            let isPrefix = /^[.!]/.test(body);
            let usedPrefix = isPrefix ? body[0] : '';
            let noPrefix = isPrefix ? body.slice(1).trim() : body.trim();
            let [command, ...args] = noPrefix.split` `.filter(v => v);
            command = (command || '').toLowerCase();

            // --- [ 6. EXECUTE COMMAND ] ---
            for (let name in global.plugins) {
                let plugin = global.plugins[name];
                if (!plugin || plugin.disabled) continue;

                const isAccept = Array.isArray(plugin.command) 
                    ? plugin.command.includes(command) 
                    : (plugin.command instanceof RegExp ? plugin.command.test(command) : plugin.command === command);

                if (isAccept) {
                    if (!isPrefix && !plugin.noPrefix) continue;
                    if (plugin.owner && !isOwner) return m.reply(`Akses Ditolak! ❌ Khusus *Owner*.`);
                    if (plugin.premium && !user.premium && !isOwner) return m.reply(`⚠️ Fitur khusus user *PREMIUM*!`);

                    try {
                        await plugin.call(this, m, {
                            conn: this, args, text: args.join(' '), command, usedPrefix, isOwner, fkontak, chatUpdate 
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

// --- [ AUTO-PLUGIN RELOAD SYSTEM ] ---
// Memantau folder plugins agar tidak perlu restart manual
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

// Watch handler.js itu sendiri
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    delete require.cache[file];
    console.log(chalk.redBright("Handler.js Updated! All Systems Normal."));
});
