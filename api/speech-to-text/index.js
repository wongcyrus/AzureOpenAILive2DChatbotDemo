const { BlobServiceClient } = require("@azure/storage-blob");
const { speechToText } = require("./speechToText");
const temp = require('temp');
const fs = require('fs');

const speechRegion = process.env.speechRegion;
const ttsApiKey = process.env.ttsApiKey;
const storageAccountConnectionString = process.env.chatStorageAccountConnectionString;

const blobServiceClient = BlobServiceClient.fromConnectionString(storageAccountConnectionString);
const containerClient = blobServiceClient.getContainerClient("voice");

const getEmail = (req) => {
    const header = req.headers['x-ms-client-principal'];
    const encoded = Buffer.from(header, 'base64');
    const decoded = encoded.toString('ascii');
    const clientPrincipal = JSON.parse(decoded);
    return clientPrincipal.userDetails;
}


module.exports = async function (context, req) {
    const language = req.query.language;

    try {
        const bodyBuffer = new Uint8Array(Buffer.from(req.body, 'binary'));

        const tempName = temp.path({ suffix: '.wav' });
        fs.writeFileSync(tempName, bodyBuffer);

        const email = getEmail(req);
        const blobName = email.replace(/[^a-zA-Z0-9 ]/g, '') + "-stt.wav";
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const uploadBlobResponse = await blockBlobClient.uploadData(bodyBuffer);
        context.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);

        const res = await speechToText(ttsApiKey, speechRegion, tempName, language, context);
        context.log(res);
        // const headers = {
        //     'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
        //     'Accept': 'application/json;text/xml',
        //     'Ocp-Apim-Subscription-Key': ttsApiKey,
        // }
        // const res = await axios.post(
        //     `https://${speechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${language}`,
        //     bodyBuffer, { headers: headers });

        context.res = {
            headers: { 'Content-Type': 'application/json' },
            body: res
        };
        context.done();

    } catch (ex) {
        context.log(ex);
        context.res.json({
            text: "error" + ex
        });
    }
}