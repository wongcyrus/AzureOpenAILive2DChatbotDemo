const axios = require('axios');
const { BlobServiceClient } = require("@azure/storage-blob");

const storageAccountConnectionString = "STORAGEACCOUNTCONNECTIONSTRING";
const ttsregion = "TTSREGION";
const ttsapikey = "TTSAPIKEY";

const blobServiceClient = BlobServiceClient.fromConnectionString(storageAccountConnectionString);
const containerClient = blobServiceClient.getContainerClient("voice");

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


        context.log("after data");

       
        const blobName = "newblob" + new Date().getTime();
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
        console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);

        // context.log(res.data)
        // context.res = {
        //     status: 200, 
        //     headers: { 'content-type': 'audio/x-wav' },
        //     isRaw: true,
        //     body: res.data
        // };
        
        context.res.json({
            text: blobName
        });
    
        // context.done();

    } catch (ex) {
        context.log(ex);
        context.res.json({
            text: "error" + ex
        });
    }
}