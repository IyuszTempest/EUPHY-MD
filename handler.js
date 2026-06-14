/**
 * Euphy-Bot - Handler V3.3
 * Fitur: Auto-Clean Premium, Dual ID Sync, & Hard-Fix Admin Detection
 */

const { smsg } = require('./lib/simple');
const { areJidsSameUser } = require('@whiskeysockets/baileys');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

module.exports = {
    async handler(chatUpdate) {
        if (!chatUpdate) return;
        let m = chatUpdate.messages[0]; 
        if (!m) return;
        
        try {
            if (!global.db || !global.db.data) {
                global.db = { data: { users: {}, chats: {}, settings: {} } };
            }
            
            m = smsg(this, m); 


            
            // --- [ 1. SMART DETECTION (JID & LID) ] ---
            m.isGroup = m.chat.endsWith('@g.us');
            const isStatus = m.key.remoteJid === 'status@broadcast';


        
            // --- [ 2. FakeQouted ] ---
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
            if (m.sender == global.lidbot) return



            // --- [ 3. DATABASE USER SETUP & PREMIUM SYNC ] ---
            let user = global.db.data.users[m.sender];
            if (typeof user !== 'object') {
                global.db.data.users[m.sender] = {
                    name: m.name || 'User', registered: false, premium: false, premiumTime: 0,
                    afk: -1, afkReason: ''
                };
            }

            if (!user?.premium) {
                let idOnly = m.sender.split('@')[0];
                let findOtherId = Object.keys(global.db.data.users).find(k => k.includes(idOnly) && global.db.data.users[k].premium);
                if (findOtherId) user = global.db.data.users[findOtherId];
            }
            

            
            // --- [ 4. LOGIC OWNER & ADMIN DETECTOR (JID/LID SYNC) ] ---
            const ownerList = Array.isArray(global.owner) ? global.owner : [global.owner];
            const cleanOwners = ownerList.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
            const isOwner = m.fromMe || (m.sender === global.lidowner) || cleanOwners.includes(m.sender);

            const groupMetadata = m.isGroup ? await this.groupMetadata(m.chat).catch(_ => ({})) : {};
            const participants = m.isGroup ? (groupMetadata.participants || []) : [];
            
            const botNumber = this.user.id; 
            const botLid = this.user.lid || '';

            const userInGroup = m.isGroup ? participants.find(u => areJidsSameUser(u.id, m.sender)) : {};
            const botInGroup = m.isGroup ? participants.find(u => 
                areJidsSameUser(u.id, botNumber) || 
                (botLid && areJidsSameUser(u.id, botLid)) ||
                u.id.split('@')[0] === botNumber.split(':')[0]
            ) : {};

            const isAdmin = m.isGroup ? (!!userInGroup?.admin) : false;
            const isBotAdmin = m.isGroup ? (!!botInGroup?.admin) : false;


            for (let name in global.plugins) {
                let plugin = global.plugins[name];
                if (!plugin || plugin.disabled) continue;
                if (typeof plugin.before === 'function') {
                    if (await plugin.before.call(this, m, { 
                        conn: this, isOwner, isStatus, fkontak, isAdmin, isBotAdmin 
                    })) continue;
                }
            }

            
            
            // --- [ 5. COMMAND PARSING (FIX NULL & TRIM) ] ---
            let body = m.message?.conversation || 
                m.message?.extendedTextMessage?.text ||
                m.message?.imageMessage?.caption ||
                m.message?.videoMessage?.caption ||
                m.message?.buttonsResponseMessage?.selectedButtonId ||
                m.message?.templateButtonReplyMessage?.selectedId ||
                '';
            
            if (!body && m?.message?.interactiveResponseMessage) {
                try {
                    let json = JSON.parse(
                        m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson || '{}'
                    );
                    body = json.id || '';
                } catch {}
            }

            let teksBody = typeof body === 'string' ? body : '';
            
            let isPrefix = /^[.!]/.test(teksBody);
            let usedPrefix = isPrefix ? teksBody[0] : '';
            let noPrefix = isPrefix ? teksBody.slice(1).trim() : teksBody.trim();
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
                    if (plugin.owner && !isOwner) return m.reply(`> Akses Ditolak! Khusus *Owner*.`);
                    if (plugin.group && !m.isGroup) return m.reply(`> Fitur ini hanya bisa digunakan di dalam *Grup*!`);
                    if (plugin.admin && !isAdmin && !isOwner) return m.reply(`> Akses Ditolak! Khusus *Admin Grup*.`);
                    if (plugin.botAdmin && !isBotAdmin) return m.reply(`> Aku harus jadi *Admin* dulu untuk menjalankan perintah ini! 🌸`);
                    if (plugin.premium && !user.premium && !isOwner) return m.reply(`> Fitur khusus user *PREMIUM*!`);

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

            for (let name in global.plugins) {
                let plugin = global.plugins[name];
                if (!plugin || plugin.disabled) continue;
                if (typeof plugin.onMessage === 'function') {
                    try {
                        await plugin.onMessage.call(this, this, m, { 
                            isAdmin, isBotAdmin, isOwner, participants 
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }
            }

            
        } catch (e) {
            console.error(e);
        }
    }
};



