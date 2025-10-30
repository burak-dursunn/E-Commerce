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
async function isRevoked(req, payload) {
        if(!payload.isAdmin)
            return true;

        return false
}

module.exports = authJwt;