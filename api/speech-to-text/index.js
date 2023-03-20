const { BlobServiceClient } = require("@azure/storage-blob");
const temp = require('temp');
const fs = require('fs');
const multipart = require("parse-multipart");

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
    let body = req.body;

    try {

        const bodyBuffer = Buffer.from(req.body);        
        const boundary = multipart.getBoundary(req.headers['content-type']);       
        const parts = multipart.Parse(bodyBuffer, boundary);

        const email = getEmail(req);
        const blobName = email.replace(/[^a-zA-Z0-9 ]/g, '') + ".wav";
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const uploadBlobResponse = await blockBlobClient.uploadData(parts[0]);
        context.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);

        const headers = {
            'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
            'Accept': 'application/json;text/xml',
            'Ocp-Apim-Subscription-Key': ttsApiKey,
        }
        const res = await axios.post(
            `https://${speechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${language}`,
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