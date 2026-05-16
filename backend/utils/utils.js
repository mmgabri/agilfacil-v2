const convertArrayToCamelCase = (arr) => {
    return arr.map((item) => convertObjectKeysToCamelCase(item));
};

const convertToCamelCase = (str) => {
    return str.replace(/_([a-z])/g, (match, group1) => group1.toUpperCase());
};

const convertObjectKeysToCamelCase = (obj) => {
    const newObj = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const newKey = convertToCamelCase(key);
            newObj[newKey] = obj[key];
        }
    }
    console.log(newObj)
    return newObj;
};

module.exports = {  };