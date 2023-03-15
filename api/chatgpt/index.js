
const openaiurl = "https://OPENAIDEMPOYMENT.openai.azure.com/openai/deployments/gpt-35-tubo/completions?api-version=2022-12-01";
const openaipikey = "OPENAIPIKEY";

import fetch from 'node-fetch';


export default async function (context, req) {

        // context.res.json({
    //     text: "Hello from the API"
    // });

    // const name = (req.query.name || (req.body && req.body.name));
    // const responseMessage = name
    //     ? "Hello, " + name + ". This HTTP triggered function executed successfully."
    //     : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    // context.res = {
    //     // status: 200, /* Defaults to 200 */
    //     body: responseMessage
    // };

    // context.res.json({
    //     text: "Hello from the API"
    // });
    context.log("Chat");

    const body = req.body;
    context.log(body);
    // const m = JSON.parse(req.body);
    // context.log(m);

    console.log("stringify");
    context.log(JSON.stringify(body));

    // const header = req.headers['x-ms-client-principal'];
    // const encoded = Buffer.from(header, 'base64');
    // const decoded = encoded.toString('ascii');

    try {
        
        console.log("fetch");
        const repsonse = await fetch(openaiurl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': openaipikey,
            },
            body: JSON.stringify(body)
        });
        console.log("after fetch");


        const json = await repsonse.json();
        context.log(json);
        context.res.json(json);
    } catch (ex) {
        context.console.error(ex);
    }



    // context.res = {
    //     body: {
    //         clientPrincipal: JSON.parse(decoded),
    //     },
    // };
}