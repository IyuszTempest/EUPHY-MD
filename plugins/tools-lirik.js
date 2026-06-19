/**
 * Plugin: AZLyrics 歌詞検索 🎵⛩️
 * 説明: Theresav APIを使用して、曲の歌詞を検索して送信します。
 * スタイル: クリーン＆ミニマリスト ✨
 */

const fetch = require('node-fetch');

module.exports = {
    command: ['lirik'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        if (!text) {
            await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
            return m.reply(`Masukkan judul lagunya!\nContoh: *${command} Kawaikute Gomen*`);
        }

        try {
            await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

            const res = await fetch(`https://api.theresav.biz.id/search/azlyrics?q=${encodeURIComponent(text.trim())}&apikey=${global.thrsavapi}`);
            
            if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
            
            const json = await res.json();

            if (!json.status || !json.result) {
                throw new Error('Liriknya ga ketemu.');
            }

            const data = json.result;

            let txt = `🎵 *Hasil Pencarian Lirik* 🎵\n\n`
                    + `📌 *Judul:* ${data.title || '-'}\n`
                    + `👤 *Artis* ${data.artist || '-'}\n\n`
                    + `📖 *Lirik:* \n\n${data.lyrics}`;

            await conn.sendMessage(m.chat, {
                text: txt.trim(),
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.idch,
                        newsletterName: global.namech,
                        serverMessageId: 143
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

        } catch (err) {
            console.error("AZLyrics Search Error:", err);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`❌ *Error:* ${err.message || "Erro, coba lagi"}`);
        }
    }
};
