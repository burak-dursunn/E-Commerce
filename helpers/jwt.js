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

    // if(!token) return true; // Optionally check token existence

    // Only revoke if specific conditions are met (e.g. blacklisted). 
    // Do NOT block non-admins globally here unless the entire API is admin-only.
    // Assuming we want to allow normal users:
    return false;

}

module.exports = authJwt;