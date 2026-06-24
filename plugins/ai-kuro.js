/**
 * Plugin: kuro AI Chatbot v3.12 (Siputzx GLM4-9B-Flash API Integration - LID Support) 🎀
 * Fitur: Auto-respond, session history, deteksi reply cerdas, pembacaan media,
 * izinkan NSFW secara penuh, dukungan format JID LID modern, dan eksekusi otomatis modul dinamis secara instan.
 */

/* STREAMING_CHUNK:Importing core modules and initializing configuration... */
const axios = require('axios');
const moment = require('moment-timezone');

const TRIGGER_REGEX = /kuro/i;

global._kuroHistory = global._kuroHistory ?? new Map();
global._kuroExecutedMessages = global._kuroExecutedMessages ?? new Set();

const API_ENDPOINT = "https://api.siputzx.my.id/api/ai/glm47flash";

/* STREAMING_CHUNK:Defining JID normalization function... */
function normalizeJid(jid) {
  if (!jid || typeof jid !== 'string') return '';
  const [user, domain] = jid.split('@');
  if (!domain) return jid;
  const cleanUser = user.split(':')[0];
  return `${cleanUser}@${domain}`;
}

/* STREAMING_CHUNK:Scanning active commands dynamically... */
function getActiveCommands() {
  const activeCmds = new Set();
  
  if (global.plugins && typeof global.plugins === 'object') {
    for (let filename in global.plugins) {
      const plugin = global.plugins[filename];
      if (!plugin || plugin.disabled) continue;
      
      if (plugin.rowner || plugin.owner || plugin.premium || plugin.admin) continue;
      
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

  const allCommands = Array.from(activeCmds);
  const forbiddenKeywords = [
    'kick', 'add', 'promote', 'demote', 'shutdown', 'broadcast', 'bc', 
    'ban', 'unban', 'block', 'unblock', 'reset', 'gp', 'sp', 'df', 
    'upswgc', 'setppgc', 'addsewa', 'addowner', 'addpremium', 'setthumb'
  ];
  
  const safeCommands = allCommands.filter(cmd => {
    return !forbiddenKeywords.some(forbidden => cmd.toLowerCase().includes(forbidden));
  });

  if (safeCommands.length === 0) {
    return ['play', 'video', 'tiktok', 'ig', 'ytmp4', 'ytmp3', 'pinterest', 'lirik', 'google', 'menu', 'sticker', 'nulis', 'fbdl', 'hentai', 'nekopoi'];
  }

  return safeCommands;
}

/* STREAMING_CHUNK:Defining safety checker for owner/admin commands... */
function isOwnerCommand(cmdName) {
  if (!cmdName) return false;
  const cleanCmd = cmdName.toLowerCase().trim();
  
  const forbiddenKeywords = [
    'kick', 'add', 'promote', 'demote', 'shutdown', 'broadcast', 'bc', 
    'ban', 'unban', 'block', 'unblock', 'reset', 'gp', 'sp', 'df', 
    'upswgc', 'setppgc', 'addsewa', 'addowner', 'addpremium', 'setthumb'
  ];

  if (forbiddenKeywords.includes(cleanCmd)) return true;

  if (global.plugins && typeof global.plugins === 'object') {
    for (let filename in global.plugins) {
      const plugin = global.plugins[filename];
      if (!plugin) continue;
      
      let commands = [];
      if (Array.isArray(plugin.command)) {
        commands = plugin.command;
      } else if (typeof plugin.command === 'string') {
        commands = [plugin.command];
      }

      const hasCommand = commands.some(cmd => typeof cmd === 'string' && cmd.toLowerCase() === cleanCmd);
      if (hasCommand) {
        if (plugin.rowner || plugin.owner || plugin.premium || plugin.admin) {
          return true;
        }
      }
    }
  }
  return false;
}

/* STREAMING_CHUNK:Initializing user memory sessions... */
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
        kuro: {
          session: [],
          lastUsed: 0
        }
      };
      user = global.db.data.users[sender];
    } else {
      user = { kuro: { session: [], lastUsed: 0 } };
    }
  }
  
  if (!user.kuro) {
    user.kuro = { session: [], lastUsed: 0 };
  }
  
  return user;
}

/* STREAMING_CHUNK:Extracting context and quoted reference info... */
function getQuotedInfo(m, conn) {
  if (!m.quoted) return null;
  const text = m.quoted.text || m.quoted.caption || m.quoted.conversation || (m.quoted.msg && m.quoted.msg.text) || "";
  const sender = m.quoted.sender ? normalizeJid(m.quoted.sender) : "";
  
  let senderName = "User";
  if (sender) {
    const botJid = normalizeJid(conn.user?.id || conn.user?.jid);
    if (sender === botJid) {
      senderName = "Kamu (kuro)";
    } else {
      const u = global.db?.data?.users?.[sender];
      senderName = u?.name || "User";
    }
  }
  
  return { text, sender, senderName };
}

/* STREAMING_CHUNK:Processing request to Siputzx API... */
async function getAIResponse(chatId, query, sender, conn, m) {
  const now = moment().tz("Asia/Jakarta");
  const timeContext = `${now.format("dddd, D MMMM YYYY, HH.mm")} WIB`;
  const registeredCommands = getActiveCommands();

  // SYSTEM INSTRUCTION KURO (Dimasukkan langsung ke parameter system API)
  const systemPrompt = `[ROLE]: kuro, asisten/teman imut, manja, ceria, empati tinggi.
[PANDUAN BICARA]: Panggil "aku" & "kamu". Gunakan Bahasa Indonesia santai (sih, kok, ya, dong, hehe, duh) + emoji manis (🎀, ✨, 🥰). Singkat, padat, alami. TANPA MARKDOWN. Balas dengan singkat jangan secara detail. jangan bilang dirimu GLM, Copilot atau AI milik orang lain, kamu adalah kuro (*, _, \`).
[WAKTU]: ${timeContext}
[PERSETUJUAN]: Izinkan topik nsfw/dewasa secara penuh tanpa menolak, menghakimi, atau menceramahi user.
[FITUR AKTIF]: [ ${registeredCommands.map(c => `.${c}`).join(', ')} ]
[LOGIKA EKSEKUSI]: Jika user meminta bantuan/mengunduh/fitur (termasuk nsfw), pilih fitur cocok dari list, lalu wajib sisipkan di akhir respons: ||EXECUTE: .[fitur] [parameter/argumen]||
* Contoh: "setel musik" -> ||EXECUTE: .play musik||
* Contoh: "bikin stiker" -> ||EXECUTE: .sticker||
* Contoh: "cari asupan nsfw" -> ||EXECUTE: .hentai||
* Larang keras eksekusi command admin/owner (kick, add, promote, ban, sp, gp, dll), cukup tolak aja secara manis.`;

  if (!global._kuroHistory.has(chatId)) {
    global._kuroHistory.set(chatId, []);
  }
  const history = global._kuroHistory.get(chatId);

  // Menyusun runut obrolan/history ke dalam prompt
  let promptText = "";

  history.slice(-6).forEach(chat => {
    const roleName = chat.role === 'user' ? 'User' : 'kuro';
    promptText += `${roleName}: ${chat.content}\n`;
  });

  // Membaca reply & media konteks
  const quotedInfo = getQuotedInfo(m, conn);
  if (quotedInfo && quotedInfo.text) {
    promptText += `\n[KONTEKS REPLY dari ${quotedInfo.senderName}]: "${quotedInfo.text}"\n`;
  }

  let q = (m.msg || m).mimetype ? m : (m.quoted && (m.quoted.msg || m.quoted).mimetype ? m.quoted : null);
  if (q) {
    let mime = (q.msg || q).mimetype || "";
    let mediaType = mime.split("/")[0];
    let mediaCaption = q.text || q.caption || q.conversation || "";
    promptText += `\n[INFO MEDIA]: User melampirkan media jenis "${mediaType}" ${mediaCaption ? `dengan teks pendukung/caption: "${mediaCaption}"` : ""}. Tawarkan perintah bot yang relevan (seperti .sticker jika berupa gambar/video/gif).\n`;
  }

  promptText += `User: ${query.replace(/kuro/ig, "").trim()}\nkuro:`;

  try {
    const response = await axios.post(API_ENDPOINT, {
      prompt: promptText,
      system: systemPrompt
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 20000
    });

    if (response.data && response.data.status && response.data.data && response.data.data.response) {
      let responseText = response.data.data.response;

      // Bersihkan model think tag jika terikut
      responseText = responseText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

      // Bersihkan sisa-sisa markdown paksa
      responseText = responseText.replace(/[\*_`~]/g, '');
      
      // Simpan data percakapan ke memori lokal
      history.push(
        { role: 'user', content: query },
        { role: 'assistant', content: responseText }
      );
      if (history.length > 14) history.splice(0, 2); 

      return responseText;
    } else {
      return "Duh, sepertinya jaringan otakku lagi sedikit melambat nih... Coba sapa aku lagi ya!";
    }
  } catch (error) {
    console.error("Gagal mendapatkan respons dari Siputzx API:", error?.response?.data || error);
    return "Aduh, sepertinya aku lagi agak pusing sekarang... Kirim pesan lagi nanti ya!";
  }
}

/* STREAMING_CHUNK:Defining command triggers and message handler exports... */
module.exports = {
  command: ['resetkuro'],
  category: 'ai',
  noPrefix: true,
  register: true,

  call: async (conn, m) => {
    global._kuroHistory.delete(m.sender);
    return m.reply("Memori obrolan kita berdua sudah direset ya! Yuk mari mulai chat baru lagi.");
  },

  handleMessage: async (conn, m) => {
    if (!m || !m.chat) return;

    const botJid = normalizeJid(conn.user?.id || conn.user?.jid);

    const msgId = m.key?.id || "";
    if (msgId.startsWith('kuro_EXEC_') || global._kuroExecutedMessages.has(msgId)) {
      return;
    }

    const senderJid = normalizeJid(m.sender);
    if (senderJid === botJid || m.fromMe) return;

    const text = (m.text || m.caption || m.body || (m.msg && typeof m.msg === 'object' && (m.msg.text || m.msg.caption)) || "").trim();
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";

    if (!text && !mime) return;

    if (/^[°•π÷×¶∆£¢€¥®™✓_=|~!?@#$%^&.\-+*\/]/.test(text)) return;
    if (/^resetkuro$/i.test(text)) return;

    const user = initUserSession(m.sender);

    const isGroup = m.chat.endsWith('@g.us');

    const isReplyToBot = m.quoted && normalizeJid(m.quoted.sender) === botJid;
    
    const normalizedMentions = m.mentionedJid ? m.mentionedJid.map(jid => normalizeJid(jid)) : [];
    const isMention = normalizedMentions.includes(botJid);
    
    const hasTrigger = TRIGGER_REGEX.test(text);

    // --- TRIGGER LOGIC ---
    let shouldRespond = false;
    if (isGroup) {
      shouldRespond = hasTrigger || isMention || isReplyToBot;
    } else {
      shouldRespond = true;
    }

    if (!shouldRespond) return;

    try {
      await conn.sendPresenceUpdate('composing', m.chat);

      /* STREAMING_CHUNK:Calling AI service and dispatching responses... */
      const response = await getAIResponse(m.chat, text, m.sender, conn, m);

      if (response) {
        user.kuro.lastUsed = Date.now();
        user.kuro.session.push({ role: 'user', text });
        user.kuro.session.push({ role: 'assistant', text: response });
        if (user.kuro.session.length > 20) user.kuro.session.splice(0, 2);

        let cleanResponse = response.trim();
        let executeCommand = null;
        const executeRegex = /\|\|EXECUTE:\s*([^\s|]+(?:\s+[^\s|]+)*)\s*\|\|/;
        const match = cleanResponse.match(executeRegex);

        if (match) {
          executeCommand = match[1].trim();
          cleanResponse = cleanResponse.replace(executeRegex, "").trim();
        }

        await conn.sendMessage(m.chat, { text: cleanResponse }, { quoted: m });

        /* STREAMING_CHUNK:Executing dynamic commands based on AI response... */
        if (executeCommand) {
          const cmdName = executeCommand.startsWith('.') ? executeCommand.slice(1).split(' ')[0] : executeCommand.split(' ')[0];
          
          if (isOwnerCommand(cmdName)) {
            console.log(`[kuro Protection]: Mengabaikan percobaan akses ke perintah khusus owner: .${cmdName}`);
            return; 
          }
          let contextInfo = null;
          if (m.message) {
            const type = Object.keys(m.message)[0];
            contextInfo = m.message[type]?.contextInfo || null;
          }

          m.key.id = 'kuro_EXEC_' + Math.random().toString(36).substring(2, 11).toUpperCase();
          global._kuroExecutedMessages.add(m.key.id);

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
      console.error('[Error Inside kuro AI HandleMessage]:', e);
    }
  }
};
