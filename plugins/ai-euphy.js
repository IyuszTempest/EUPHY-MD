/**
 * Plugin: AI Chatbot v3.4 (Dynamic Agent Command Executor - Strictly Owner Only via LID) 🎀
 * Fitur: Auto-respond khusus Owner (Iyus) menggunakan global.lidowner, session history,
 * membaca media secara multimodal (Gemini), dan otomatis mengeksekusi modul plugin bot secara dinamis dengan menjaga contextInfo.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');
const moment = require('moment-timezone');

const TRIGGER_REGEX = /\beuphy\b/i;

global._euphyHistory = global._euphyHistory ?? new Map();
global._euphyExecutedMessages = global._euphyExecutedMessages ?? new Set();

const genAI = new GoogleGenerativeAI(global.gemini);

function normalizeJid(jid) {
  if (!jid || typeof jid !== 'string') return '';
  const [user, domain] = jid.split('@');
  if (!domain) return jid;
  const cleanUser = user.split(':')[0];
  return `${cleanUser}@${domain}`;
}

function getActiveCommands() {
  const activeCmds = new Set();

  if (global.plugins && typeof global.plugins === 'object') {
    for (let filename in global.plugins) {
      const plugin = global.plugins[filename];
      if (!plugin || plugin.disabled) continue;
      
      if (plugin.command) {
        if (Array.isArray(plugin.command)) {
          plugin.command.forEach(cmd => {
            if (typeof cmd === 'string') activeCmds.add(cmd);
          });
        } else if (typeof plugin.command === 'string') {
          activeCmds.add(plugin.command);
        }
      }
    }
  }

  if (global.commands && Array.isArray(global.commands)) {
    global.commands.forEach(cmd => {
      if (typeof cmd === 'string') activeCmds.add(cmd);
    });
  } else if (global.commands && typeof global.commands === 'object') {
    Object.keys(global.commands).forEach(cmd => activeCmds.add(cmd));
  }

  if (activeCmds.size === 0) {
    return ['play', 'video', 'tiktok', 'ig', 'ytmp4', 'ytmp3', 'pinterest', 'lirik', 'google', 'menu', 'sticker', 'nulis', 'fbdl'];
  }

  return Array.from(activeCmds);
}

function isOwner(sender) {
  if (!sender) return false;
  
  const lid = global.lidowner;
  if (!lid) return false;

  const cleanSender = normalizeJid(sender);
  const cleanLid = normalizeJid(lid);

  return cleanSender === cleanLid;
}


function initUserSession(sender) {
  let user = global.db?.data?.users?.[sender];
  if (!user) {
    if (global.db?.data?.users) {
      global.db.data.users[sender] = {
        name: 'User',
        registered: false,
        premium: false,
        premiumTime: 0,
        afk: -1,
        afkReason: '',
        euphy: {
          session: [],
          lastUsed: 0
        }
      };
      user = global.db.data.users[sender];
    } else {
      user = { euphy: { session: [], lastUsed: 0 } };
    }
  }
  
  if (!user.euphy) {
    user.euphy = { session: [], lastUsed: 0 };
  }
  
  return user;
}

function getQuotedInfo(m, conn) {
  if (!m.quoted) return null;
  const text = m.quoted.text || m.quoted.caption || m.quoted.conversation || (m.quoted.msg && m.quoted.msg.text) || "";
  const sender = m.quoted.sender ? normalizeJid(m.quoted.sender) : "";
  const mime = (m.quoted.msg || m.quoted).mimetype || "";
  
  let senderName = "User";
  if (sender) {
    const botJid = normalizeJid(conn.user?.id || conn.user?.jid);
    if (sender === botJid) {
      senderName = "Kamu (Euphy)";
    } else {
      senderName = isOwner(sender) ? "Iyus" : "User";
    }
  }
  
  return { text, sender, senderName, mime };
}

async function saveTemp(buffer, mime) {
  const ext = mime.split("/")[1] || "bin";
  const dir = path.join(__dirname, "../temp");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${Date.now()}.${ext}`);
  const r = new Readable();
  r._read = () => {};
  r.push(buffer);
  r.push(null);
  await pipeline(r, fs.createWriteStream(file));
  return file;
}

function cleanFile(file) {
  try { fs.unlinkSync(file); } catch {}
}

async function getAIResponse(chatId, query, sender, conn, m, mediaData = null) {
  const now = moment().tz("Asia/Jakarta");
  const timeContext = `${now.format("dddd, D MMMM YYYY, HH.mm")} WIB`;
  
  const registeredCommands = getActiveCommands();

  const systemPrompt = `[ROLE]: Euphylia Magenta (Euphy), asisten/teman dekat manis, anggun, disiplin, sedikit manja, dan pemalu.
[PANDUAN BICARA]: Panggil "aku" & "kamu". Gunakan Bahasa Indonesia santai (sih, kok, ya, dong, hehe, duh) + emoji manis (🎀, ✨, 🥰). Singkat, padat, alami. TANPA MARKDOWN. Jangan bilang kamu AI milik Google, kamu adalah Euphy (*, _, \`).
[WAKTU]: ${timeContext}
[OWNER]: Pembuat/ownermu adalah Iyus.
[FITUR AKTIF]: [ ${registeredCommands.map(c => `.${c}`).join(', ')} ]
[LOGIKA EKSEKUSI]: Jika owner meminta bantuan/mengunduh/fitur, wajib sisipkan di akhir respons: ||EXECUTE: .[fitur] [parameter/argumen]||
* Contoh: "setel musik" -> ||EXECUTE: .play musik||
* Contoh: "bikin stiker" -> ||EXECUTE: .sticker||`;

  if (!global._euphyHistory.has(chatId)) {
    global._euphyHistory.set(chatId, []);
  }
  const history = global._euphyHistory.get(chatId);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-3.1-flash-lite',
    systemInstruction: systemPrompt
  });

  const chat = model.startChat({ history });
  let promptPayload = "";
  const quotedInfo = getQuotedInfo(m, conn);
  if (quotedInfo) {
    if (quotedInfo.text) {
      promptPayload += `\n[KONTEKS REPLY dari ${quotedInfo.senderName}]: "${quotedInfo.text}"\n`;
    } else if (quotedInfo.mime) {
      promptPayload += `\n[KONTEKS REPLY dari ${quotedInfo.senderName}]: (Balas berkas media berjenis ${quotedInfo.mime})\n`;
    }
  }

  promptPayload += `User: ${query.replace(/euphy/ig, "").trim()}`;
  let result;
  if (mediaData) {
    const mediaContextText = `\n[INFO MEDIA]\nUser melampirkan media (${mediaData.mime}). Silakan baca, dengar, atau analisis isinya lalu jawab pesan user dengan mengaitkannya secara alami.\n`;
    
    result = await chat.sendMessage([
      { inlineData: { data: mediaData.base64, mimeType: mediaData.mime } },
      { text: mediaContextText + promptPayload }
    ]);
  } else {
    result = await chat.sendMessage(promptPayload);
  }

  let responseText = result.response.text();

  if (responseText) {
    responseText = responseText.replace(/[\*_`~]/g, '');
    
    history.push(
      { role: 'user', parts: [{ text: query }] },
      { role: 'model', parts: [{ text: responseText }] }
    );
    if (history.length > 14) history.splice(0, 2); 
  }

  return responseText;
}

module.exports = {
  command: ['reseteuphy'],
  category: 'ai',
  owner: true, 
  noPrefix: true,

  call: async (conn, m) => {
    global._euphyHistory.delete(m.sender);
    return m.reply("Memori obrolan kita berdua sudah direset ya! Yuk mari mulai chat baru lagi.");
  },

  handleMessage: async (conn, m) => {
    if (!m || !m.chat) return;

    const botJid = normalizeJid(conn.user?.id || conn.user?.jid);
    const sender = normalizeJid(m.sender || m.key?.participant || m.key?.remoteJid || "");

    if (!isOwner(sender)) return;

    const msgId = m.key?.id || "";
    if (msgId.startsWith('euphy_EXEC_') || global._euphyExecutedMessages.has(msgId)) {
      return;
    }

    if (sender === botJid || m.fromMe) return;

    const text = (m.text || m.caption || "").trim();
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";

    if (!text && !mime) return;

    if (/^[°•π÷×¶∆£¢€¥®™✓_=|~!?@#$%^&.\-+*\/]/.test(text)) return;
    if (/^reseteuphy$/i.test(text)) return;

    const user = initUserSession(sender);

    const isGroup = m.chat.endsWith('@g.us');
    const isReplyToBot = m.quoted && normalizeJid(m.quoted.sender) === botJid;
    
    const normalizedMentions = m.mentionedJid ? m.mentionedJid.map(jid => normalizeJid(jid)) : [];
    const isMention = normalizedMentions.includes(botJid);
    
    const hasTrigger = TRIGGER_REGEX.test(text);

    let shouldRespond = false;
    if (isGroup) {
      shouldRespond = hasTrigger || isMention || isReplyToBot;
    } else {
      shouldRespond = true;
    }

    if (!shouldRespond) return;

    try {
      await conn.sendPresenceUpdate('composing', m.chat);

      let mediaData = null;
      if (mime && /image|video|audio|webp/i.test(mime)) {
        try {
          const media = await q.download();
          const file = await saveTemp(media, mime);
          const base64 = fs.readFileSync(file).toString("base64");
          mediaData = { base64, mime };
          cleanFile(file);
        } catch (err) {
          console.error("Gagal mendownload berkas media:", err);
        }
      }

      const response = await getAIResponse(m.chat, text, sender, conn, m, mediaData);

      if (response) {
        user.euphy.lastUsed = Date.now();
        user.euphy.session.push({ role: 'user', text });
        user.euphy.session.push({ role: 'assistant', text: response });
        if (user.euphy.session.length > 20) user.euphy.session.splice(0, 2);

        let cleanResponse = response.trim();
        let executeCommand = null;
        const executeRegex = /\|\|EXECUTE:\s*([^\s|]+(?:\s+[^\s|]+)*)\s*\|\|/;
        const match = cleanResponse.match(executeRegex);

        if (match) {
          executeCommand = match[1].trim();
          cleanResponse = cleanResponse.replace(executeRegex, "").trim();
        }

        await conn.sendMessage(m.chat, { text: cleanResponse }, { quoted: m });

        if (executeCommand) {
          let contextInfo = null;
          if (m.message) {
            const type = Object.keys(m.message)[0];
            contextInfo = m.message[type]?.contextInfo || null;
          }

          m.key.id = 'euphy_EXEC_' + Math.random().toString(36).substring(2, 11).toUpperCase();
          global._euphyExecutedMessages.add(m.key.id);

          m.text = executeCommand;
          m.body = executeCommand;

          if (m.message) {
            const type = Object.keys(m.message)[0];
            if (type === 'imageMessage' || type === 'videoMessage' || type === 'documentMessage') {
              m.message[type].caption = executeCommand;
            } else if (contextInfo) {
              m.message = {
                extendedTextMessage: {
                  text: executeCommand,
                  contextInfo: contextInfo
                }
              };
            } else {
              m.message = {
                conversation: executeCommand
              };
            }
          }

          if (m.msg) {
            if (typeof m.msg === 'string') {
              m.msg = executeCommand;
            } else if (m.msg && typeof m.msg === 'object') {
              if ('text' in m.msg) m.msg.text = executeCommand;
              if ('caption' in m.msg) m.msg.caption = executeCommand;
            }
          }

          conn.ev.emit('messages.upsert', {
            type: 'notify',
            messages: [m]
          });
        }
      }
    } catch (e) {
      console.error('[Error Inside AI HandleMessage]:', e);
    }
  }
};
