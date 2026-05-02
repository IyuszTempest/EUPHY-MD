/**
 * Plugin: Free Fire Stalker 🎮
 * Fitur: Mengambil data profil pemain Free Fire berdasarkan UID.
 */

const fetch = require('node-fetch');

module.exports = {
    command: ['ffstalk'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        // Pengecekan database user
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database!");

        let uid = text?.trim() || m.quoted?.text?.trim();
        if (!uid) return m.reply(`Masukkan UID Free Fire!\nContoh: ${usedPrefix + command} 123456789`);

        // Fungsi pembantu untuk memproses data kosong
        const fix = (v) => {
            if (v === null || v === undefined) return '-';
            if (typeof v === 'string') {
                let x = v.trim().toLowerCase();
                if (!x || x === 'n/a' || x === 'none') return '-';
                return v;
            }
            return v;
        };

        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

        try {
            let url = `https://api.skylow.web.id/api/stalker/freefire?uid=${encodeURIComponent(uid)}`;
            let res = await fetch(url);

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            let json = await res.json();
            if (!json.status) return m.reply('❌ UID tidak ditemukan.');

            let p = json.result.profile || {};
            let r = json.result.rank || {};
            let g = json.result.guild || {};
            let pet = json.result.pet || {};

            let caption = `╭━━〔 🎮 *𝙵𝙵 𝚂𝚃𝙰𝙻𝙺𝙴𝚁* 〕━━┓\n┃\n` +
                          `┣ 👤 *Nama:* ${fix(p.name)}\n` +
                          `┣ 🆔 *UID:* ${fix(p.uid)}\n` +
                          `┣ 🌍 *Region:* ${fix(p.region)}\n┃\n` +
                          `┣ ⭐ *Level:* ${fix(p.level)}\n` +
                          `┣ ✨ *EXP:* ${fix(p.exp)}\n` +
                          `┣ ❤️ *Likes:* ${fix(p.likes)}\n┃\n` +
                          `┣ 🏆 *BR Points:* ${fix(r.br_points)}\n` +
                          `┣ 🎯 *CS Rank Points:* ${fix(r.cs_rank_points)}\n┃\n` +
                          `┣ 🐾 *Pet:* ${fix(pet.name)} (Lv ${fix(pet.level)})\n` +
                          `┣ 👥 *Guild:* ${fix(g.name)}\n┃\n` +
                          `┣ 🛡️ *Honor Score:* ${fix(r.honor_score)}/100\n┃\n` +
                          `┣ 💬 *Bio:* \n┃ _${fix(p.signature)}_\n┃\n` +
                          `┗━━━━━━━━━━━━━━━━━━┛`;

            await conn.sendMessage(m.chat, {
                text: caption.trim()
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error('STALK-FF-ERR:', e);
            m.reply(`❌ Terjadi kesalahan saat mengambil data profil.`);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
