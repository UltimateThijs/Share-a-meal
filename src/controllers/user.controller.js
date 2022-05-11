const assert = require('assert');
const dbconnection = require('../../database/dbconnection')
let database = [];
let id = 0;

let controller = {

    validateUser: (req, res, next) => {
        let user = req.body;
        let { emailAdress, password, firstName, lastName, city, street } = user;

        try {
            assert(typeof emailAdress === 'string', 'Email address must be a string')
            assert(typeof firstName === 'string', 'First name must be a string')
            assert(typeof lastName === 'string', 'Last name must be a string')
            assert(typeof password === 'string', 'Password must be a string')
            assert(typeof street === 'string', 'Street must be a string')
            assert(typeof city === 'string', 'City must be a string')

        } catch (error) {
            const err = {
                status: 400,
                message: error.message
            }
            next(err)
        }

        next();
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
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query('SELECT * FROM user', function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();

                // Handle error after the release.
                if (error) throw error;

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
        console.log(`User met ID ${userId} gezocht`);
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
                            message: 'User not found'
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
        let user = [userData.firstName, userData.lastName,
        userData.isActive, userData.emailAdress, userData.password,
        userData.phoneNumber, userData.roles, userData.street, userData.city, parseInt(userId)];

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query(`UPDATE user SET firstName = ?, lastName = ?,
            isActive = ?, emailAdress = ?, password = ?,
            phoneNumber = ?, roles = ?,
            street = ?, city = ? WHERE id = ?`, user, function (error, results, fields) {
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
                        message: `User with ID ${userId} successfully updated`,
                        result: {
                            id: userId,
                            ...user
                        }
                    })
                } else {
                    res.status(400).json({
                        status: 400,
                        message: 'User does not exist'
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
                        message: 'User not found'
                    })
                } else {
                    res.status(200).json({
                        status: 200,
                        message: `User with ID ${userId} deleted successfully`,
                        result: results
                    })
                }
            });
        });
    },
}
module.exports = controller