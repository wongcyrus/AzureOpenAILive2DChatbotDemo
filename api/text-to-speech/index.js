const { BlobServiceClient } = require("@azure/storage-blob");
const { textToSpeech } = require('./textToSpeech');
const { getEmail, blockNonMember } = require("./checkMember");
const temp = require('temp');
const fs = require('fs');

const speechRegion = process.env.speechRegion;
const ttsApiKey = process.env.ttsApiKey;
const storageAccountConnectionString = process.env.chatStorageAccountConnectionString;

const blobServiceClient = BlobServiceClient.fromConnectionString(storageAccountConnectionString);
const containerClient = blobServiceClient.getContainerClient("voice");

module.exports = async function (context, req) {
    const email = getEmail(req);
    await blockNonMember(email, context);

    let body = req.body;
    context.log(body);
    const tempName = temp.path({ suffix: '.wav' });
    await textToSpeech(ttsApiKey, speechRegion, body, tempName);

    const blobName = email.replace(/[^a-zA-Z0-9 ]/g, '') + "-tts.wav";
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