
const openaiurl = "https://OPENAIDEMPOYMENT.openai.azure.com/openai/deployments/gpt-35-tubo/completions?api-version=2022-12-01";
const openaipikey = "OPENAIPIKEY";

const axios = require('axios');


module.exports = async function (context, req) {
    context.log("Chat");

    const body = req.body;
    context.log(body);
    context.log(JSON.stringify(body));

    // const header = req.headers['x-ms-client-principal'];
    // const encoded = Buffer.from(header, 'base64');
    // const decoded = encoded.toString('ascii');

    try {

        const headers = {
            'Content-Type': 'application/json',
            'api-key': openaipikey,
        }

        const result = await axios.post(openaiurl, body, {
            headers: headers
        });

        context.log("result");
        context.log(result);
        context.res.json({
            text: "ok"
        });

    } catch (ex) {
        context.log(ex);
        context.res.json({
            text: "error" + ex
        });
    }
}