const prices = {
    'text-ada-001': { "completion": { tokens: 1000, price: 0.0004 }, "prompt": { tokens: 1000, price: 0.0004 } },
    'text-curie-001': { "completion": { tokens: 1000, price: 0.0004 }, "prompt": { tokens: 1000, price: 0.002 } },
    'text-davinci-002': { "completion": { tokens: 1000, price: 0.0004 }, "prompt": { tokens: 1000, price: 0.02 } },
    'code-davinci-002': { "completion": { tokens: 1000, price: 0.0004 }, "prompt": { tokens: 1000, price: 0.10 } },
    'text-davinci-003': { "completion": { tokens: 1000, price: 0.0004 }, "prompt": { tokens: 1000, price: 0.0004 } },
    'gpt-35-turbo': { "completion": { tokens: 1000, price: 0.0004 }, "prompt": { tokens: 1000, price: 0.002 } },
    'gpt-4-32k': { "completion": { tokens: 1000, price: 0.06 }, "prompt": { tokens: 1000, price: 0.12 } },
    'gpt-4': { "completion": { tokens: 1000, price: 0.03 }, "prompt": { tokens: 1000, price: 0.06 } },
}

const calculateCost = (model,completionTokens, promptTokens) => {
    const modelPrices = prices[model];
    const completionPrice = modelPrices.completion.price * completionTokens / modelPrices.completion.tokens;
    const promptPrice = modelPrices.prompt.price * promptTokens / modelPrices.prompt.tokens;
    return completionPrice + promptPrice;
}

module.exports = {
    calculateCost
};