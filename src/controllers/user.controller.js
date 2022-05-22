const assert = require('assert');
const dbconnection = require('../../src/database/dbconnection')
const logger = require('../config/config').logger;
const bcrypt = require('bcrypt');

let controller = {

    validateUserExistance: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query('SELECT * FROM user WHERE id = ?', [req.params.userId], function (error, results, fields) {
                if (error) throw error;
                if (results.length > 0) {
                    next();
                } else {
                    error = {
                        status: 400,
                        result: `User by id ${req.params.userId} does not exist`
                    }
                    next(error);
                }
            });
        });
    },

    validateUser: (req, res, next) => {
        let user = req.body;
        let { firstName, lastName, emailAdress, password } = user;

        let emailcounters;
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query('SELECT * FROM user WHERE emailAdress = ?', [emailAdress], function (error, results, fields) {
                if (error) throw error;
                emailcounters = results.length;
                try {
                    const emailRegex = new RegExp(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/);

                    assert(emailcounters == 0, 'email already exists');
                    assert(typeof firstName === 'string', 'firstName must be a string');
                    assert(typeof lastName === 'string', 'lastName must be a string');
                    assert(typeof emailAdress === 'string', 'emailAdress must be a string');
                    assert(typeof password === 'string', 'password must be a string');
                    assert(emailAdress != "", 'Email can\'t be empty');
                    assert(password != "", 'Password can\'t be empty');
                    assert(emailRegex.test(emailAdress));
                    next();
                } catch (err) {
                    let error;
                    if (err.message == "email already exists") {
                        error = {
                            status: 409,
                            result: err.message
                        }
                    } else {
                        error = {
                            status: 400,
                            result: err.message
                        }
                    }

                    next(error);
                }
            });
        });
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
        let userData = req.body;
        bcrypt.hash(userData.password, 10, function (err, hash) {
            if (err) throw err;
            let user = [userData.firstName, userData.lastName,
            userData.isActive, userData.emailAdress, hash, //hashed password
            userData.phoneNumber, userData.roles, userData.street, userData.city];

            dbconnection.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(`INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES (?,?,?,?,?,?,?,?,?)`, user, function (error, results, fields) {
                    connection.release()
                    if (error) throw error;

                    if (results.affectedRows > 0) {

                        dbconnection.getConnection(function (err, connection) {
                            if (err) throw err;
                            connection.query(`SELECT * FROM user ORDER BY id DESC LIMIT 1`, user, function (error, results, fields) {
                                connection.release()
                                if (error) throw error;
                                console.log('User added');
                                res.status(201).json({
                                    status: 201,
                                    message: "User added with values:",
                                    result: results,
                                });
                            })
                        })

                    };
                });
            });
        });
    },

    // UC-202 Get all users
    getAllUsers: (req, res, next) => {
        logger.debug(`getAllUsers aangeroepen. req.userId = ${req.userId}`);

        const queryParams = req.query
        logger.debug(queryParams);

        let { firstName, isActive } = req.query
        let queryString = 'SELECT `id`, `firstName` FROM `user`'
        if (firstName || isActive) {
            queryString += ' WHERE '
            if (firstName) {
                queryString += `firstName LIKE '%${firstName}%'`
                firstName = '%' + firstName + '%'
            }
            if (firstName && isActive) {
                queryString += ` AND `
            }
            if (isActive) {
                queryString += `isActive='${isActive}'`
            }
        }
        queryString += ';'
        logger.debug(`queryString = ${queryString}`)

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err); // not connected!

            // Use the connection
            connection.query(queryString, [firstName, isActive], function (error, results, fields) {
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
    requestUserProfile:(req, res) => {
        dbPools.getConnection(function(err, connection){
          if (err) throw err;
          
          connection.query('SELECT * FROM user WHERE id = ?', [res.locals.userid], function (error, results, fields) {
            if (error) throw error;
            res.status(200).json({
              status: 200,
              result: results,
            });
          })
        })
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