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
                                        jwtSecretKey,
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

    validateToken: (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            //error
            const error = {
                status: 401,
                result: `No key found`
            }
            next(error);
        } else {
            const token = authHeader.substring(7, authHeader.length)

            jwt.verify(token, jwtSecretKey, (err, decoded) => {
                if (err) {
                    const error = {
                        status: 404,
                        result: `This key isn't linked to any users`
                    }
                    next(error);
                } else {
                    res.locals.userid = decoded.userid;
                    next();
                }
            });
        }

    },
}
module.exports = controller