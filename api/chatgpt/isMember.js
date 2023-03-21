const { TableClient } = require("@azure/data-tables");

const chatStorageAccountConnectionString = process.env.chatStorageAccountConnectionString;
const usersTableClient = TableClient.fromConnectionString(chatStorageAccountConnectionString, "users");

const isMember = async (email) => {
    try {
        const user = await usersTableClient.getEntity(email, email);
        return user.partitionKey ? true : false;
    } catch (__) {
        return false;
    }
}
module.exports = {
    isMember
};