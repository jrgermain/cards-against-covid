// Convert a click listener to a key listener. When enter is pressed, handle like a click.
function convertToKeyListener(clickListener) {
    return (event) => {
        if (event?.key === "Enter") {
            clickListener(event);
        }
    };
}

function parseErrorMessage(e) {
    if (e instanceof Error) {
        return e.message;
    }
    if (e instanceof Object) {
        return `Caught: ${JSON.stringify(e)}`;
    }
    return String(e);
}

export { convertToKeyListener, parseErrorMessage };
