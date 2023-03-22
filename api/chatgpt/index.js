const axios = require('axios');
const { TableClient } = require("@azure/data-tables");
const { getEmail, blockNonMember, isOverLimit } = require("./checkMember");

const openaiurl = `https://eastus.api.cognitive.microsoft.com/openai/deployments/${process.env.openAiCognitiveDeploymentName}/completions?api-version=2022-12-01`;
const openaipikey = process.env.openAiCognitiveAccount;
const chatStorageAccountConnectionString = process.env.chatStorageAccountConnectionString;

const chatHistoryTableClient = TableClient.fromConnectionString(chatStorageAccountConnectionString, "chatHistory");

module.exports = async function (context, req) {
    const email = getEmail(req);
    await blockNonMember(email, context);

    if (await isOverLimit(email)) {
        context.res.json({           
            "choices": [
                {
                    "text": "Used up your daily limit. Please try again tomorrow.",
                }
            ]
        });
    }

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

        const s = body.prompt.split(`<|im_end|>`);
        const quertion = s[s.length - 2].replace("\n<|im_start|>User\n", "");

        const now = new Date();
        const ticks = "" + now.getTime();

        const chatEntity = {
            PartitionKey: email,
            RowKey: ticks,
            Email: email,
            Student: quertion,
            Chatbot: res.data.choices[0].text,
            CompletionTokens: res.data.usage.completion_tokens,
            PromptTokens: res.data.usage.prompt_tokens,
            TotalTokens: res.data.usage.total_tokens,
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