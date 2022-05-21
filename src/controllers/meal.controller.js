const assert = require('assert');
const dbconnection = require('../database/dbconnection')
const logger = require('../config/config').logger;

let controller = {

    // Validations
    validateMeal: (req, res, next) => {

        let meal = req.body;
        let { name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price, cook, participants } = meal;

        try {
            assert(typeof name === 'string', 'name must be a string')
            assert(typeof description === 'string', 'description must be a string')
            assert(typeof isActive === 'boolean', 'isActive must be a boolean')
            assert(typeof isVega === 'boolean', 'isVega must be a boolean')
            assert(typeof isVegan === 'boolean', 'isVegan must be a boolean')
            assert(typeof isToTakeHome === 'boolean', 'isToTakeHome must be a boolean')
            assert(typeof dateTime === 'string', 'dateTime must be a string')
            assert(typeof imageUrl === 'string', 'imageUrl must be a string')
            assert(typeof allergenes === 'object', 'allergenes must be an array')
            assert(typeof maxAmountOfParticipants === 'number', 'maxAmountOfParticipants must be a number')
            assert(typeof price === 'number', 'price must be a number')

        } catch (error) {
            const err = {
                status: 400,
                message: error.message
            }

            next(err)
        }

        next();
    },

    validateUpdatedMeal: (req, res, next) => {

    },

    // UC-301 Register a meal
    addMeal: function (req, res) {
        let meal = req.body

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query('INSERT INTO meal (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price, cookId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [meal.name, meal.description, meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, meal.dateTime, meal.imageUrl, '[' + meal.allergenes + ']', meal.maxAmountOfParticipants, meal.price, req.userId], function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();

                // Handle error after the release.
                if (error) {
                    res.status(409).json({
                        status: 409,
                        message: error.message
                    })
                    logger.error(error)
                } else {
                    res.status(201).json({
                        status: 201,
                        result: {
                            id: results.insertId,
                            ...meal
                        }
                    })
                    logger.debug('Meal registered successfully')
                }
            });
        })
    },

// UC-302 Update a single meal
updateMeal: (req, res, next) => {
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

    // UC-303 Get all meals
    getAllMeals: (req, res) => {
        logger.debug(`getAllMeals aangeroepen.`);

        const queryParams = req.query
        logger.debug(queryParams);

        let { name, price } = req.query
        let queryString = 'SELECT `id`, `name`, `price` FROM `meal`'
        if (name || price) {
            queryString += ' WHERE '
            if (name) {
                queryString += `name LIKE '%${name}%'`
                name = '%' + name + '%'
            }
            if (name && price) {
                queryString += ` AND `
            }
            if (price) {
                queryString += `price='${price}'`
            }
        }
        queryString += ';'
        logger.debug(`queryString = ${queryString}`)

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err); // not connected!

            // Use the connection
            connection.query(queryString, [name, price], function (error, results, fields) {
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

        // UC-304 Get single meal by ID
        getMealById: (req, res, next) => {
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

            // UC-305 Delete a meal
            deleteMeal: (req, res) => {
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
                                message: 'Meal does not exist'
                            })
                        } else {
                            res.status(200).json({
                                status: 200,
                                message: `Meal deleted successfully`,
                                result: results
                            })
                        }
                    });
                });
            },
}
module.exports = controller