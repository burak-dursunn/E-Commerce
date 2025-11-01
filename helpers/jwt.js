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
            {url: new RegExp(`${api}/products(.*)`), method: ['GET']},
            {url: new RegExp(`${api}/categories(.*)`), method: ['GET']},
            `${api}/users/login`,
            `${api}/users/register`,
        ]
    });
}
async function isRevoked(req, token) {

    if(!token) return true;

    const isAdmin = token.payload.isAdmin;
    console.log(token.payload);
    if(!isAdmin) {
        return true; //? Deny access if not admin
    }
    return false; //? if the user who just logged in is admin then allow access
}

module.exports = authJwt;