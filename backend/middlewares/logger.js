export async function logger(req, res, next) {
    console.log(req.url, req.method)
    next();
}