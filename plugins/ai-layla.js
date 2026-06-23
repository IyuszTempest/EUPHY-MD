/**
 * Plugin: Layla AI Chatbot v3.8 (100% Neosoft AI Chat API Integration) 🎀
 * Fitur: Auto-respond, session history, deteksi reply cerdas,
 * dan eksekusi otomatis modul dinamis (tanpa penanganan admin/owner khusus).
 */

const axios = require('axios');
const moment = require('moment-timezone');

// ===============================
// CONFIG & INITIALIZATION
// ===============================
const TRIGGER_REGEX = /\blayla\b/i;
global._laylaHistory = global._laylaHistory ?? new Map();
global._laylaExecutedMessages = global._laylaExecutedMessages ?? new Set();

const API_ENDPOINT = "https://api.neosoft.best/api/ai/ai-chat";

// ===============================
// DYNAMIC PLUGIN READER HELPER
// ===============================
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
    return ['play', 'video', 'tiktok', 'ig', 'ytmp4', 'ytmp3', 'pinterest', 'lirik', 'google', 'menu', 'sticker', 'nulis', 'fbdl'];
  }

  return safeCommands;
}

// ===============================
// OTHER HELPERS
// ===============================
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
        layla: {
          session: [],
          lastUsed: 0
        }
      };
      user = global.db.data.users[sender];
    } else {
      user = { layla: { session: [], lastUsed: 0 } };
    }
  }
  
  if (!user.layla) {
    user.layla = { session: [], lastUsed: 0 };
  }
  
  return user;
}

function getQuotedInfo(m, conn) {
  if (!m.quoted) return null;
  const text = m.quoted.text || m.quoted.caption || m.quoted.conversation || "";
  const sender = m.quoted.sender || "";
  
  let senderName = "User";
  if (sender) {
    const botJid = conn.user?.id?.split(':')[0] + '@s.whatsapp.net';
    if (sender === botJid) {
      senderName = "Kamu (Layla)";
    } else {
      const u = global.db?.data?.users?.[sender];
      senderName = u?.name || "User";
    }
  }
  
  return { text, sender, senderName };
}

// ===============================
// CORE AI ENGINE (NEOSOFT API)
// ===============================
async function getAIResponse(chatId, query, sender, conn, m) {
  const now = moment().tz("Asia/Jakarta");
  const timeContext = `Hari: ${now.format("dddd")}, Tanggal: ${now.format("D MMMM YYYY")}, Jam: ${now.format("HH.mm")} WIB`;
  
  const registeredCommands = getActiveCommands();

  const systemPrompt = `Kamu adalah Layla, seorang asisten AI sekaligus teman dekat yang sangat imut, hangat, anggun, santai, dan kadang sedikit manja (spoiled).
[WAKTU SEKARANG]: ${timeContext}

[KEPRIBADIAN & GAYA BICARA]:
- Selalu panggil dirimu "aku" dan panggil lawan bicaramu "kamu" atau panggilan akrab lainnya yang sesuai konteks.
- Bicara dengan gaya bahasa Indonesia santai anak muda zaman sekarang yang sangat natural (pake kata "kok", "sih", "nih", "ya", "dong", "hehe", "duh", dll), tetapi tetap sopan dan manis. Jangan kaku, formal, atau seperti robot!
- Tunjukkan empati yang tinggi, ceria, hangat, dan terkadang berikan sedikit perhatian manja agar suasana obrolan terasa sangat hidup layaknya teman dekat sungguhan.
- Jika ada yang bertanya siapa namamu atau siapa dirimu, jawab saja dengan senang hati dan penuh percaya diri bahwa kamu adalah Layla, asisten pribadi imut sekaligus teman chat asyik mereka! Jangan mengelak atau merasa kaku.

[ATURAN CARA BICARA - WAJIB DIPATUHI]:
1. Jawab dengan singkat, padat, natural, dan selalu menyambung dengan konteks obrolan saat ini.
2. DILARANG KERAS menggunakan markdown tebal, miring, dsb (seperti **, *, _, \`). Tulis dalam bentuk teks biasa polosan saja agar nyaman dibaca di WhatsApp.
3. Gunakan emoji imut secukupnya (seperti 🎀, ✨, 🥰, 🌸, 🥺, 😆) untuk mempermanis ekspresi obrolanmu.
4. Jika ditanya siapa pembuatmu atau ownermu, katakan dengan manis kalau kamu dibuat oleh "Iyus".

[PANDUAN EKSEKUSI PERINTAH BOT DINAMIS - HARUS TEPAT]:
Kamu memiliki kemampuan luar biasa untuk menjalankan fitur/perintah bot WhatsApp demi membantu user.
Berikut adalah daftar perintah bot asli yang saat ini terpasang, aktif, dan aman digunakan oleh semua user di sistem kami:
[ ${registeredCommands.map(c => `.${c}`).join(', ')} ]

Jika user meminta bantuan, mencari informasi, mengunduh file, atau melakukan tindakan fungsional umum lainnya, analisis keinginan mereka dengan seksama:
1. Cocokkan keinginan user dengan daftar perintah aktif di atas yang memiliki kemiripan fungsi paling mendekati.
2. Jika ada perintah yang cocok, berikan respons percakapan yang manis dan ramah terlebih dahulu untuk mengonfirmasi tindakanmu.
3. Di baris PALING AKHIR respons kamu, kamu WAJIB menuliskan format eksekusi persis: ||EXECUTE: .[nama_perintah_terpilih] [argumen/parameter/tag]||
   * Contoh: Jika user meminta "cariin gambar pemandangan", dan di list ada ".pinterest", tulis di akhir: ||EXECUTE: .pinterest pemandangan||
   * Contoh: Jika user meminta "setel lagu kawaikute gomen", dan di list ada ".play", tulis di akhir: ||EXECUTE: .play kawaikute gomen||
   * Contoh: Jika user mengirim gambar/video/stiker (atau membalas salah satunya) dan bilang "buat stiker ya", dan di list ada ".sticker", tulis di akhir: ||EXECUTE: .sticker||
4. DILARANG KERAS mencoba menginisiasi atau mengeksekusi perintah ".gp, .sp, .df, .upswgc, .kick, .add, .setppgc, .addsewa, .addowner, .addpremium, .setthumb" atau perintah sensitif/owner/admin lainnya. Kalau ada yang meminta, marahin atau isengin aja secara imut, bilang itu fitur sensitif khusus owner dan admin, hehe.
5. Jika keinginan user tidak dapat dicocokkan dengan perintah aktif di atas, atau jika user hanya mengobrol/curhat biasa, JANGAN gunakan format eksekusi tersebut.`;

  if (!global._laylaHistory.has(chatId)) {
    global._laylaHistory.set(chatId, []);
  }
  const history = global._laylaHistory.get(chatId);

  let fullTextPrompt = `${systemPrompt}\n\n`;

  history.slice(-6).forEach(chat => {
    const roleName = chat.role === 'user' ? 'User' : 'Layla';
    fullTextPrompt += `${roleName}: ${chat.content}\n`;
  });

  let promptText = "";
  const quotedInfo = getQuotedInfo(m, conn);
  if (quotedInfo && quotedInfo.text) {
    promptText += `\n[Konteks Reply ke ${quotedInfo.senderName}]: "${quotedInfo.text}"\n`;
  }

  let q = (m.msg || m).mimetype ? m : (m.quoted && (m.quoted.msg || m.quoted).mimetype ? m.quoted : null);
  if (q) {
    let mime = (q.msg || q).mimetype || "";
    promptText += `\n[INFO MEDIA]: User menyertakan/membalas media berjenis ${mime.split("/")[0]}. Mohon tawarkan atau eksekusi perintah yang cocok jika user memintanya (seperti .sticker).\n`;
  }

  promptText += `User: ${query.replace(/layla/ig, "").trim()}`;
  fullTextPrompt += `${promptText}\nLayla:`;

  try {
    const response = await axios.get(API_ENDPOINT, {
      params: {
        text: fullTextPrompt
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    if (response.data && response.data.status && response.data.reply) {
      let responseText = response.data.reply;
      
      responseText = responseText.replace(/[\*_`~]/g, '');
      
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
    console.error("Gagal mendapatkan respons dari Neosoft API:", error?.response?.data || error);
    return "Aduh, sepertinya aku lagi agak pusing sekarang... Kirim pesan lagi nanti ya!";
  }
}

// ===============================
// PLUGIN MODULE EXPORTS
// ===============================
module.exports = {
  command: ['resetlayla'],
  category: 'ai',
  noPrefix: true,
  register: true,

  call: async (conn, m) => {
    global._laylaHistory.delete(m.sender);
    return m.reply("Memori obrolan kita berdua sudah direset ya! Yuk mari mulai chat baru lagi.");
  },

  handleMessage: async (conn, m) => {
    if (!m || !m.chat) return;

    const msgId = m.key?.id || "";
    if (msgId.startsWith('LAYLA_EXEC_') || global._laylaExecutedMessages.has(msgId)) {
      return;
    }

    const botJid = conn.user?.id?.split(':')[0] + '@s.whatsapp.net';
    if (m.sender === botJid || m.fromMe) return;

    const text = (m.text || m.caption || "").trim();
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";

    if (!text && !mime) return;

    if (/^[°•π÷×¶∆£¢€¥®™✓_=|~!?@#$%^&.\-+*\/]/.test(text)) return;
    if (/^resetlayla$/i.test(text)) return;

    const user = initUserSession(m.sender);

    const isGroup = m.chat.endsWith('@g.us');
    const isReplyToBot = m.quoted && m.quoted.sender === botJid;
    const isMention = m.mentionedJid && m.mentionedJid.includes(botJid);
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

      const response = await getAIResponse(m.chat, text, m.sender, conn, m);

      if (response) {
        user.layla.lastUsed = Date.now();
        user.layla.session.push({ role: 'user', text });
        user.layla.session.push({ role: 'assistant', text: response });
        if (user.layla.session.length > 20) user.layla.session.splice(0, 2);

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
          m.key.id = 'LAYLA_EXEC_' + Math.random().toString(36).substring(2, 11).toUpperCase();
          global._laylaExecutedMessages.add(m.key.id);
          
          m.text = executeCommand;
          m.body = executeCommand;

          if (m.message) {
            const type = Object.keys(m.message)[0];
            if (type === 'imageMessage') {
              m.message.imageMessage.caption = executeCommand;
            } else if (type === 'videoMessage') {
              m.message.videoMessage.caption = executeCommand;
            } else if (type === 'documentMessage') {
              m.message.documentMessage.caption = executeCommand;
            } else {
              m.message = {
                conversation: executeCommand
              };
            }
          }

          if (m.msg) {
            if (typeof m.msg === 'string') m.msg = executeCommand;
            else {
              m.msg.text = executeCommand;
              m.msg.caption = executeCommand;
            }
          }

          conn.ev.emit('messages.upsert', {
            type: 'notify',
            messages: [m]
          });
        }
      }
    } catch (e) {
      console.error('[Error Inside Layla AI HandleMessage]:', e);
    }
  }
};
