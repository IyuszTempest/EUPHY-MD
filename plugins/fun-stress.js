/**
 * Pusat Keresahan & Halu Plugin 🎭
 * Format: Unified Plugin System
 * Mode: Single File with Sub-commands
 */

module.exports = {
    command: ['stress', 'halu', 'wangi', 'nenen', 'genjot', 'curhat', 'perkosa'],
    category: 'fun',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        const sub = command.toLowerCase();

        // --- 1. MENU HELP (Pusat Stress) ---
        if (sub === 'stress' && !text) {
            let help = `╭━━〔 🏥 *𝚁𝚄𝙼𝙰𝙷 𝚂𝙰𝙺𝙸𝚃 𝙹𝙸𝚆𝙰* 〕━━┓\n`;
            help += `┃\n`;
            help += `┃ 👋 *Selamat Datang, Pasien.* \n`;
            help += `┃ Gunakan menu ini untuk meluapkan\n`;
            help += `┃ segala bentuk keresahan & halu.\n`;
            help += `┃\n`;
            help += `┣━━〔 📝 *𝙳𝙰𝙵𝚃𝙰𝚁 𝙼𝙰𝙽𝚃𝚁𝙰* 〕━━┓\n`;
            help += `┃ 🥀 ${usedPrefix}wangi <nama>\n`;
            help += `┃ 🍼 ${usedPrefix}nenen <nama>\n`;
            help += `┃ 🥵 ${usedPrefix}genjot <nama>\n`;
            help += `┃ 🎭 ${usedPrefix}curhat <nama>\n`;
            help += `┃ 💀 ${usedPrefix}perkosa <nama>\n`;
            help += `┃\n`;
            help += `┗━━━━━━━━━━━━━━━━━━━━┛\n`;
            help += `_Gunakan dengan bijak, resiko tanggung sendiri._ 🗿`;
            return m.reply(help);
        }

        // Validasi input nama
        if (!text) return m.reply(`Mana namanya? Masukkan nama target halu kamu!\nContoh: \`${usedPrefix + sub} Rem\``);

        const target = text.trim();
        let awikwok = "";

        // --- 2. LOGIKA MANTRA ---
        switch (sub) {
            case 'genjot':
                awikwok = `Buruan, panggil gue SIMP, ato BAPERAN. ini MURNI PERASAAN GUE. Gue pengen genjot bareng ${target}. Ini seriusan, suaranya yang imut, mukanya yang cantik, apalagi badannya yang aduhai ningkatin gairah gue buat genjot ${target}. Setiap lapisan kulitnya pengen gue jilat. Saat gue mau crot, gue bakal moncrot sepenuh hati, bisa di perut, muka, badan, teteknya, sampai lubang burit pun bakal gue crot sampai puncak klimaks. Gue bakal meluk dia abis gue moncrot, lalu nanya gimana kabarnya, ngrasain enggas bareng saat telanjang. Dia bakal bilang kalau genjotan gue mantep dan nyatain perasaannya ke gue, bilang kalo dia cinta ama gue. Gue bakal bilang balik seberapa gue cinta ama dia, dan dia bakal kecup gue di pipi. Terus kita ganti pakaian dan ngabisin waktu nonton film, sambil pelukan ama makan hidangan favorit. Gue mau ${target} jadi pacar, pasangan, istri, dan idup gue. Gue cinta dia dan ingin dia jadi bagian tubuh gue. Lo kira ini copypasta? Kagak cok. Gue ngetik tiap kata nyatain prasaan gue. Setiap kali elo nanya dia siapa, denger ini baik-baik : DIA ISTRI GUE. Gue sayang ${target}, dan INI MURNI PIKIRAN DAN PERASAAN GUE.`;
                break;

            case 'nenen':
                awikwok = `NENEN NENEN KEPENGEN NENEN SAMA ${target}. TETEK GEDE NAN KENCANG MILIK ${target} MEMBUATKU KEPENGEN NENEN. DIBALUT PAKAIAN KETAT YANG ADUHAI CROOOOTOTOTOTOTOT ANJING SANGE GUA BANGSAT. ${target}, PLIS DENGERIN BAIK BAIK. TOLONG BUKA BAJU SEBENTAR SAJA PLISSS TOLOOONG BANGET, BIARKAN MULUT KERINGKU BISA MENGECAP NENEN ${target}. BIARKAN AKU MENGENYOT NENENMU ${target}. AKU RELA NGASIH SESEMBAHAN APA AJA BERAPAPUN ITU DUIT YANG AKU BAKAR KHUSUS TERKHUSUS BUATMU. TAPI TOLOOOONG BANGET BUKA BAJUMU AKU MAU NENEN. NENEN NENEEEEN NENEN ${target} WANGIIII`;
                break;

            case 'wangi':
                awikwok = `${target} ${target} ${target} ❤️ ❤️ ❤️ WANGI WANGI WANGI WANGI HU HA HU HA HU HA, aaaah baunya rambut ${target} wangi aku mau nyiumin aroma wanginya ${target} AAAAAAAAH ~ Rambutnya.... aaah rambutnya juga pengen aku elus-elus ~~ AAAAAH ${target} keluar pertama kali di anime juga manis ❤️ ❤️ ❤️ banget AAAAAAAAH ${target} AAAAA LUCCUUUUUUUUUUUUUUU............ ${target} AAAAAAAAAAAAAAAAAAAAGH ❤️ ❤️ ❤️apa ? ${target} itu gak nyata ? Cuma HALU katamu ? nggak, ngak ngak ngak ngak NGAAAAAAAAK GUA GAK PERCAYA ITU DIA NYATA NGAAAAAAAAAAAAAAAAAK PEDULI BANGSAAAAAT !! GUA GAK PEDULI SAMA KENYATAAN POKOKNYA GAK PEDULI. ❤️ ❤️ ❤️ ${target} gw ... ${target} di laptop ngeliatin gw, ${target} .. kamu percaya sama aku ? aaaaaaaaaaah syukur ${target} aku gak mau merelakan ${target} aaaaaah ❤️ ❤️ ❤️ YEAAAAAAAAAAAH GUA MASIH PUNYA ${target} SENDIRI PUN NGGAK SAMA AAAAAAAAAAAAAAH`;
                break;

            case 'curhat':
                awikwok = `Usiaku 22 tahun. Aku sangat mencintai ${target}, aku punya semua Figurine dan wallpapernya. Aku berdoa setiap malam dan berterima kasih atas segala hal yang telah ia berikan kepadaku. "${target} adalah cinta" aku bilang "${target} adalah Tujuan Hidupku". Temanku datang ke kamarku dan berkata "HALU LU ANJING !!". Aku tau dia cemburu atas kesetiaanku kepada ${target}. Lalu kukatakan padaanya "BACOT NJING !!". Temanku menampol kepalaku dan menyuruhku untuk tidur. Kepalaku sakit dan aku menangis. Aku rebahan di kasur yang dingin, lalu ada sesuatu yang hangat menyentuhku. Ternyata ${target} datang ke dalam kamarku, Aku begitu senang bertemu ${target}. Dia membisikan ke telingaku, "Kamu adalah impianku" Dengan tangannya dia meraih diriku. Aku melebarkan pantatku keatas demi ${target}. Dia menusukan sesuatu kedalam Anggusku. begitu sakit, tapi kulakukan itu demi ${target}. Aku ingin memberikan kepuasan kepada ${target}. Dia meraum bagaikan singa, disaat dia melepaskan cintanya kedalam Anggusku. Temanku masuk kekamarku dan berkata "....... Anjing". ${target} melihat temanku dan berkata " Semua sudah berakhir" Dengan menggunakan kemampuannya Stellar Restoration ${target} pergi meninggalkan kamarku. "${target} itu cinta" "${target} itu kehidupan".`;
                break;

            case 'perkosa':
                awikwok = `GW BENAR-BENAR PENGEN JILAT KAKI *${target}*,GW PENGEN BANGET MENJILAT SETIAP BAGIAN KAKINYA SAMPAI AIR LIUR GW BERCUCURAN KAYAK AIR KERINGAT LALU NGENTOD DENGAN NYA SETIAP HARI SAMPAI TUBUH KITA MATI RASA, YA TUHAN GW INGIN MEMBUAT ANAK ANAK DENGAN *${target}* SEBANYAK SATU TIM SEPAK BOLA DAN MEMBUAT SATU TIM SEPAK BOLA LAINYA UNTUK MELAWAN ANAK-ANAK TIM SEPAK BOLA PERTAMA GW  YANG GW BUAT SAMA *${target}* GW PENGEN MASUK KE SETIAP LUBANG TUBUHNYA, MAU ITU LUBANG HIDUNG LUBANG MATA MAUPUN LUBANG BOOL, KEMUDIAN GW AKAN MANUSIA YANG TIDAK BISA HIDUP KALO GW GA ENTOD SETIAP HARI.`;
                break;

            case 'stress':
                // Jika user ketik .stress <nama>, default ke wangy
                awikwok = `${target} ❤️ WANGI WANGI WANGI HU HA HU HA... (Ketik \`${usedPrefix}stress\` tanpa nama untuk melihat semua pilihan)`;
                break;
        }

        await conn.sendMessage(m.chat, { react: { text: '🥵', key: m.key } });
        return m.reply(awikwok);
    }
};
