/**
 * Euphy-Bot - Configuration Center (Fixed UI & Scope)
 * Fix: Removed undefined m.sender in global.fkontak
 */

const fs = require('fs');
const chalk = require('chalk');

// --- [ Settings Info Owner & Bot ] ---
global.owner = ['6282255810534'];
global.lidowner = '181067281604634@lid';
global.nameowner = 'IyuszTempest';
global.namebot = 'Bot Euphy';
global.numberowner = '6282255810534';
global.apiyus = 'yusz123';

// --- [ Settings Newsletter & Channel ] ---
global.idch = '120363260084721539@newsletter'; // ID Saluran kamu
global.namech = '🧧✨ Go to Euphy information'; // Nama Saluran kamu

// --- [ Settings Tampilan & Media ] ---
global.wm = '© Euphylia Magenta';
global.imgall = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXHFJP9VXUiUz_U1QVB_9ZLyYDGQ5flkJXBFTOoSaDOaIgkv5X3I8nyxo&s=10';

// --- [ AdReply UI Settings ] ---
// Digunakan otomatis oleh m.reply di simple.js
global.adReply = {
    title: 'Euphylia Magenta',
    body: 'By IyuszTempest',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXHFJP9VXUiUz_U1QVB_9ZLyYDGQ5flkJXBFTOoSaDOaIgkv5X3I8nyxo&s=10',
    source: 'https://github.com/IyuszTempest'
};

// --- [ Fkontak UI Settings ] ---
// Fix: Menggunakan global.numberowner agar tidak undefined
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

// --- [ Pesan & Respon ] ---
global.wait = '_🌸 Sabar yah, lagi diproses..._';
global.eror = '_🙄 Yah lagi error nih, coba lagi nanti_';
global.packname = 'Euphylia Magenta';
global.author = 'By IyzTempest';

// --- [ Watcher Config ] ---
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});
