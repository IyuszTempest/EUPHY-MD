/** * Plugin: Check Channel/Newsletter ID 📢⛩️
 * Deskripsi: Mendeteksi ID unik dari Channel WhatsApp (Newsletter) melalui pesan atau reply.
 * Style: Clean & Minimalist ✨
 * Adopted to Euphylia Magenta Bot Structure
 */

module.exports = {
    command: ['cekidch', 'idch', 'channelid'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { usedPrefix }) => {
        try {
            // Berikan reaksi pengeras suara biar interaktif
            await conn.sendMessage(m.chat, { react: { text: '📢', key: m.key } });

            // Mendeteksi pesan yang di-reply (quoted) atau pesan saat ini
            const quoted = m.quoted ? m.quoted : m;
            
            // Mengambil ID chat. Kita juga cek contextInfo seandainya pesan berasal dari forward newsletter
            let channelId = quoted.chat || m.chat;
            
            if (m.quoted && m.quoted.contextInfo && m.quoted.contextInfo.forwardedNewsletterMessageInfo) {
                channelId = m.quoted.contextInfo.forwardedNewsletterMessageInfo.newsletterJid;
            }

            // Validasi apakah ID berakhiran @newsletter
            if (!channelId || !channelId.endsWith('@newsletter')) {
                return m.reply("> ❌ Pesan ini bukan berasal dari Channel (Newsletter)!\nPastikan kamu me-reply salah satu pesan dari dalam channel yang ingin kamu ketahui ID-nya ya!");
            }

            // Desain teks keluaran dengan gaya Clean & Minimalist
            let txt = `🌸 *CHANNEL ID FOUND* 🌸\n\n`;
            txt += `📌 *ID:* \`${channelId}\`\n\n`;
            txt += `_Silakan salin ID di atas untuk digunakan pada konfigurasi menu atau fitur broadcast channel kamu ya!_`;

            // Kirim balasan hasil deteksi ID
            await m.reply(txt);
            await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

        } catch (e) {
            console.error("Error in CekID:", e);
            m.reply("❌ Terjadi kesalahan saat mendeteksi ID Channel.");
        }
    }
};
