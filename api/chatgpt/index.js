
const openaiurl = "https://OPENAIDEMPOYMENT.openai.azure.com/openai/deployments/gpt-35-tubo/completions?api-version=2022-12-01";
const openaipikey = "OPENAIPIKEY";
import { got } from 'got';


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

        console.log("fetch");
        // const repsonse = await fetch(openaiurl, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'api-key': openaipikey,
        //     },
        //     body: JSON.stringify(body)
        // });
        // console.log("after fetch");

        const { data } = await got.post(openaiurl, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': openaipikey,
            },
            json: body
        }).json();

        context.res.json(data);


        // const json = await repsonse.json();
        // context.log(json);
        // context.res.json(json);
    } catch (ex) {
        context.console.error(ex);
    }



    // context.res = {
    //     body: {
    //         clientPrincipal: JSON.parse(decoded),
    //     },
    // };
}