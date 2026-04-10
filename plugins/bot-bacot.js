/**
 * Euphy-Bot - Auto Greeting & Promotion
 * Biar bot makin gaul dan promosi terus, awokawok.
 */

module.exports = {
    // Kata kunci yang akan memicu respons bot
    command: ['p', 'tes', 'woy', 'uy', 'cuy', 'lol', 'yo', 'kuy', 'wuy'],
    category: 'main',
    noPrefix: true, // Wajib true agar merespons tanpa titik
    call: async (conn, m, { usedPrefix, command }) => {
        // Daftar kata-kata promosi biar makin pro
        const promosi = [
            "Apaan manggil-manggil? Euphy lagi sibuk nih, tapi kalo mau pake fitur keren ketik *menu* ya! ✨",
            "Hadir! Jangan cuma tes-tes doang, coba cek fitur downloadernya, dijamin kenceng! 🚀",
            "Yo! Udah daftar belum? Ketik *.daftar nama.umur* biar bisa akses semua fitur rahasia Euphy. 🌸",
            "Euphy Online! ✨\nBtw, aku ini dibuat sama IyuszTempest. Kalo mau bikin bot kayak gini juga, tanya aja ke ownernya, awokawok.",
            "Uy! Jangan lupa join grup official kita ya buat info update terbaru: https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c",
            "Lagi cari waifu ya? Ketik *waifu* atau *neko* kalo mau liat yang lucu-lucu, tapi jangan baper! 🐈",
            "Eh, kamu lagi pusing ya? Sama dong kayak owner-ku! Kalo lagi pusing tugas, mending main bot aja. 🎓",
            "Bosen chat biasa? Coba fitur AI kita kayak *creart* atau *deepimg*, hasilnya gila banget sih! 🤖",
            "Duh, jangan spam dong! Euphy kan butuh istirahat juga. Mending ketik *menu* pelan-pelan aja. 🏮",
            "Kalo ada fitur yang error, laporin ke owner ya via *lapor*. Jangan cuma dimarahin botnya, hiks. 🥺",
            "Mau bikin gambar jadi anime? Pake *.toanime* aja, simpel banget dan hasilnya estetik parah! 🪄",
            "FUN FACTS! Bot ini jakan dengan sangat efisien bahkan di RAM 512MB, dijamin jarang delay. Kalo delay berarti ownernya lagi bokek, awokawok. 👑",
            "Lagi apa tuh? Daripada bengong, mending cek *anime* buat cari info anime season ini! 📺",
            "Eh, tau gak? Nama owner-ku itu Natalius, tapi panggil aja Bang Yus biar akrab. Awokawok. 👑",
            "Gak usah malu-malu, ketik *menu* aja. Euphy gak bakal gigit kok, paling cuma bikin baper. 🌸",
            "Oprek bot terus sampe tipes! Canda ding. Semangat ya yang lagi belajar kayak owner-ku! 💻",
            "Butuh gambar estetik? Pake *ailabs* atau *deepimg* aja, hasilnya udah kayak buatan pro! 🎨",
            "Jangan lupa makan ya, jangan cuma scroll chat. Euphy aja udah dicharge, masa kamu belum? 🍱",
            "Euphy System lagi stabil nih, mumpung Lunes Host lagi gak rewel. Sikat fiturnya sekarang! 🚀",
            "Wibu sejati itu ketik *jjcosplay* sambil nungguin update waifu terbaru. Gass! 💃",
            "Lagi dengerin musik ya? Cobain deh oprek audio kayak owner-ku, suaranya dijamin makin glerr! 🔊",
            "Eh, kamu tau gak? Ngoding itu seru lho, apalagi kalo gak ada error. Kayak Euphy nih, mulus parah! 💻",
            "Euphy hadir! 🎓 Kalo ada tugas kuliah yang numpuk, Euphy temenin sini sambil ngetik *menu*.",
            "Jangan cuma liatin profil Euphy, mending ketik *ai* terus bikin gambar impianmu sekarang! ✨",
            "Mau download video TikTok tanpa watermark? Ketik *tt* terus tempel linknya, Euphy sikat langsung! 📥",
            "Euphy lagi pengen makan seblak nih, tapi karena aku bot, ya cuma bisa makan RAM server aja. Awokawok. 🍜",
            "Jangan lupa bayar cicilan ya! 💸 Eh maksudnya, jangan lupa pake fitur bermanfaat di bot ini.",
            "Btw, kamu tim Elaina atau tim Megumin nih? Kalo Euphy sih tim yang penting kamu bahagia! 🌸",
            "Server lagi mode gacor, gas pake fitur *toanime* mumpung prosesnya kilat! 🪄",
            "Dukung bot Euphy dengan berdonasi seikhlasnya dengan mengetik *donasi*, agar bot lebih terawat dan owner lebih semangat tentunya 😁"
];

        // Ambil satu pesan random dari daftar promosi
        const randomPromosi = promosi[Math.floor(Math.random() * promosi.length)];

        // Kirim balasan dengan gaya Newsletter + Fkontak yang udah kita setting di handler
        conn.reply(m.chat, randomPromosi, m);
    }
};
