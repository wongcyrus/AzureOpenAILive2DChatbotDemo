const { BlobServiceClient } = require("@azure/storage-blob");
const { getEmail, blockNonMember, blockInvalidSession } = require("./checkMember");

const storageAccountConnectionString = process.env.chatStorageAccountConnectionString;

const blobServiceClient = BlobServiceClient.fromConnectionString(storageAccountConnectionString);
const containerClient = blobServiceClient.getContainerClient("screen");

function getDateTimeStringAsFilename() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();
    return `${year}-${month}-${day}-${hour}-${minute}-${second}`;
}

module.exports = async function (context, req) {
    const email = getEmail(req);
    await blockNonMember(email, context);
    await blockInvalidSession(email, context);

    try {
        const regex = /^data:.+\/(.+);base64,(.*)$/;
        const matches = req.body.match(regex);
        const ext = matches[1];
        const data = matches[2];
        const bodyBuffer = new Uint8Array(Buffer.from(data, 'base64'));

        const blobName = email.replace(/[^a-zA-Z0-9 ]/g, '_') + "." + ext;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const uploadBlobResponse = await blockBlobClient.uploadData(bodyBuffer);
        context.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);

        const timeBlobName = email + "/" + getDateTimeStringAsFilename() + "." + ext;
        const destinationBlobClient = await containerClient.getBlobClient(timeBlobName);
        await destinationBlobClient.beginCopyFromURL(blockBlobClient.url);

        context.res = {
            headers: { 'Content-Type': 'application/json' },
            body: { DisplayText: blobName, timeBlobName }
        };
        context.done();

    } catch (ex) {
        context.log(ex);
        context.res.json({
            text: "error" + ex
        });
    }
}