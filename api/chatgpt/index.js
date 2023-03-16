
const openaiurl = "https://eastus.api.cognitive.microsoft.com/openai/deployments/OPENAIDEMPOYMENT/completions?api-version=2022-12-01";
const openaipikey = "OPENAIPIKEY";

const axios = require('axios');


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
        context.res.json(res.data);

    } catch (ex) {
        context.log(ex);
        context.res.json({
            text: "error" + ex
        });
    }
}