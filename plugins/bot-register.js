module.exports = {
    command: ['daftar', 'reg'],
    category: 'main',
    noPrefix: true, 
    call: async (conn, m, { text, usedPrefix, command }) => {
        let user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {});

        if (user.registered) return m.reply(`> Kamu sudah terdaftar sebagai *${user.name}*!`);
        if (!text?.includes('.')) return m.reply(`> Format salah!\n\n> Contoh: *${usedPrefix + command} Natalius.18*`);

        let [name, age] = text.split('.');
        let parseAge = parseInt(age);

        if (!name.trim()) return m.reply(`> Nama tidak boleh kosong! 👤`);
        if (isNaN(parseAge) || parseAge > 80 || parseAge < 5) return m.reply(`> Masukkan umur yang valid! 🔢`);

        Object.assign(user, {
            name: name.trim(),
            age: parseAge,
            registered: true,
            regTime: +new Date()
        });

        let caption = `〔 ⛩️ **Registration Success** 〕\n\n`;
        caption += ` 👤  *Nama:* ${user.name}\n`;
        caption += ` 🔢  *Umur:* ${user.age} tahun\n\n`;
        caption += `Sekarang kamu sudah bisa menggunakan semua fitur!\n`;
        caption += `_Ketik *${usedPrefix}menu* untuk melihat fitur._`;

        await m.reply(caption);
    }
};
