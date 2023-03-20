const sdk = require('microsoft-cognitiveservices-speech-sdk');
const fs = require('fs');
const axios = require('axios');

const speechToText = async (key, speechRegion, filename, language) => {
    const headers = {
        headers: {
            'Ocp-Apim-Subscription-Key': key,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    const tokenResponse = await axios.post(`https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, null, headers);

    const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(tokenResponse.data, speechRegion);
    speechConfig.speechRecognitionLanguage = language;
    const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(filename));
    const speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    return new Promise((resolve, reject) => {
        speechRecognizer.recognizeOnceAsync(result => {
            switch (result.reason) {
                case sdk.ResultReason.RecognizedSpeech:
                    console.log(`RECOGNIZED: Text=${result.text}`);
                    resolve(result);
                    break;
                case sdk.ResultReason.NoMatch:
                    console.log("NOMATCH: Speech could not be recognized.");
                    reject("NOMATCH: Speech could not be recognized.");
                    break;
                case sdk.ResultReason.Canceled:
                    const cancellation = sdk.CancellationDetails.fromResult(result);
                    console.log(`CANCELED: Reason=${cancellation.reason}`);

                    if (cancellation.reason == sdk.CancellationReason.Error) {
                        console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
                        console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
                        console.log("CANCELED: Did you set the speech resource key and region values?");
                    }
                    reject(cancellation);
                    break;
            }
            speechRecognizer.close();
        });
    });
}
module.exports = {
    speechToText
};