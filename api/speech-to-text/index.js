const ttsregion = "TTSREGION";
const ttsapikey = "TTSAPIKEY";

module.exports = async function (context, req) {
    const language = req.query.language;
    let body = req.body;

    if (body.at(0) === '"' && body.at(-1) === '"') {
        body = body.slice(1, -1).split(`\\n`).join('');
    }

    try {
        const headers = {
            'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
            'Accept': 'application/json;text/xml',
            'Ocp-Apim-Subscription-Key': ttsapikey,
        }
        const res = await axios.post(`https://${ttsregion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${language}`,
            body, { headers: headers });
        context.res = {
            headers: { 'Content-Type': 'application/json' },
            body: res.body
        };
        context.done();

    } catch (ex) {
        context.log(ex);
        context.res.json({
            text: "error" + ex
        });
    }
}