const { TableClient } = require("@azure/data-tables");
const { getEmail, isMember } = require("../checkMember");
const { setJson, setErrorJson } = require("../contextHelper");

const chatStorageAccountConnectionString = process.env.chatStorageAccountConnectionString;
const individualMessageTableClient = TableClient.fromConnectionString(chatStorageAccountConnectionString, "individualMessage");

module.exports = async function (context, req) {
    const email = getEmail(req);
    if (!await isMember(email, context)) {
        setErrorJson(context, "Unauthorized", 401);
        return;
    }
    const individualMessage = await individualMessageTableClient.getEntity(email, email);
    context.log(individualMessage);
    setJson(context, individualMessage);
}