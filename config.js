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
global.gemini = 'Isi Apikeynya' // dapetin https://aistudio.google.com
global.wait = '_🌸 Sabar yah, lagi diproses..._';
global.eror = '_🙄 Yah lagi error nih, coba lagi nanti_';
global.packname = 'Euphylia Magenta';
global.author = 'By IyzTempest';
global.waifufav = 'Euphylia Magenta';
global.titleowner = 'Information Systems Student';
global.orgowner = '日本人';

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
