const axios = require('axios');
// const { BlobServiceClient } = require("@azure/storage-blob");

// const storageAccountConnectionString = "STORAGEACCOUNTCONNECTIONSTRING";
const ttsregion = "TTSREGION";
const ttsapikey = "TTSAPIKEY";

// const blobServiceClient = BlobServiceClient.fromConnectionString(storageAccountConnectionString);
// // const containerClient = blobServiceClient.getContainerClient("$web");

module.exports = async function (context, req) {
    let body = req.body;

    const headers = {
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'riff-8khz-16bit-mono-pcm',
        'Ocp-Apim-Subscription-Key': ttsapikey,
    }
    const res = await axios.post(`https://${ttsregion}.tts.speech.microsoft.com/cognitiveservices/v1`, body, {
        headers: headers,
        responseType: "blob"
    });
    // context.log("res");
    context.log(res);
    context.log(res.headers);
    // context.log("res.data");
    // context.log(typeof res.data);
    // context.log(res.data.length);
    // const data = await res.data;


    // context.log(data);


    // const blobName = "newblob" + new Date().getTime() + ".wav";
    // const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    // const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
    // context.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);


    context.res = {
        headers: {
            "access-control-allow-origin": "*",
            "content-type": "audio/x-wav",
        },
        body: res.data
    };
    context.done();


}