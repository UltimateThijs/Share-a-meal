const assert = require('assert');
const dbconnection = require('../database/dbconnection')
const logger = require('../config/config').logger;

let controller = {

    validateUser: (req, res, next) => {
        let { emailAdress, password, firstName, lastName, city, street } = req.body;

        try {
            assert.equal(typeof emailAdress === 'string', 'emailAdress must be a string')
            assert.equal(typeof firstName === 'string', 'firstName must be a string')
            assert.equal(typeof lastName === 'string', 'lastName must be a string')
            assert.equal(typeof password === 'string', 'password must be a string')
            assert.equal(typeof street === 'string', 'street must be a string')
            assert.equal(typeof city === 'string', 'city must be a string')

            next()

        } catch (err) {
            logger.debug(`Error message: ${err.message}`)
            logger.debug(`Error code: ${err.code}`)

            res.status(400).json({
                status: 400,
                message: err.message
            })
        }
    },

    validateUpdatedUser: (req, res, next) => {
        let user = req.body;
        let { emailAdress, password, firstName, lastName, street, city, isActive, phoneNumber } = user;

        try {
            assert(typeof emailAdress === 'string', 'emailAddress must be a string')
        } catch (error) {
            const err = {
                status: 400,
                message: error.message
            }
            next(err)
        }

        next();
    },

    // UC-201 Register as a new user
    addUser: (req, res, next) => {
        let user = req.body

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query('INSERT INTO user (firstName, lastName, street, city, password, emailAdress) VALUES (?, ?, ?, ?, ?, ?);', [user.firstName, user.lastName, user.street, user.city, user.password, user.emailAdress], function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();

                // Handle error after the release.
                if (error) {
                    res.status(409).json({
                        status: 409,
                        message: error.message
                    })
                } else {
                    res.status(201).json({
                        status: 201,
                        result: {
                            id: results.insertId,
                            isActive: user.isActive || true,
                            phoneNumber: user.isActive || "-",
                            ...user
                        }
                    })
                }
            });
        });
    },

    // UC-202 Get all users
    getAllUsers: (req, res, next) => {
        logger.debug(`getAllUsers aangeroepen. req.userId = ${req.userId}`);
        
        const queryParams = req.query
        logger.debug(queryParams);

        let { firstName, lastName } = req.query
        let queryString = 'SELECT `id`, `firstName` FROM `user`'
        if (firstName || lastName) {
            queryString += ' WHERE '
            if (firstName) {
                queryString += `firstName LIKE '%${firstName}%'`
                firstName = '%' + firstName + '%'
            }
            if (firstName && lastName) {
                queryString += ` AND `
            }
            if (lastName) {
                queryString += `lastName='${lastName}'`
            }
        }
        queryString += ';'
        logger.debug(`queryString = ${queryString}`)

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err); // not connected!

            // Use the connection
            connection.query(queryString, [firstName, lastName], function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();

                // Handle error after the release.
                if (error) next(error);

                logger.debug('#results = ', results.length);
                res.status(201).json({
                    status: 201,
                    result: results
                })
            });
        });
    },

    // UC-203 Request personal user profile
    requestUserProfile: (req, res, next) => {
        res.status(404).json({
            status: 404,
            result: "Function not functioning yet",
        });
    },

    // UC-204 Get single user by ID
    getUserById: (req, res, next) => {
        const userId = req.params.userId;
        logger.debug(`User met ID ${userId} gezocht`);
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!
            // Use the connection
            connection.query(`SELECT * FROM user WHERE id = ${userId}`, function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();
                // Handle error after the release.
                if (error) {
                    console.error('Error in DB');
                    console.debug(error);
                    return;
                } else {
                    if (results && results.length) {
                        res.status(200).json({
                            status: 200,
                            result: results[0]
                        })
                    } else {
                        res.status(404).json({
                            status: 404,
                            message: 'User not found!'
                        })
                    }
                }
            });
        });
    },

    // UC-205 Update a single user
    updateUser: (req, res, next) => {
        let userData = req.body;
        const userId = req.params.userId;

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            const query = "UPDATE user SET " + Object.keys(userData).map(key => `${key} = ?`).join(", ") + " WHERE id = ?";
            const parameters = [...Object.values(userData), userId];
            connection.query(query, parameters, function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();

                // Handle error after the release.
                if (error) {
                    res.status(400).json({
                        status: 400,
                        message: error.message
                    })
                    return;
                } else if (results.affectedRows === 1) {
                    res.status(200).json({
                        status: 200,
                        message: `User successfully updated`,
                        result: {
                            id: userId,
                            ...userData
                        }
                    })
                } else {
                    res.status(400).json({
                        status: 400,
                        message: 'User not found'
                    })
                }
            });
        });
    },

    // UC-206 Delete a user
    deleteUser: (req, res) => {
        const userId = req.params.userId;

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query(`DELETE FROM user WHERE id = ${userId}`, function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();

                // Handle error after the release.
                if (error) {
                    console.log(error);
                    return;
                } else if (results.affectedRows === 0) {
                    res.status(400).json({
                        status: 400,
                        message: 'User does not exist'
                    })
                } else {
                    res.status(200).json({
                        status: 200,
                        message: `User deleted successfully`,
                        result: results
                    })
                }
            });
        });
    },
}
module.exports = controller