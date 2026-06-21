/**
 * Plugin: Kuroyami AI Chatbot v2.0 (dengan Command Toggle & Session Management) 🎀
 * Fitur: Auto-respond toggle, session persistence, dual handler system
 * 
 * ⚠️ FIX NOTES:
 * - Typo: gloabl → global
 * - Regex: /mao/ig → /kuro/ig (consistent dengan trigger)
 * - Session naming: mao → euphy (consistent)
 * - Missing quote: error message fixed
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');
const moment = require('moment-timezone');

// ===============================
// CONFIG & INITIALIZATION
// ===============================
const genAI = new GoogleGenerativeAI(global.gemini); 
const TRIGGER_REGEX = /\beuphy\b/i;
const DEVELOPER_NAME = global.aliasowner;
const OWNER_LID = global.lidowner; // ✅ FIX: gloabl → global

global._kuroHistory = global._kuroHistory ?? new Map();

// ===============================
// SYSTEM PROMPT
// ===============================
const SYSTEM_PROMPT = global.geminiprompt;

// ===============================
// HELPERS
// ===============================
function isOwner(sender) {
  return sender === OWNER_LID;
}

function initUserSession(sender) {
  let user = global.db.data.users[sender];
  if (typeof user !== 'object') {
    global.db.data.users[sender] = {
      name: 'User',
      registered: false,
      premium: false,
      premiumTime: 0,
      afk: -1,
      afkReason: '',
      euphy: {
        auto: false,
        session: [],
        lastUsed: 0
      }
    };
    user = global.db.data.users[sender];
  }
  
  // Ensure euphy session exists ✅ FIX: mao → euphy (consistent)
  if (!user.euphy) {
    user.euphy = { auto: false, session: [], lastUsed: 0 };
  }
  
  return user;
}

function getQuotedInfo(m) {
  if (!m.quoted) return null;
  const text = m.quoted.text || m.quoted.caption || m.quoted.conversation || "";
  if (!text) return null;
  const sender = m.quoted.sender || "";
  const isDevQuoted = isOwner(sender);
  return { text, sender, isDevQuoted };
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

function clean(file) {
  try { fs.unlinkSync(file); } catch {}
}

// ===============================
// FINALPROMPT BUILDER
// ===============================
async function buildFinalPrompt(text, m) {
  let finalPrompt = text;
  
  const quotedInfo = getQuotedInfo(m);
  if (quotedInfo) {
    const quotedContext = quotedInfo.isDevQuoted 
      ? "Pesan ini berasal dari suami kamu. Balas dengan nada super lembut dan penuh perhatian.\n"
      : "User biasa yang reply ke pesan sebelumnya. Respons sesuai dengan prompt.\n";
    
    finalPrompt = `\n[Pesan yang direply]\n"${quotedInfo.text}"\n${quotedContext}` + text;
  }

  let mediaData = null;
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || "";

  if (mime) {
    const media = await q.download();
    const file = await saveTemp(media, mime);
    const base64 = fs.readFileSync(file).toString("base64");
    mediaData = { base64, mime };
    clean(file);
  }

  return { finalPrompt, mediaData };
}

// ===============================
// CORE AI ENGINE
// ===============================
async function getAIResponse(chatId, query, sender, mediaData = null) {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-3.1-flash-lite', 
    systemInstruction: SYSTEM_PROMPT 
  });
  
  if (!global._kuroHistory.has(chatId)) {
    global._kuroHistory.set(chatId, []);
  }
  const history = global._kuroHistory.get(chatId);

  const isDeveloper = isOwner(sender);
  const now = moment().tz("Asia/Jakarta");
  
  let userContext = isDeveloper 
    ? `\n[PENTING - PRIORITAS UTAMA]\nPesan ini berasal dari suamimu sekaligus penciptamu (${DEVELOPER_NAME}).\nAturan: Balas dengan nada super hangat dan perhatian!\n` 
    : `\n[INFO USER]\nIni adalah user biasa. Respons dengan cara normal sesuai prompt.\n`;
  
  let timeContext = `\n[Waktu Sekarang]\nHari: ${now.format("dddd")}\nTanggal: ${now.format("D MMMM YYYY")}\nJam: ${now.format("HH.mm")} WIB\n`;
  
  let processedQuery = userContext + query.replace(/kuro/ig, "").trim() + timeContext; // ✅ FIX: mao → kuro

  const chat = model.startChat({ history });
  let result;

  if (mediaData) {
    let mediaContextText = isDeveloper 
      ? `\n[INFO TAMBAHAN]\nMedia ini dikirim oleh suami kamu.\nJenis media: ${mediaData.mime.split("/")[0]}\nGunakan respons hangat, dan jelaskan dengan lembut.\n` 
      : `\n[INFO MEDIA]\nUser mengirim media (${mediaData.mime.split("/")[0]}). Respons sesuai dengan prompt\n`;
    
    result = await chat.sendMessage([
      { inlineData: { data: mediaData.base64, mimeType: mediaData.mime } },
      { text: mediaContextText + processedQuery }
    ]);
  } else {
    result = await chat.sendMessage(processedQuery);
  }

  const response = result.response.text();

  if (response) {
    history.push(
      { role: 'user', parts: [{ text: query }] }, 
      { role: 'model', parts: [{ text: response }] }
    );
    if (history.length > 14) history.splice(0, 2);
  }
  return response;
}

// ===============================
// PLUGIN MODULE EXPORTS
// ===============================
module.exports = {
  command: ['euphy', 'reseteuphy'],
  category: 'ai',
  noPrefix: true,
  register: true,
  
  call: async (conn, m, { text, args, isOwner }) => {
    const cleanText = m.text || "";
    const user = initUserSession(m.sender);
    
    // --- COMMAND: reset ---
    if (/^reseteuphy$/i.test(cleanText.trim())) {
      global._kuroHistory.delete(m.sender);
      return m.reply("> Riwayat obrolan euphy udah direset ya");
    }

    // --- COMMAND: on/off (TOGGLE AUTO-RESPOND) ---
    const mode = args[0]?.toLowerCase();
    if (mode === 'on' || mode === 'off') {
      if (mode === 'on') {
        if (user.euphy.auto === true) {
          return m.reply('> ⚠️ Auto Euphy sudah aktif dari tadi!');
        }
        user.euphy.auto = true;
        user.euphy.lastUsed = Date.now();
        return m.reply('> 🎀 Auto Euphy berhasil diaktifkan! Sekarang aku akan respond otomatis kalau ada yang panggil "euphy" atau mention.');
      } else if (mode === 'off') {
        if (user.euphy.auto === false) {
          return m.reply('> ⚠️ Auto Euphy tidak ada yang aktif!');
        }
        user.euphy.auto = false;
        return m.reply('> 🗑️ Auto Euphy dimatikan. Gunakan `.euphy` untuk chat manual.');
      }
    }

    // --- REGULAR CHAT (MANUAL) ---
    if (!text) return m.reply('> Mau tanya apa ke aku? Tulis pesannya ya!');
    
    try {
      await conn.sendPresenceUpdate('composing', m.chat);
      
      const response = await getAIResponse(m.chat, text, m.sender, null);
      
      if (response) {
        user.euphy.lastUsed = Date.now();
        user.euphy.session.push({ role: 'user', text });
        user.euphy.session.push({ role: 'assistant', text: response });
        if (user.euphy.session.length > 20) user.euphy.session.splice(0, 2);
        
        await conn.sendMessage(m.chat, { text: response.trim() }, { quoted: m });
      }
    } catch (e) {
      console.error('[Error Inside Call]:', e);
      return m.reply("> ❌ Kuro error nih… coba lagi ya");
    }
  },

  handleMessage: async (conn, m) => {
    if (!m || !m.chat) return;

    const botJid = conn.user?.id?.split(':')[0] + '@s.whatsapp.net';
    if (m.sender === botJid || m.fromMe) return;

    const text = m.text?.trim();
    if (!text) return;

    if (/^[°•π÷×¶∆£¢€¥®™✓_=|~!?@#$%^&.\-+*\/]/.test(text)) return;

    if (/^reseteuphy$/i.test(text)) {
      global._kuroHistory.delete(m.sender);
      return conn.sendMessage(m.chat, { text: "> Riwayat obrolan euphy udah direset ya" }, { quoted: m });
    }

    const user = initUserSession(m.sender);
    
    // --- CHECK AUTO-RESPOND STATUS ---
    if (!user.euphy.auto) return;

    const hasTrigger = TRIGGER_REGEX.test(text);
    const isGroup = m.chat.endsWith('@g.us');
    const isReplyToBot = m.quoted && m.quoted.fromMe;

    // --- TRIGGER LOGIC (Simplified) ---
    let shouldRespond = false;

    if (isGroup) {
      const isMention = m.mentionedJid && m.mentionedJid.includes(botJid);
      shouldRespond = hasTrigger || isMention || isReplyToBot;
    } else {
      shouldRespond = hasTrigger || isReplyToBot;
    }

    if (!shouldRespond) return;

    try {
      await conn.sendPresenceUpdate('composing', m.chat);

      const response = await getAIResponse(m.chat, text, m.sender, null);
      
      if (response) {
        user.euphy.lastUsed = Date.now();
        user.euphy.session.push({ role: 'user', text });
        user.euphy.session.push({ role: 'assistant', text: response });
        if (user.euphy.session.length > 20) user.euphy.session.splice(0, 2);

        await conn.sendMessage(m.chat, { text: response.trim() }, { quoted: m });
      }
    } catch (e) {
      console.error('[Error Inside HandleMessage]:', e);
    }
  }
};
