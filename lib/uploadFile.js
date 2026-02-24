const fetch = require('node-fetch');
const FormData = require('form-data');
const { fromBuffer } = require('file-type');

module.exports = async function (buffer) {
  const { ext, mime } = await fromBuffer(buffer) || { ext: 'bin', mime: 'application/octet-stream' };
  
  // Prioritas 1: Pomf (Paling Stabil buat file campur)
  try {
    let form = new FormData();
    form.append('files[]', buffer, { filename: Date.now() + '.' + ext, contentType: mime });
    let res = await fetch('https://pomf.lain.la/upload.php', { method: 'POST', body: form });
    let json = await res.json();
    if (json.success) return json.files[0].url;
  } catch (e) {
    console.error('Pomf Error:', e);
  }

  // Prioritas 2: Catbox (Buat cadangan)
  try {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, `file.${ext}`);
    let res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form });
    let data = await res.text();
    if (data.includes('https://')) return data;
  } catch (e) {
    throw 'Semua uploader gagal, Yus! ❌';
  }
};
