const cookieOption = {
    maxAge: 24 * 60 * 60 * 1000,
    // httpOnly: true,
    // sameSite: "none",
    // secure: true,
    // path: "/"
}

const sendResponse = (res, status, message, success, data, cookie) => {
    if (!cookie) {
        return res
            .status(status)
            .json({
                success,
                message,
                data
            })
    }
    else {
        return res
            .status(status)
            .cookie("userToken", cookie, cookieOption)
            .json({
                success,
                message,
                data
            })
    }
}

export {
    sendResponse
}