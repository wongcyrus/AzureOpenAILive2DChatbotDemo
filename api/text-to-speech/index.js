const axios = require('axios');

const ttsregion = "TTSREGION";
const ttsapikey = "TTSAPIKEY";

module.exports = async function (context, req) {
    let body = req.body;

    // const header = req.headers['x-ms-client-principal'];
    // const encoded = Buffer.from(header, 'base64');
    // const decoded = encoded.toString('ascii');
    // body = body.slice(1, -1).split(`\\n`).join('');
    try {
        const headers = {
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'riff-8khz-16bit-mono-pcm',
            'Ocp-Apim-Subscription-Key': ttsapikey,
        }
        const res = await axios.post(`https://${ttsregion}.tts.speech.microsoft.com/cognitiveservices/v1`, body, {
            headers: headers
        });

        context.log(res.data)
        context.res = {
            status: 200, 
            headers: { 'content-type': 'audio/x-wav' },
            isRaw: true,
            body: res.data
        };
        context.done();

    } catch (ex) {
        context.log(ex);
        context.res.json({
            text: "error" + ex
        });
    }
}