const axios = require('axios');

const ttsregion = "TTSREGION";
const ttsapikey = "TTSAPIKEY";

module.exports = async function (context, req) {
    let body = req.body;

    try {
        const headers = {
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'riff-8khz-16bit-mono-pcm',
            'Ocp-Apim-Subscription-Key': ttsapikey,
        }
        const res = await axios.post(`https://${ttsregion}.tts.speech.microsoft.com/cognitiveservices/v1`, body, {
            headers: headers
        });
        context.log("res");
        context.log(res);
        context.log("res.data");
        context.log(typeof(res.data));
        context.log(typeof(res.data.length));
        const data = res.data;
        context.log(data);

        context.log("after data");

        // context.log(res.data)
        // context.res = {
        //     status: 200, 
        //     headers: { 'content-type': 'audio/x-wav' },
        //     isRaw: true,
        //     body: res.data
        // };
        
        context.res.json({
            text: data
        });
    
        // context.done();

    } catch (ex) {
        context.log(ex);
        context.res.json({
            text: "error" + ex
        });
    }
}