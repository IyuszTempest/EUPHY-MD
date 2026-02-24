const axios = require('axios');
const FormData = require('form-data');
const { fromBuffer } = require('file-type');

/**
 * Upload image to Catbox.moe
 * @param {Buffer} buffer 
 */
async function uploadImage(buffer) {
    try {
        const { ext } = await fromBuffer(buffer);
        const bodyForm = new FormData();
        bodyForm.append('fileToUpload', buffer, 'file.' + ext);
        bodyForm.append('reqtype', 'fileupload');

        const { data } = await axios.post('https://catbox.moe/user/api.php', bodyForm, {
            headers: bodyForm.getHeaders()
        });
        
        return data; // Mengembalikan URL langsung
    } catch (e) {
        throw new Error('Gagal upload ke Catbox: ' + e.message);
    }
}

module.exports = { uploadImage };
