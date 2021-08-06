/* A collection of utility functions that work aroung bugs or shortcomings in reactjs-popup
 * These are a temporary fix until I find a different library to replace it
 */

const closePopup = () => {
    // Close the window by simulating esc key
    document.dispatchEvent(new KeyboardEvent("keyup", { key: "Escape" }));
};

const handlePopupOpen = (ariaLabel) => {
    const popup = document.querySelector(".popup-content");
    if (popup) {
        popup.setAttribute("role", "dialog");
        popup.setAttribute("aria-label", ariaLabel);
    }

    /* Force the popup to reposition itself (workaround for the popup's initial position being
     * too far right)
     */
    window.setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
    }, 100);
};

export { closePopup, handlePopupOpen };
