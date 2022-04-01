import { Html5Entities } from "html-entities";

const callForPriceText = "Call for price";

const getPrice = (config, price_type, price) => {
    const symbol = getCurrencySymbol(config);

    if (price_type === "on_call") return callForPriceText;
    let result = "";
    if (config.position === "left") {
        result = symbol + price;
    } else if (config.position === "left_space") {
        result = symbol + " " + price;
    } else if (config.position === "right") {
        result = price + symbol;
    } else {
        result = price + " " + symbol;
    }
    return result;
};

const getCurrencySymbol = (config) => {
    const entities = new Html5Entities();
    return entities.decode(config.symbol);
};

const decodeString = (string) => {
    const entities = new Html5Entities();
    return entities.decode(string);
};

export { decodeString, getCurrencySymbol, getPrice };