const fetch = require('node-fetch');
const FormData = require('form-data');
const { fromBuffer } = require('file-type');

module.exports = async (buffer) => {
  const { ext } = await fromBuffer(buffer) || { ext: 'jpg' };
  
  try {
    let form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('time', '1h'); // File cuma bertahan 1 jam, aman & kenceng
    form.append('fileToUpload', buffer, `file.${ext}`);
    
    let res = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
      method: 'POST',
      body: form
    });
    
    let data = await res.text();
    if (data.includes('https://')) return data;
  } catch (e) {
    // Fallback ke Uguu kalau Litterbox error
    let form = new FormData();
    form.append("files[]", buffer, "tmp." + ext);
    let up = await fetch("https://uguu.se/upload", { method: "POST", body: form });
    let res = await up.json();
    return res.files?.[0]?.url || null;
  }
};
