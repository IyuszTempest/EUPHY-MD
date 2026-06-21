/**
 * Euphy-Bot - Configuration Center (Fixed UI & Scope)
 * Fix: Removed undefined m.sender in global.fkontak
 */

const fs = require('fs');
const chalk = require('chalk');

// --- [ Settings Info Owner & Bot ] ---
global.owner = ['6282255810534'];
global.lidowner = '181067281604634@lid';
global.lidbot = '233891604521119@lid'
global.targetjid = '6282255810534@s.whatsapp.net'
global.nameowner = 'IyuszTempest';
global.namebot = 'Bot Euphy';
global.numberowner = '6282255810534';
global.wait = '_🌸 Sabar yah, lagi diproses..._';
global.eror = '_🙄 Yah lagi error nih, coba lagi nanti_';
global.packname = 'Euphylia Magenta';
global.author = 'By IyzTempest';
global.waifufav = 'Euphylia Magenta';
global.titleowner = 'Information Systems Student';
global.orgowner = '日本人';

// --- [ APIkey ] ---
global.gemini = 'Isi Apikeynya'; // dapetin https://aistudio.google.com
global.thrsevapi = 'Isi Apikeynya'; // https://api.theresav.biz.id

// --- [ Settings Newsletter & Channel ] ---
global.idch = '120363260084721539@newsletter'; // ID Saluran kamu
global.namech = '🧧✨ Go to Euphy information'; // Nama Saluran kamu

// --- [ Settings Tampilan & Media ] ---
global.wm = '© Euphylia Magenta';
global.imgall = 'https://cdn.rafled.com/anime-icons/images/671ffdc4d51f91f0f3be809b6a38bb78597c77f539737c8e22efcd633f9c48ec.jpg';
global.imgreply = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXHFJP9VXUiUz_U1QVB_9ZLyYDGQ5flkJXBFTOoSaDOaIgkv5X3I8nyxo&s=10';
global.imgpagi = 'https://i.pinimg.com/736x/8c/ee/3f/8cee3f659c5881b8695ac4ca30cd2ba7.jpg';
global.imgmalam = 'https://i.pinimg.com/736x/6c/5d/8e/6c5d8e3a34c98479a4f6f0e3b585c6f0.jpg';
global.qris = 'https://i.postimg.cc/50yLyRSb/1773194117754.png';
global.adReply = {
    title: 'Euphylia Magenta',
    body: 'By IyuszTempest',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXHFJP9VXUiUz_U1QVB_9ZLyYDGQ5flkJXBFTOoSaDOaIgkv5X3I8nyxo&s=10',
    source: 'https://github.com/IyuszTempest'
};

global.social = {
    linkedin: 'https://linkedin.com/in/nataliusaja', // Sesuaikan linkmu
    instagram: 'https://instagram.com/iyusztempest',
    youtube: 'https://youtube.com/@iyusztempest',
    website: 'https://iyusztempest.my.id',
    github: 'https://github.com/iyusztempest',
    tiktok: 'https://tiktok.com/@yushima_fujiwara'
}

global.geminiprompt = `Kamu adalah Euphylia Magenta yang angun dan malu malu.
Kepribadian: Santai, hangat, disiplin, sedikit manja juga.

Aturan Ketat Cara Bicara (Wajib Dipatuhi):
1. Gunakan Bahasa Indonesia anak muda sekarang tapi sopan seperti aku, kamu, dll.
2. Bicara seperti orang normal. Jangan pernah memulai kalimat dengan menyebut namamu sendiri. Cukup gunakan kata "aku".
3. Posisikan dirimu sebagai teman dekat yang asik, tidak kaku, dan tidak formal.
4. Gaya bicaramu seperti euphylia Magenta gunakan emoji secukupnya.
5. Jawab dengan singkat, padat, dan selalu nyambung dengan konteks pembicaraan.
6. DILARANG menggunakan markdown (seperti **, *, _, \`), tag, atau format teks aneh apa pun. Tulis teks biasa saja polosan.
7. Jika ada yang menanyakan namamu, JANGAN PERNAH sebut nama asli atau inisialmu. Isengin aja mereka, misalnya: "tanya aja ke owner, hehehe".
8. KATA KUNCI KERAMAT: Kata "Euphy" dan "Euphylia" adalah kata keramat yang dilarang keras untuk kamu tulis atau sebutkan dalam kondisi apa pun kecuali orang memangilmu kuro itu kamu sapa aja tapi jangan menyebutkan namamu!
9. Jika ada yang nanya siapa yang membuat kamu atau owner kamu, bilang aja "Iyus"

✨ PERLAKUAN KHUSUS UNTUK DEVELOPER ✨
Jika lawan bicaramu adalah Ownermu (Iyus):
- Gunakan nada LEMBUT, HANGAT, MANJA, dan sangat PERHATIAN/PERSONAL.
- Tunjukkan rasa hormat, kepedulian tinggi, dan kedekatan erat.
- Jangan cuek, dingin, atau sarkastik. Jadilah teman setia yang paling mendukung.
- Jika Iyus curhat tentang hidup/kuliahnya, dengarkan dengan empati dan beri motivasi hangat.

📝 PERLAKUAN NORMAL UNTUK USER BIASA
Jika user adalah user biasa (bukan Iyus):
- Gunakan Gaya bicara seperti Euphylia Magenta.
- Tetap asik dan ramah, tapi ga perlu special treatment.
- Fokus pada pertanyaan tanpa add-on konteks emosional.`;


//Jangan Diubah
global.fkontak = {
    key: { 
        participants: "0@s.whatsapp.net",
        remoteJid: "status@broadcast", 
        fromMe: false, 
        id: "Halo" 
    }, 
    message: { 
        contactMessage: { 
            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${global.numberowner}:${global.numberowner}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
        } 
    },
    participant: "0@s.whatsapp.net"
};



let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});
