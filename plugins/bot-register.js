module.exports = {
    command: ['daftar', 'reg'],
    category: 'main',
    noPrefix: true, 
    call: async (conn, m, { text, usedPrefix, command }) => {
        let user = global.db.data.users[m.sender]; 
        
        // Cek apakah sudah terdaftar
        if (user.registered) return conn.reply(m.chat, `Kamu sudah terdaftar sebelumnya, *${user.name}*! ✨`, m);

        // Validasi input
        if (!text) return conn.reply(m.chat, `Format salah! ❌\nContoh: *${usedPrefix + command} Natalius.18*`, m);
        
        let [name, age] = text.split('.');
        if (!name || !age) return conn.reply(m.chat, `Gunakan titik (.) sebagai pemisah antara nama dan umur!\nContoh: *${usedPrefix + command} Natalius.18*`, m);
        if (isNaN(age)) return conn.reply(m.chat, `Umur harus berupa angka ya! 🔢`, m);
        if (age > 100 || age < 5) return conn.reply(m.chat, `Umur yang dimasukkan tidak valid... 🤨`, m);

        // Simpan ke database
        user.name = name.trim();
        user.age = parseInt(age);
        user.regTime = + new Date();
        user.registered = true;

        let cap = `*─── [ REGISTRASI BERHASIL ] ───*\n\n`;
        cap += `👤 *Nama:* ${user.name}\n`;
        cap += `🔢 *Umur:* ${user.age} Tahun\n`;
        cap += `📅 *Waktu:* ${new Date().toLocaleString()}\n\n`;
        cap += `Sekarang kamu sudah bisa menggunakan semua fitur Euphy! 🌸\n`;
        cap += `Ketik *${usedPrefix}menu* untuk melihat daftar fitur.`;

        conn.reply(m.chat, cap, m);
    }
};
