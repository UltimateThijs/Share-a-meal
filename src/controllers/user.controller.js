const assert = require('assert');
const dbconnection = require('../../database/dbconnection')
let database = [];
let id = 0;

let controller = {

    validateUser: (req, res, next) =>{
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
            res.status(409).json({
                status: 409,
                message: error.message
            })
            next(err)
        }

        next();
    },

    validateUpdatedUser: (req, res, next) =>{
        let user = req.body;
        let { emailAdress, password, firstName, lastName, isActive, street, city, phoneNumber } = user;

        try {
            assert(typeof emailAdress === 'string', 'email must be a string')
            assert(typeof firstName === 'string', 'firstName must be a string')
            assert(typeof lastName === 'string', 'lastName must be a string')
            assert(typeof password === 'string', 'password must be a string')
            assert(typeof isActive === 'boolean', 'isActive must be a boolean')
            assert(typeof street === 'string', 'street must be a string')
            assert(typeof city === 'string', 'city must be a string')
            assert(typeof phoneNumber === 'string', 'phoneNumber must be a string')

        } catch (error) {
            res.status(400).json({
                status: 400,
                message: error.message
            })
            next(err)
        }

        next();
    },

    // UC-201 Register as a new user
    addUser: (req, res, next) => {
        let userData = req.body;
        let user = [userData.firstName, userData.lastName,
        userData.isActive, userData.emailAdress, userData.password,
        userData.phoneNumber, userData.roles, userData.street, userData.city]

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query(`INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
                (?,?,?,?,?,?,?,?,?)`, user, function (error, results, fields) {
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
                    });
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

                // Don't use the connection here, it has been returned to the pool.
                console.log('Results = ', results.length)
                res.status(200).json({
                    status: 200,
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
                if(error) {
                    console.error('Error in DB');
                    console.debug(error);
                    return;
                } else {
                    if (results && results.length ) {
                        res.status(200).json({
                            status: 200,
                            result: results
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
            street = ?, city = ? WHERE id = ?`,user, function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();

                // Handle error after the release.
                if (error) {
                    res.status(404).json({
                        status: 404,
                        message: error.message
                    })
                    return;
                } else if(results.affectedRows === 0) {
                    res.status(404).json({
                        status: 404,
                        message: 'User not found'
                    })
                } else {
                    res.status(201).json({
                        status: 201,
                        message: `User with ID ${userId} successfully updated`,
                        result: {
                            result: {
                                id: userId,
                                ...user
                            }
                        }
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
                } else if(results.affectedRows === 0) {
                    res.status(404).json({
                        status: 404,
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