import { address as server } from "../serverConfig";

async function getText(path) {
    const response = await fetch(`${server}/api/${path}`);
    return response.text();
}

async function getJson(path) {
    const response = await fetch(`${server}/api/${path}`);
    return response.json();
}

async function post(path, data) {
    const response = await fetch(`${server}/api/${path}`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-type": "application/json; charset=UTF-8" },
    });
    return response.text();
}

export { getText, getJson, post };
