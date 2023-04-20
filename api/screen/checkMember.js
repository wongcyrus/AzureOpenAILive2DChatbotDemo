const { TableClient } = require("@azure/data-tables");

const chatStorageAccountConnectionString = process.env.chatStorageAccountConnectionString;
const usersTableClient = TableClient.fromConnectionString(chatStorageAccountConnectionString, "users");
const sessionsTableClient = TableClient.fromConnectionString(chatStorageAccountConnectionString, "sessions");

const getEmail = (req) => {
    const header = req.headers['x-ms-client-principal'];
    const encoded = Buffer.from(header, 'base64');
    const decoded = encoded.toString('ascii');
    const clientPrincipal = JSON.parse(decoded);
    return clientPrincipal.userDetails;
}
const blockNonMember = async (email, context) => {
    try {
        const user = await usersTableClient.getEntity(email, email);
        context.log(user);
        return user.partitionKey ? true : false;
    } catch (__) {
        context.res = {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
            body: "Unauthorized"
        };
        context.done();
    }
}
async function blockInvalidSession(email, context) {
    let continuationToken = null;
    let pageEntities = undefined;
    let entities = [];
    const miniStartTime = new Date();
    miniStartTime.setHours(miniStartTime.getHours() - 3);
    do {
        const page = await sessionsTableClient.listEntities({
            queryOptions: {
                filter: `PartitionKey eq '${email}' and Timestamp ge datetime'${miniStartTime.toISOString()}'`
            }
        }).byPage({ maxPageSize: 100, continuationToken: continuationToken }).next();
        pageEntities = page.value;
        continuationToken = pageEntities.continuationToken;
        entities = entities.concat(pageEntities);
    }
    while (continuationToken !== undefined);

    if (entities.length === 0) {
        context.res = {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
            body: "Screen Sharing Session Expired!"
        };
        context.done();
    }
}

module.exports = {
    getEmail,
    blockNonMember,
    blockInvalidSession
};