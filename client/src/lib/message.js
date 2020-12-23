const banner = document.getElementById("message-banner");

function show(message, className) {
    banner.textContent = message;
    banner.className = "visible " + className;
    window.setTimeout(() => {
        banner.classList.remove("visible");
    }, 5000);
    window.setTimeout(() => {
        banner.classList.remove(className);
    }, 5250);
}

function showInfo(message) {
    return show(message, "info");
}

function showSuccess(message) {
    return show(message, "success");
}

function showError(message) {
    return show(message, "error");
}

export { showInfo, showSuccess, showError };