/**
 * Euphy-Bot - Nekopoi Downloader ✨
 * Convert structure for Euphy-MD
 */

const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    command: ['nekopoi'],
    category: 'nsfw',
    premium: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        try {
            if (!args[0]) {
                const helpMessage = `*〔 ⛩️ NEKOPOI MENU 〕*\n\n` +
                    `- *${usedPrefix + command} search <judul>* : Cari konten.\n` +
                    `- *${usedPrefix + command} detail <url>* : Lihat detail & link.\n\n` +
                    `*Contoh:* ${usedPrefix + command} search overflow`;
                return m.reply(helpMessage);
            }

            const type = args[0].toLowerCase();
            await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

            switch (type) {
                case 'search':
                    if (!args[1]) throw 'Masukkan kata kunci!';
                    const query = args.slice(1).join(' ');
                    const searchResults = await nekopoiSearch(query);
                    
                    let searchText = `╭━━〔 ⛩️ *𝙽𝙴𝙺𝙾𝙿𝙾𝙸 𝚂𝙴𝙰𝚁𝙲𝙷* ⛩️ 〕━━┓\n┃ 🔍 *Hasil untuk:* ${query}\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
                    searchResults.forEach((item, index) => {
                        searchText += `*${index + 1}. ${item.title}*\n`;
                        searchText += `🔗 \`${item.url}\`\n\n`;
                    });
                    searchText += `*Note:* Copas URL-nya terus ketik:\n_${usedPrefix + command} detail <url>_`;

                    await conn.sendMessage(m.chat, {
                        text: searchText,
                        contextInfo: {
                            externalAdReply: {
                                title: 'Nekopoi Search Result',
                                body: `Found ${searchResults.length} results for ${query}`,
                                thumbnailUrl: searchResults[0]?.thumbnail || global.imgall,
                                sourceUrl: 'https://nekopoi.care',
                                mediaType: 1
                            }
                        }
                    }, { quoted: m });
                    break;

                case 'detail':
                    if (!args[1]) throw 'Masukkan URL Nekopoi-nya!';
                    const detailResult = await nekopoiDetail(args[1]);
                    
                    let detailText = `╭━━〔 ⛩️ *𝙳𝙴𝚃𝙰𝙸𝙻 𝙺𝙾𝙽𝚃𝙴𝙽* ⛩️ 〕━━┓\n┃ 🌸 *${detailResult.title}*\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
                    detailText += `• *Duration:* ${detailResult.duration}\n`;
                    detailText += `• *Views:* ${detailResult.views}\n`;
                    detailText += `• *Date:* ${detailResult.date}\n\n`;
                    
                    detailText += `*--- 📥 DOWNLOAD LINK ---*\n`;
                    Object.entries(detailResult.downloads).forEach(([res, links]) => {
                        detailText += `\n*Resolution [${res}]:*\n`;
                        links.normal.forEach(link => {
                            detailText += `- ${link.name}: ${link.url}\n`;
                        });
                    });

                    detailText += `\n*Euphylia Magenta* ✨`;

                    await conn.sendMessage(m.chat, {
                        text: detailText,
                        contextInfo: {
                            externalAdReply: {
                                title: detailResult.title,
                                body: 'Siap eksekusi!',
                                thumbnailUrl: detailResult.thumbnail || global.imgall,
                                sourceUrl: args[1],
                                mediaType: 1
                            }
                        }
                    }, { quoted: m });
                    break;

                default:
                    throw `Perintah salah. Pakai *search* atau *detail*.`;
            }
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Euphy Error:* ${e.message || e}`);
        }
    }
};

// --- SCRAPER FUNCTIONS ---

async function nekopoiSearch(query, page = 1) {
    const baseUrl = 'https://nekopoi.care/search/';
    try {
        const url = page === 1 ? `${baseUrl}${query}` : `${baseUrl}${query}/page/${page}/?${query}`;
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        const results = [];
        $('div.result ul li').each((i, el) => {
            const titleElement = $(el).find('h2 a');
            results.push({
                title: titleElement.text().trim(),
                url: titleElement.attr('href'),
                thumbnail: $(el).find('img').attr('src')
            });
        });
        if (results.length === 0) throw 'Konten nggak ketemu, Yus.';
        return results;
    } catch (e) { throw e; }
}

async function nekopoiDetail(url) {
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        const result = {
            title: $('div.eroinfo h1').text().trim(),
            thumbnail: $('div.thm img').attr('src'),
            duration: '',
            views: '',
            date: '',
            downloads: {}
        };

        $('div.konten p').each((i, el) => {
            const text = $(el).text().trim();
            if (text.startsWith('Duration')) result.duration = text.replace('Duration : ', '').trim();
        });

        const viewsDateText = $('div.eroinfo p').text().trim();
        result.views = viewsDateText.match(/Dilihat\s+(\d+)/)?.[1] || 'N/A';
        result.date = viewsDateText.match(/\/\s+(.+)/)?.[1] || 'N/A';

        $('div.boxdownload div.liner').each((i, el) => {
            const res = $(el).find('div.name').text().match(/\[(\d+p)\]/)?.[1];
            if (res) {
                const links = { normal: [] };
                $(el).find('div.listlink p a').each((j, linkEl) => {
                    const href = $(linkEl).attr('href');
                    if (!href.includes('ouo.io')) { // Filter biar gak kena link receh
                        links.normal.push({ name: $(linkEl).text().trim(), url: href });
                    }
                });
                result.downloads[res] = links;
            }
        });
        return result;
    } catch (e) { throw e; }
}
