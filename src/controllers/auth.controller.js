const assert = require('assert');
const dbconnection = require('../database/dbconnection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('../config/config').logger
const jwtSecretKey = require('../config/config').jwtSecretKey

let controller = {

    // UC-101 Login
    login: (req, res, next) => {
        const { emailAdress, password } = req.body;
        dbconnection.getConnection((err, connection) => {
            if (err) {
                logger.error('Error getting connection from dbconnection')
                res.status(500).json({
                    error: err.toString(),
                    datetime: new Date().toISOString(),
                })
            }
            if (connection) {
                // Check if user exists already
                const emailRegex = new RegExp(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/);
                if (emailAdress && password && typeof (password) === 'string' && emailRegex.test(emailAdress)) {
                    connection.query('SELECT id, firstName, lastName, emailAdress, password FROM user WHERE emailAdress = ?', emailAdress, function (error, results, fields) {
                        connection.release();
                        if (error) console.log(error);


                        if (results && results.length == 1) {
                            //user met email gevonden
                            //check of password klopt
                            const user = results[0];

                            bcrypt.compare(password, user.password, function (err, result) {
                                if (err) throw err;
                                if (result == true) {
                                    jwt.sign(
                                        { userid: user.id },
                                        process.env.JWT_SECRET,
                                        { expiresIn: '7d' },
                                        (err, token) => {
                                            if (err) console.log(err);

                                            if (token) {
                                                res.status(200).json({
                                                    status: 200,
                                                    result: token,
                                                })
                                            } else {
                                                res.status(503).json({
                                                    status: 503,
                                                    result: `No token made`,
                                                });
                                            }
                                        });
                                } else {
                                    res.status(400).json({
                                        status: 400,
                                        result: `Email and password not matching`,
                                    });
                                }
                            });
                        } else {
                            res.status(404).json({
                                status: 404,
                                result: `No user with email: ${emailAdress}`,
                            });
                        }
                    });
                } else {
                    res.status(400).json({
                        status: 400,
                        result: `Email and/or password not defined or not valid`,
                    });
                }
            }
        });
    },

    validateLogin(req, res, next) {
        // Verify that we receive the expected input
        try {
            assert(
                typeof req.body.emailAdress === 'string',
                'email must be a string.'
            )
            assert(
                typeof req.body.password === 'string',
                'password must be a string.'
            )
            next()
        } catch (ex) {
            res.status(422).json({
                error: ex.toString(),
                datetime: new Date().toISOString(),
            })
        }
    },

    validateToken(req, res, next) {
        logger.info('validateToken called')
        // logger.trace(req.headers)
        // The headers should contain the authorization-field with value 'Bearer [token]'
        const authHeader = req.headers.authorization
        if (!authHeader) {
            logger.warn('Authorization header missing!')
            res.status(401).json({
                error: 'Authorization header missing!',
                datetime: new Date().toISOString(),
            })
        } else {
            // Strip the word 'Bearer ' from the headervalue
            const token = authHeader.substring(7, authHeader.length)

            jwt.verify(token, jwtSecretKey, (err, payload) => {
                if (err) {
                    logger.warn('Not authorized')
                    res.status(401).json({
                        error: 'Not authorized',
                        datetime: new Date().toISOString(),
                    })
                }
                if (payload) {
                    logger.debug('token is valid', payload)
                    // User heeft toegang. Voeg UserId uit payload toe aan
                    // request, voor ieder volgend endpoint.
                    req.userId = payload.userId
                    next()
                }
            })
        }
    },
}
module.exports = controller