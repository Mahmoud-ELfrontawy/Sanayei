interface FormatArabicDateOptions {
    withTime?: boolean;
    replaceCommaWithDash?: boolean;
}

export const formatArabicDate = (
    date: string,
    time?: string,
    options?: FormatArabicDateOptions
) => {
    const dateTime = time
        ? new Date(`${date}T${time}`)
        : new Date(date);

    let formattedDate = new Intl.DateTimeFormat("ar-EG", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(dateTime);

    if (options?.replaceCommaWithDash) {
        formattedDate = formattedDate.replace("،", " -");
    }

    if (options?.withTime && time) {
        const formattedTime = new Intl.DateTimeFormat("ar-EG", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(dateTime);

        return `${formattedDate} ، الساعة ${formattedTime}`;
    }

    return formattedDate;
};

