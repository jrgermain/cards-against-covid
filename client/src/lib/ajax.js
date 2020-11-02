// Simple Ajax v1.0 by Joey Germain (jrgermain)
// Licensed under the MIT license

/**
 * Make an asynchronous request
 * 
 * @param {Object} params                 An object containing the parameters to the request (at a minimum, a method and a url)
 * @param {string} params.method          The method of the request (e.g. "GET" or "POST")
 * @param {string} params.url             The url of the request
 * @param {boolean} params.cache          Whether to allow caching (defaults to true) 
 * @param {Object} params.requestHeaders  An object where the keys are header names and the values are the corresponding values (e.g. {"content-type": "application/json"})
 * @param {*} params.requestBody          The body of the request
 * @param {string} params.requestType     The format of the request body
 * @param {string} params.responseType    The expected format of the response
 * @callback params.onComplete            Called when the request state changes to completed
 * @callback params.onSuccess             Called when the request state changes to completed and the status is a 200-level code
 * @callback params.onError               Called when the request state changes to completed and the status is NOT a 200-level code
 * 
 * @returns {Promise<XMLHttpRequest>} A promise that resolves if the request is successful and rejects if it is not
 */
function request({ method, url, cache, requestHeaders, requestBody, requestType, responseType, onComplete, onSuccess, onError }) {
    if (method == null || url ==null) {
        throw "Ajax: missing required parameter(s)";
    }

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);

        // Set request header(s) if present
        for (const header in requestHeaders) {
            xhr.setRequestHeader(header, requestHeaders[header]);
        }

        // Disable caching if the user asked us to
        if (cache === false) {
            xhr.setRequestHeader("Cache-Control", "no-store");
        }

        if (requestType in requestTypes) {
            xhr.setRequestHeader("content-type", requestTypes[requestType]);
        }

        // Set response type
        if (responseTypes.includes(responseType)) {
            xhr.responseType = responseType;
        } else if (responseType) {
            console.warn("Ajax: Invalid expected response type:", responseType, "\nResponse will be treated as plain text");
        }


        xhr.send(requestBody);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                // Fire the onComplete callback when the request completes
                if (typeof onComplete === "function") {
                    onComplete(xhr.response, xhr.status);
                }

                // Then, fire the onSuccess/onError callbacks AND resolve/reject the promise
                if (xhr.status >= 200 && xhr.status < 300) {
                    // A request succeeded if it has a status code between 200 and 299, inclusive
                    resolve(xhr.response);
                    if (typeof onSuccess === "function") {
                        onSuccess(xhr.response, xhr.status);
                    }
                } else {
                    reject(xhr.response);
                    if (typeof onError === "function") {
                        onError(xhr.response, xhr.status);
                    }
                }
            }
        };
    });
}

const readRequests = [
    "get",
    "head"
]
const writeRequests = [
    "post",
    "put",
    "delete",
    "patch"
]

const responseTypes = [
    "arraybuffer",
    "blob",
    "document",
    "json",
    "text"
]
const requestTypes = {
    "json": "application/json",
    "form": "application/x-www-form-urlencoded",
    "xml": "application/xml"
}
const readRequest = new RegExp(`^(${readRequests.join("|")})(${responseTypes.join("|")})?$`, "i");
const writeRequest = new RegExp(`^(${writeRequests.join("|")})(${Object.keys(requestTypes).join("|")})?$`, "i");


const Ajax = new Proxy({ request }, {
    get: function (target, prop, receiver) {
        if (prop in target) {
            return Reflect.get(target, prop, receiver);
        }

        // Generate an ajax function
        const [_, method, type] = prop.match(readRequest) || prop.match(writeRequest) || [];
        const params = { method };

        if (readRequests.includes(method)) {
            if (type) {
                params.responseType = type.toLowerCase();
            }
            return function (url, options) {
                return Ajax.request(Object.assign({ url }, options, params));
            }
        }
        if (writeRequests.includes(method)) {
            if (type) {
                params.requestType = type.toLowerCase();
            }
            return function (url, requestBody, options) {
                return Ajax.request(Object.assign({ url, requestBody }, options, params));
            }
        }
    }
});

export default Ajax