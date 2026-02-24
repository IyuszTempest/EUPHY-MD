/**
 * Euphy-Bot - Handler V3.2 (LID Adaptive & Media Fix)
 * Fitur: Auto-Clean Premium, Dual ID Sync, & Hard-Fix Admin Detection
 */

const { smsg } = require('./lib/simple');
const { areJidsSameUser } = require('@whiskeysockets/baileys'); // <--- TAMBAHKAN INI
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

            // --- [ 1. SMART DETECTION (JID & LID) ] ---
            m.isGroup = m.chat.endsWith('@g.us');
            const isStatus = m.key.remoteJid === 'status@broadcast';

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

            // --- [ 3. DATABASE USER SETUP & PREMIUM SYNC ] ---
            let user = global.db.data.users[m.sender];
            if (typeof user !== 'object') {
                global.db.data.users[m.sender] = {
                    name: m.name || 'User', registered: false, premium: false, premiumTime: 0,
                    afk: -1, afkReason: ''
                };
            }

            // Sinkronisasi JID ke LID untuk Premium
            if (!user.premium) {
                let idOnly = m.sender.split('@')[0];
                let findOtherId = Object.keys(global.db.data.users).find(k => k.includes(idOnly) && global.db.data.users[k].premium);
                if (findOtherId) user = global.db.data.users[findOtherId];
            }

            // Logic Premium Expired
            if (user.premium && user.premiumTime > 0 && Date.now() >= user.premiumTime) {
                user.premium = false;
                user.premiumTime = 0;
                await this.reply(m.chat, `*─── [ PREMIUM EXPIRED ] ───*\n\nMasa premium kamu sudah habis, @${m.sender.split('@')[0]}! 🌸`, null, { mentions: [m.sender] });
            }

            // --- [ 4. AFK DETECTOR (FIXED) ] ---
            let jidTag = m.mentionedJid || [];
            jidTag.forEach(jid => {
                let targetAfk = global.db.data.users[jid];
                if (targetAfk && targetAfk.afk > -1) {
                    m.reply(`Jangan tag dia ya! 🌸\n*${targetAfk.name}* lagi AFK.\n\n*Alasan:* ${targetAfk.afkReason}`);
                }
            });

            if (user.afk > -1) {
                user.afk = -1;
                user.afkReason = '';
                m.reply(`Selamat datang kembali @${m.sender.split('@')[0]}! ✨`);
            }

            // --- [ 5. LOGIC OWNER & PLUGIN BEFORE ] ---
            const ownerList = Array.isArray(global.owner) ? global.owner : [global.owner];
            const cleanOwners = ownerList.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
            const isOwner = m.fromMe || (m.sender === global.lidowner) || cleanOwners.includes(m.sender);

            for (let name in global.plugins) {
                let plugin = global.plugins[name];
                if (!plugin || plugin.disabled) continue;
                if (typeof plugin.before === 'function') {
                    if (await plugin.before.call(this, m, { conn: this, isOwner, isStatus, fkontak })) continue;
                }
            }

            if (isStatus) return; 

            // --- [ 6. COMMAND PARSING (MEDIA CAPTION FIX) ] ---
            // Mengambil teks dari berbagai tipe pesan agar caption tetap terbaca sebagai perintah
            let body = (m.mtype === 'conversation' ? m.message.conversation : 
                        m.mtype === 'imageMessage' ? m.message.imageMessage.caption : 
                        m.mtype === 'videoMessage' ? m.message.videoMessage.caption : 
                        m.mtype === 'extendedTextMessage' ? m.message.extendedTextMessage.text : 
                        m.text || ''); 
            
            let isPrefix = /^[.!]/.test(body);
            let usedPrefix = isPrefix ? body[0] : '';
            let noPrefix = isPrefix ? body.slice(1).trim() : body.trim();
            let [command, ...args] = noPrefix.split` `.filter(v => v);
            command = (command || '').toLowerCase();

            // --- [ 7. ADMIN DETECTOR (LID ADAPTIVE) ] ---
            const groupMetadata = m.isGroup ? await this.groupMetadata(m.chat).catch(_ => ({})) : {};
            const participants = m.isGroup ? (groupMetadata.participants || []) : [];
            const botJid = this.user.id.split(':')[0] + '@s.whatsapp.net';
            
            // Mencari bot & user dengan membandingkan JID dan LID
            const userInGroup = m.isGroup ? participants.find(u => u.id === m.sender) : {};
            const botInGroup = m.isGroup ? participants.find(u => 
                areJidsSameUser(u.id, botJid) || (this.user.lid && areJidsSameUser(u.id, this.user.lid))
            ) : {};
            
            const isAdmin = userInGroup?.admin?.includes('admin') || false;
            const isBotAdmin = botInGroup?.admin?.includes('admin') || false;

            // --- [ 8. EXECUTE COMMAND ] ---
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

                
