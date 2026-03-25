/**
 * Simulasi Melatih Generasi Emas Indonesia 🇮🇩✨
 * Feature: Pilih Bakat, Pelatihan, & Kelulusan (Masa Depan)
 */

module.exports = {
    command: ['genemas', 'latih', 'cekgenerasi', 'wisuda', 'helpgemas'],
    category: 'game',
    premium: false,
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        let user = global.db.data.users[m.sender];
        
        // Inisialisasi Data Generasi Emas
        if (typeof user.gen_points === 'undefined') user.gen_points = 100; // Point untuk melatih
        if (typeof user.gen_students === 'undefined') user.gen_students = []; // Daftar bakat yang dilatih
        if (typeof user.last_train === 'undefined') user.last_train = 0;

        const cmd = command.toLowerCase();

        // --- 1. HELP MENU ---
        if (cmd === 'helpgemas') {
            let h = `╭━━〔 🇮🇩 *𝙶𝙴𝙽𝙴𝚁𝙰𝚂𝙸 𝙴𝙼𝙰𝚂 𝟸𝟶𝟺𝟻* 〕━━┓\n`;
            h += `┃\n`;
            h += `┃ 🎯 *Tugasmu:* Melatih talenta muda.\n`;
            h += `┃\n`;
            h += `┃ 🌟 *${usedPrefix}latih <nama>* \n`;
            h += `┃ Temukan bakat baru (Biaya: 20 Point).\n`;
            h += `┃\n`;
            h += `┃ 📚 *${usedPrefix}genemas* \n`;
            h += `┃ Cek daftar siswa yang sedang kamu latih.\n`;
            h += `┃\n`;
            h += `┃ 🎓 *${usedPrefix}wisuda <index>* \n`;
            h += `┃ Luluskan siswa untuk dapat Point & Rupiah.\n`;
            h += `┃\n`;
            h += `┗━━━━━━━━━━━━━━━━━━━━┛\n`;
            h += `_Ciptakan SDM unggul untuk Indonesia!_`;
            return m.reply(h);
        }

        // --- 2. CEK DAFTAR SISWA ---
        if (cmd === 'genemas' || cmd === 'cekgenerasi') {
            if (user.gen_students.length === 0) return m.reply(`Belum ada talenta yang dilatih. Ketik *${usedPrefix}latih [nama]* untuk mulai!`);
            
            let txt = `╭━━〔 🧑‍🎓 *𝚃𝙰𝙻𝙴𝙽𝚃𝙰 𝙱𝙸𝙽𝙰𝙰𝙽𝙼𝚄* 〕━━┓\n┃\n`;
            user.gen_students.forEach((s, i) => {
                txt += `┃ *${i + 1}. ${s.name}*\n`;
                txt += `┃    └ Bidang: ${s.bidang}\n`;
                txt += `┃    └ Skill: ${s.skill}% | Mental: ${s.mental}%\n`;
                txt += `┃\n`;
            });
            txt += `┃ 🔋 *Point:* ${user.gen_points}\n`;
            txt += `┃ _Ketik *${usedPrefix}helpgemas* untuk cara main._\n`;
            txt += `┗━━━━━━━━━━━━━━━━━━━━┛`;
            return m.reply(txt);
        }

        // --- 3. LATIH TALENTA BARU ---
        if (cmd === 'latih') {
            if (user.gen_points < 20) return m.reply(`❌ Point tidak cukup! Tunggu point pulih atau wisudakan siswa.`);
            if (!text) return m.reply(`⚠️ Masukkan nama calon siswa! Contoh: *${usedPrefix + command} Agus*`);
            if (user.gen_students.length >= 5) return m.reply(`❌ Kelas penuh! (Maks 5 siswa). Wisudakan yang sudah ahli.`);

            const bidang = ["Teknologi (Coding)", "Seni Kreatif", "Sains & Riset", "Atlet Olahraga"];
            const selected = bidang[Math.floor(Math.random() * bidang.length)];
            
            let newStudent = {
                name: text,
                bidang: selected,
                skill: Math.floor(Math.random() * 20) + 10,
                mental: Math.floor(Math.random() * 50) + 20
            };

            user.gen_points -= 20;
            user.gen_students.push(newStudent);

            let { key } = await conn.sendMessage(m.chat, { text: `🔎 *Mencari potensi dalam diri ${text}...*` });
            await new Promise(r => setTimeout(r, 2000));
            
            return conn.sendMessage(m.chat, { 
                text: `✨ *Berhasil!* ${text} resmi menjadi siswa binaanmu di bidang *${selected}*.\n\n_Pantau perkembangannya secara berkala!_`,
                edit: key 
            });
        }

        // --- 4. WISUDA (HASIL AKHIR) ---
        if (cmd === 'wisuda') {
            let index = parseInt(text) - 1;
            if (!user.gen_students[index]) return m.reply(`⚠️ Masukkan nomor siswa yang benar (cek di *${usedPrefix}genemas*)`);

            let s = user.gen_students[index];
            if (s.skill < 50) return m.reply(`❌ ${s.name} belum siap lulus! Skill minimal 50% (Siswa otomatis belajar seiring waktu).`);

            // Kalkulasi Reward
            let rewardMoney = s.skill * 1000;
            let rewardPoint = 30 + (s.mental / 2);
            
            user.money = (user.money || 0) + rewardMoney;
            user.gen_points += Math.floor(rewardPoint);

            let resultMsg = `🎓 *PROSES WISUDA: ${s.name}* 🎓\n`;
            resultMsg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            resultMsg += `🏆 *Status:* Lulus dengan Kompetensi Tinggi!\n`;
            resultMsg += `💼 *Karir:* Menjadi Ahli ${s.bidang}\n\n`;
            resultMsg += `💰 *Reward Rupiah:* +Rp${rewardMoney.toLocaleString()}\n`;
            resultMsg += `🔋 *Reward Point:* +${Math.floor(rewardPoint)}\n\n`;
            resultMsg += `_Satu anak bangsa telah siap membangun negeri!_ 🇮🇩`;

            user.gen_students.splice(index, 1); // Hapus dari daftar
            return m.reply(resultMsg);
        }
    },

    // Auto-Learning (Belajar Otomatis)
    before: async function (m) {
        let user = global.db.data.users[m.sender];
        if (!user || !user.gen_students || user.gen_students.length === 0) return;

        let now = new Date() * 1;
        if (now - user.last_train > 600000) { // Setiap 10 menit dapet skill
            user.gen_students.forEach(s => {
                if (s.skill < 100) s.skill += Math.floor(Math.random() * 5) + 1;
            });
            user.last_train = now;
        }
    }
};
