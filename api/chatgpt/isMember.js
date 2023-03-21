const { TableClient } = require("@azure/data-tables");

const chatStorageAccountConnectionString = process.env.chatStorageAccountConnectionString;
const usersTableClient = TableClient.fromConnectionString(chatStorageAccountConnectionString, "users");

const isMember = async (email, context) => {
    try {
        const user = await usersTableClient.getEntity(email, email);
        context.log(user);
        return user.partitionKey ? true : false;
    } catch (__) {
        return false;
    }
}
module.exports = {
    isMember
};