const { TableClient } = require("@azure/data-tables");
const { BlobServiceClient, BlobSASPermissions, SASProtocol } = require("@azure/storage-blob");
const { getEmail, blockNonTeacherMember } = require("./checkMember");

const storageAccountConnectionString = process.env.chatStorageAccountConnectionString;

const blobServiceClient = BlobServiceClient.fromConnectionString(storageAccountConnectionString);
const containerClient = blobServiceClient.getContainerClient("screen");


const chatStorageAccountConnectionString = process.env.chatStorageAccountConnectionString;

const classesTableClient = TableClient.fromConnectionString(chatStorageAccountConnectionString, "classes");
// const screensTableClient = TableClient.fromConnectionString(chatStorageAccountConnectionString, "screen");


module.exports = async function (context, req) {

    const email = getEmail(req);
    await blockNonTeacherMember(email, context);

    const teacherEmail = getEmail(req);
    await blockNonTeacherMember(teacherEmail, context);

    const classId = req.query.classId;

    let continuationToken = null;
    let pageEntities = undefined;
    let entities = [];
    do {
        const page = await classesTableClient.listEntities({
            queryOptions: {
                filter: `PartitionKey eq '${classId}'`
            }
        }).byPage({ maxPageSize: 100, continuationToken: continuationToken }).next();
        pageEntities = page.value;
        continuationToken = pageEntities.continuationToken;
        entities = entities.concat(pageEntities);
    }
    while (continuationToken !== undefined);

    const screens = await Promise.all(entities.map(async entity => {
        const studentEmail = entity.rowKey;
        context.log(studentEmail);
        const blobName = studentEmail.replace(/[^a-zA-Z0-9 ]/g, '_') + ".jpeg";
        const blobClient = containerClient.getBlobClient(blobName);
        const sasUrl = await blobClient.generateSasUrl({
            protocol: SASProtocol.Https,
            permissions: BlobSASPermissions.parse("r"),
            startsOn: new Date(),
            expiresOn: new Date(new Date().valueOf() + (1 * 60 * 1000))
        });
        context.log(sasUrl);
        return { email: studentEmail, sasUrl, name: entity.Name};
    }));

    context.res.json(screens);
}