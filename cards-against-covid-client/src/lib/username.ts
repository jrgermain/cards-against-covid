/**
 * Cache the last-used username to use as the default when joining a new game 
 */
const saveUsername = (username: string): void => {
    try {
        sessionStorage.setItem("last-username", username);
        localStorage.setItem("last-username", username);    
    } catch (e) {
        // Not allowed
    }
};

/**
 * Retrieve the last used username -- prefers sessionStorage (specific to the current tab) but falls
 * back to localStorage if no name was saved in the current session. Returns undefined if no names
 * are saved, or if access to storage is forbidden.
 *
 * @returns the saved name, or undefined
 */
const loadUsername = (): string | undefined => {
    return sessionStorage.getItem("last-username")
        || localStorage.getItem("last-username")
        || undefined;
};

export {
    saveUsername,
    loadUsername,
};
