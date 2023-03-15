
const openaiurl = "https://OPENAIDEMPOYMENT.openai.azure.com/openai/deployments/gpt-35-tubo/completions?api-version=2022-12-01";
const openaipikey = "OPENAIPIKEY";

const axios = require('axios');


module.exports = async function (context, req) {
    context.log("Chat");

    const body = req.body;
    context.log(body);
    console.log("stringify");
    context.log(JSON.stringify(body));

    // const header = req.headers['x-ms-client-principal'];
    // const encoded = Buffer.from(header, 'base64');
    // const decoded = encoded.toString('ascii');

    try {

        const headers = {
            'Content-Type': 'application/json',
            'api-key': openaipikey,
        }

        const result = await axios.post(openaiurl, data, {
            headers: headers
        });
        //     .then((response) => {
        //         console.log(response.data);
        //         context.res.json(response.data);
        //     })
        //     .catch((error) => {
        //         console.log(error);
        //         context.res.json(error);
        //     });
        console.log("result");
        console.log(result);
        context.res.json("ok");

    } catch (ex) {
        console.error(ex);
        context.res.json(ex);
    }
}