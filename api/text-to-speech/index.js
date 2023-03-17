const axios = require('axios');
const { BlobServiceClient } = require("@azure/storage-blob");
const temp = require('temp');
const fs = require('fs');

const storageAccountConnectionString = "STORAGEACCOUNTCONNECTIONSTRING";
const ttsregion = "TTSREGION";
const ttsapikey = "TTSAPIKEY";

const blobServiceClient = BlobServiceClient.fromConnectionString(storageAccountConnectionString);
const containerClient = blobServiceClient.getContainerClient("$web");

const { textToSpeech } = require('./azure-cognitiveservices-speech');

module.exports = async function (context, req) {
    let body = req.body;

    const headers = {
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'riff-8khz-16bit-mono-pcm',
        'Ocp-Apim-Subscription-Key': ttsapikey,
    }


    var tempName = temp.path({ suffix: '.wav' });
    await textToSpeech(ttsapikey, ttsregion, body, tempName);
   

    context.res = {
        status: 200,
        headers: {
            "Content-Disposition": `attachment; filename=${blobName}`,
            "access-control-allow-origin": "*",
            "content-type": "audio/x-wav",
        },
        body: fs.readFileSync(tempName)
    };

    context.done();


}