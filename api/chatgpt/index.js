const axios = require('axios');
const { TableClient } = require("@azure/data-tables");

const openaiurl = `https://eastus.api.cognitive.microsoft.com/openai/deployments/${process.env.openAiCognitiveDeploymentName}/completions?api-version=2022-12-01`;
const openaipikey = process.env.openAiCognitiveAccount;
const chatStorageAccountConnectionString = process.env.chatStorageAccountConnectionString;

const chatHistoryTableClient = TableClient.fromConnectionString(chatStorageAccountConnectionString, "chatHistory");

const getEmail = (req) => {
    const header = req.headers['x-ms-client-principal'];
    const encoded = Buffer.from(header, 'base64');
    const decoded = encoded.toString('ascii');
    const clientPrincipal = JSON.parse(decoded);
    return clientPrincipal.userDetails;
}

module.exports = async function (context, req) {
    context.log("Chat");
    const body = req.body;
    context.log(body);

    try {
        const headers = {
            'Content-Type': 'application/json',
            'api-key': openaipikey,
        }
        const res = await axios.post(openaiurl, JSON.stringify(body), {
            headers: headers
        });
        context.log(res.data);

        const now = new Date();
        var ticks = ((now.getTime() * 10000) + 621355968000000000);
        const chatEntity = {
            partitionKey: getEmail(res),
            rowKey: ticks,
            student: body.prompt,
            chatbot: res.data.choices[0].text,
            tokens: res.data.usage.total_tokens,
            time: now.toUTCString()
        };
        context.log(chatEntity);
        await chatHistoryTableClient.createEntity(chatEntity);

        context.res.json(res.data);

    } catch (ex) {
        context.log(ex);
        context.res.json({
            text: "error" + ex
        });
    }
}