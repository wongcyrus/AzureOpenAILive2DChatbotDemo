const screenSharingPerMinute = 12;
const screenSharingMaxSize = 0.5;
const screenSharingMaxDuration = 3;
const dailyCostLimit = 0.5;

const prices = {
    'gpt-35-turbo': { "completion": { tokens: 1000, price: 0.0015 }, "prompt": { tokens: 1000, price: 0.002 } },
    'gpt-35-turbo-16k': { "completion": { tokens: 1000, price: 0.004 }, "prompt": { tokens: 1000, price: 0.003 } },
    'gpt-4-32k': { "completion": { tokens: 1000, price: 0.12 }, "prompt": { tokens: 1000, price: 0.06 } },
    'gpt-4': { "completion": { tokens: 1000, price: 0.06 }, "prompt": { tokens: 1000, price: 0.03 } },
}


module.exports = {
    screenSharingPerMinute,
    screenSharingMaxSize,
    screenSharingMaxDuration,
    dailyCostLimit,
    prices
}
