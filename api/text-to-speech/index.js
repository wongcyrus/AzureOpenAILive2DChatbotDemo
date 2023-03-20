const { BlobServiceClient } = require("@azure/storage-blob");
const temp = require('temp');
const fs = require('fs');
const { textToSpeech } = require('./textToSpeech');

const speechRegion = process.env.ttsregion;
const ttsapikey = process.env.ttsapikey;
const storageAccountConnectionString = process.env.chatStorageAccountConnectionString;

const blobServiceClient = BlobServiceClient.fromConnectionString(storageAccountConnectionString);
const containerClient = blobServiceClient.getContainerClient("$web");


const getEmail = (req) => {
    const header = req.headers['x-ms-client-principal'];
    const encoded = Buffer.from(header, 'base64');
    const decoded = encoded.toString('ascii');
    const clientPrincipal = JSON.parse(decoded);
    return clientPrincipal.userDetails;
}

module.exports = async function (context, req) {
    let body = req.body;
    context.log(body);

    const tempName = temp.path({ suffix: '.wav' });
    await textToSpeech(ttsapikey, speechRegion, body, tempName);

    const email = getEmail(req);
    const blobName = email.replace(/[^a-zA-Z0-9 ]/g, '') + ".wav";
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const uploadBlobResponse = await blockBlobClient.uploadFile(tempName);
    context.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);

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