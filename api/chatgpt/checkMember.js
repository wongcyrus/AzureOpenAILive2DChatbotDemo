const { TableClient } = require("@azure/data-tables");

const chatStorageAccountConnectionString = process.env.chatStorageAccountConnectionString;
const usersTableClient = TableClient.fromConnectionString(chatStorageAccountConnectionString, "users");
const chatHistoryTableClient = TableClient.fromConnectionString(chatStorageAccountConnectionString, "chatHistory");

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

const isOverLimit = async (email) => {
    const user = await usersTableClient.getEntity(email, email);  
    limit = user.Limit ?? 50000;
    let continuationToken = null;
    let pageEntities = undefined;
    let entities = [];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    do {
        const page = await chatHistoryTableClient.listEntities({
            queryOptions: {
                filter: `PartitionKey eq '${email}' and Timestamp ge datetime'${yesterday.toISOString()}'`
            }
        }).byPage({ maxPageSize: 100, continuationToken: continuationToken }).next();
        pageEntities = page.value;
        continuationToken = pageEntities.continuationToken;
        entities = entities.concat(pageEntities);
    }
    while (continuationToken !== undefined);
    const tokenUsage = entities.reduce((acc, cur) => {
        acc += cur.TotalTokens;
        return acc;
    }, 0);    
    return tokenUsage > limit;
};

module.exports = {
    getEmail,
    blockNonMember,
    isOverLimit
};