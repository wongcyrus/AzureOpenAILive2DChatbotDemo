const { BlobServiceClient } = require("@azure/storage-blob");
const temp = require('temp');
const fs = require('fs');
const { textToSpeech } = require('./azure-cognitiveservices-speech');

const ttsregion = "TTSREGION";
const ttsapikey = "TTSAPIKEY";

const storageAccountConnectionString = "STORAGEACCOUNTCONNECTIONSTRING";

const blobServiceClient = BlobServiceClient.fromConnectionString(storageAccountConnectionString);
const containerClient = blobServiceClient.getContainerClient("$web");


module.exports = async function (context, req) {
    let body = req.body;

    context.log(body);

    const blobName = "newblob" + new Date().getTime() + ".wav";
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);


    const tempName = temp.path({suffix: '.wav'}); 
    await textToSpeech(ttsapikey, ttsregion, body, tempName);
    
    await blockBlobClient.uploadFile(tempName);    
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