const { expressjwt: expressJwt } = require('express-jwt');

function authJwt() {
    const secret = process.env.JWT_SECRET;
    const api = process.env.API_URL;

    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            { url: new RegExp(`${api}/products(.*)`), method: ['GET'] },
            { url: new RegExp(`${api}/categories(.*)`), method: ['GET'] },
            `${api}/users/login`,
            `${api}/users/register`,
        ]
    });
}

async function isRevoked(req, token) {
    // isRevoked is used only to check if a specific token is blacklisted.
    // Authorization logic (e.g. Admin access) is handled explicitly in route middlewares.
    return false;
}

module.exports = authJwt;