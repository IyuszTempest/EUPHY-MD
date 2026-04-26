/**
 * Random Wangy Single 🌸⛩️
 * Fitur: Mengambil 1 gambar acak dari database internal "Wangy" Yus.
 */

const wangyImageUrls = [
    "https://files.catbox.moe/4r4b5b.jpg", "https://files.catbox.moe/r577fm.jpg", 
    "https://files.catbox.moe/cn6sll.jpg", "https://file.idnet.my.id/api/preview.php?file=k0gxc9cn.jpg", 
    "https://files.catbox.moe/fjt3w0.jpg", "https://files.catbox.moe/4kz020.jpg", 
    "https://files.catbox.moe/9h7xig.jpg", "https://files.catbox.moe/nx0vzk.jpg", 
    "https://files.catbox.moe/n3n4wq.jpg", "https://files.catbox.moe/rdgj0i.jpg", 
    "https://files.catbox.moe/xa8sch.jpg", "https://files.catbox.moe/auxhu5.jpg", 
    "https://files.catbox.moe/e204yn.jpg", "https://files.catbox.moe/y8ycc1.jpg", 
    "https://files.catbox.moe/n1z0u1.jpg", "https://files.catbox.moe/sqony1.jpg", 
    "https://files.catbox.moe/dvqqab.jpg", "https://files.catbox.moe/yfuw9e.jpg", 
    "https://files.catbox.moe/ws10zf.jpg", "https://files.catbox.moe/olgr7x.jpg", 
    "https://files.catbox.moe/8xgawu.jpg", "https://files.catbox.moe/ncapdx.jpg", 
    "https://files.catbox.moe/dr2sn6.jpg", "https://file.idnet.my.id/api/preview.php?file=wx5fn06x.jpg", 
    "https://files.catbox.moe/dxqa0m.jpg", "https://files.catbox.moe/f85izz.jpg", 
    "https://files.catbox.moe/x2kjb8.jpg", "https://files.catbox.moe/4igub5.jpg", 
    "https://files.catbox.moe/g09bwa.jpg", "https://files.catbox.moe/bpm0i5.jpg", 
    "https://files.catbox.moe/6s474c.jpg", "https://files.catbox.moe/aqsarb.jpg", 
    "https://files.catbox.moe/0mi33i.jpg", "https://files.catbox.moe/s36vhv.jpg", 
    "https://files.catbox.moe/e0x2j2.jpg", "https://o.uguu.se/vanOQjUd.jpg", 
    "https://n.uguu.se/lJZUGqWv.jpg", "https://d.uguu.se/sOYgQZKg.jpg", 
    "https://h.uguu.se/GgHHkdUP.jpg", "https://h.uguu.se/GgHHkdUP.jpg", 
    "https://h.uguu.se/dhAmdSxK.jpg", "https://o.uguu.se/LTJoZAii.jpg", 
    "https://o.uguu.se/ZyhtoeBw.jpg", "https://files.catbox.moe/m5bsd3.jpg", 
    "https://files.catbox.moe/rc0206.jpg", "https://files.catbox.moe/v7bkyf.jpg", 
    "https://files.catbox.moe/w0swoa.jpg", "https://files.catbox.moe/400naj.jpg", 
    "https://files.catbox.moe/21rwm8.jpg", "https://files.catbox.moe/pgqv6q.jpg", 
    "https://files.catbox.moe/xltpyr.jpg", "https://files.catbox.moe/cikrhx.jpg", 
    "https://files.catbox.moe/uab555.jpg", "https://files.catbox.moe/kavl4u.jpg", 
    "https://files.catbox.moe/brakjh.jpg", "https://files.catbox.moe/inu9yt.jpg", 
    "https://files.catbox.moe/ayjovk.jpg", "https://files.catbox.moe/30c7a8.jpg", 
    "https://files.catbox.moe/q6nmft.jpg", "https://files.catbox.moe/68sp8c.jpg", 
    "https://files.catbox.moe/jovb5t.jpg", "https://files.catbox.moe/fa3y4v.jpg", 
    "https://files.catbox.moe/9c87so.jpg", "https://files.catbox.moe/pkq4wf.jpg", 
    "https://files.catbox.moe/wdfwzp.jpg", "https://files.catbox.moe/czt87z.jpg", 
    "https://files.catbox.moe/d62y14.jpg", "https://files.catbox.moe/dqlzqc.jpg", 
    "https://files.catbox.moe/ywydrl.jpg", "https://files.catbox.moe/3nxzgy.jpg", 
    "https://files.catbox.moe/lpxtwv.jpg", "https://files.catbox.moe/o5sdsw.jpg", 
    "https://files.catbox.moe/eck1ls.jpg", "https://files.catbox.moe/yjx8cb.jpg", 
    "https://files.catbox.moe/tyh1zp.jpg", "https://files.catbox.moe/ul44qg.jpg", 
    "https://files.catbox.moe/lqn6hr.jpg", "https://files.catbox.moe/qrp5ny.jpg", 
    "https://files.catbox.moe/flcb6w.jpg", "https://files.catbox.moe/52rlq0.jpg", 
    "https://files.catbox.moe/np0tcw.jpg", "https://files.catbox.moe/2ysfz9.jpg", 
    "https://files.catbox.moe/x1klu6.jpg", "https://files.catbox.moe/ve91cd.jpg", 
    "https://files.catbox.moe/a4tw9j.jpg", "https://files.catbox.moe/b5ptq1.jpg", 
    "https://files.catbox.moe/k051g5.jpg", "https://files.catbox.moe/71b6dc.jpg", 
    "https://files.catbox.moe/viwj5r.jpg", "https://files.catbox.moe/btn4zz.jpg"
];

module.exports = {
    command: ['wangy'],
    category: 'anime',
    premium: true,
    noPrefix: true,
    call: async (conn, m) => {
        await conn.sendMessage(m.chat, { react: { text: '🥵', key: m.key } });

        try {
            // Ambil 1 gambar acak
            const randomWangy = wangyImageUrls[Math.floor(Math.random() * wangyImageUrls.length)];

            let caption = `╭━━〔 ⛩️ *𝚆𝙰𝙽𝙶𝚈 𝙰𝚂𝚄𝙿𝙰𝙽* ⛩️ 〕━━┓\n`;
            caption += `┃ ✨ *Status:* Done\n`;
            caption += `┗━━━━━━━━━━━━━━━┛\n`;
            caption += `_Wangy banget, mwehehe... 🥵_`;

            await conn.sendMessage(m.chat, { 
                image: { url: randomWangy }, 
                caption: caption 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`❌ Aduh, gagal manggil asupan: ${e.message}`);
        }
    }
};
