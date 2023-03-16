
const openaiurl = "https://eastus.api.cognitive.microsoft.com/openai/deployments/gpt-35-tubo/completions?api-version=2022-12-01";
const openaipikey = "OPENAIPIKEY";

const axios = require('axios');


module.exports = async function (context, req) {
    context.log("Chat");

    const body = req.body;
    context.log(body);

    // const header = req.headers['x-ms-client-principal'];
    // const encoded = Buffer.from(header, 'base64');
    // const decoded = encoded.toString('ascii');

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