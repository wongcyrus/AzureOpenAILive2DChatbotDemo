
const openaiurl = "https://OPENAIDEMPOYMENT.openai.azure.com/openai/deployments/gpt-35-tubo/completions?api-version=2022-12-01";
const openaipikey = "OPENAIPIKEY";


module.exports = async function (context, req) {  

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

    const m = JSON.parse(req.body);
    context.log(m);
    const header = req.headers['x-ms-client-principal'];
    const encoded = Buffer.from(header, 'base64');
    const decoded = encoded.toString('ascii');

    const repsonse = await fetch(openaiurl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': openaipikey,
        },
        body: JSON.stringify(m)
    });
    const json = await repsonse.json();
    context.log(json);
    context.res.json(json);


    // context.res = {
    //     body: {
    //         clientPrincipal: JSON.parse(decoded),
    //     },
    // };
}