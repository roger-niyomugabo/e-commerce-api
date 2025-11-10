export default (res, status, message, data, error) => {
    const success = status >= 200 && status < 300;
    res.status(status).json(
        error ? { success, status, message, error } : { success, status, message, data }
    );
};
