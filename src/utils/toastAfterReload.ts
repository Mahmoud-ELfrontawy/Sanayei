export const setToastAfterReload = (
    message: string,
    type: "success" | "error" | "info" = "success"
) => {
    localStorage.setItem(
        "after_reload_toast",
        JSON.stringify({ message, type })
    );
};
