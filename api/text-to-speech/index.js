const temp = require('temp');
const fs = require('fs');
const { textToSpeech } = require('./textToSpeech');

const speechRegion = process.env.speechRegion;
const ttsapikey = process.env.ttsApiKey;


module.exports = async function (context, req) {
    let body = req.body;
    context.log(body);

    const tempName = temp.path({ suffix: '.wav' });
    await textToSpeech(ttsapikey, speechRegion, body, tempName);

    context.res = {
        status: 200,
        headers: {
            "access-control-allow-origin": "*",
            "content-type": "audio/x-wav",
        },
        isRaw: true,
        body: fs.readFileSync(tempName)
    };
    context.done();
}