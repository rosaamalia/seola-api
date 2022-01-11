var BlacklistModel = require('../models/blacklistModel.js');
const jwt = require('jsonwebtoken');
const blacklistModel = require('../models/blacklistModel.js');
require('dotenv').config()

/**
 * @description :: Middleware for managing authentication
 */

/**
 * Authenticate JWT Token
 */
const authenticateJWT = async (req, res, next) => {
    try {
        // mengambil request client dengan authorizationnya (token)
        const authHeader = req.headers.authorization;
    
        if (authHeader) {
            const token = authHeader.split(' ')[1];
    
            // mengecek apakah token sudah pernah digunakan atau belum
            const cekBlacklist = await blacklistModel.findOne({ token: token })

            if(cekBlacklist)
            {
                return res.status(401).send({
                    status: 401,
                    message: "Token sudah tidak dapat digunakan. Silahkan melakukan login kembali"
                })
            }
    
            // verifikasi token
            jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
                if (err) {
                    return res.status(403).send({
                        status: 403,
                        message: "Token tidak valid"
                    })
                }
                
                // decode payload untuk mengambil user id
                const payload = jwt.decode(token, { complete: true })
                req.user_id = payload.payload.userToken.id
                
                next();
            });
        } else {
            res.status(401).send({
                status: 401,
                message: "Masukkan token untuk mengakses"
            });
        }
    } catch(err) {
        console.log(err)
        res.status(422).send({
            status: 422,
            message: err
        })
    }
};

module.exports = { authenticateJWT };