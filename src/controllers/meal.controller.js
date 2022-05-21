const assert = require('assert');
const dbconnection = require('../database/dbconnection')
const logger = require('../config/config').logger;
const dbPools = require('../database/dbconnection');

let controller = {

    // Validations
    validateMeal: (req, res, next) => {
        let { name, price, maxAmountOfParticipants } = req.body;
        try {
            assert(typeof name === 'string', 'name must be present and be a string');
            assert(typeof price === 'number', 'price must be present and be an number');
            assert(typeof maxAmountOfParticipants === 'number', 'maxAmountOfParticipants must be present and an number');
            next();
        } catch (err) {
            error = {
                status: 400,
                result: err.message
            }
            next(error);
        }
    },

    validateMealExistance: (req, res, next) => {
        dbPools.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query('SELECT * FROM meal WHERE id = ?', [req.params.mealId], function (error, results, fields) {
                if (error) throw error;
                logger.debug(results.length);
                if (results.length > 0) {
                    next();
                } else {
                    error = {
                        status: 404,
                        result: `Meal by id ${req.params.mealId} does not exist`
                    }
                    next(error);
                }
            });
        });
    },

    validateMealOwner: (req, res, next) => {
        dbPools.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query('SELECT cookId FROM meal WHERE id = ?', [req.params.mealId], function (error, results, fields) {
                if (error) throw error;
                logger.debug(results[0].cookId);
                logger.debug(res.locals.userid);
                if (results[0].cookId == res.locals.userid) {
                    logger.debug(`Validated meal ownership`)
                    next();
                } else {
                    const error = {
                        status: 403,
                        result: `This meal is not owned by the logged in user`
                    }
                    res.status(403).json({
                        status: 403,
                        message: `This meal is not owned by the logged in user`
                    })
                    next(error);
                }
            });
        });
    },

    // UC-301 Register a meal
    addMeal: (req, res, next) => {
        let mealData = req.body;

        logger.debug(res.locals.userid);

        dbPools.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query(`INSERT INTO meal (isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants,
                price, imageUrl, cookId, name, description, allergenes)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, [mealData.isActive, mealData.isVega,
            mealData.isVegan, mealData.isToTakeHome, mealData.dateTime,
            mealData.maxAmountOfParticipants, mealData.price, mealData.imageUrl,
            res.locals.userid, mealData.name, mealData.description, '[' + mealData.allergenes + ']'], function (error, results, fields) {
                connection.release()
                if (error) {
                    error = {
                        status: 400,
                        result: error.message
                    }
                    next(error);
                } else {
                    if (results.affectedRows > 0) {
                        dbPools.getConnection(function (err, connection) {
                            if (err) throw err;
                            connection.query(`SELECT * FROM meal ORDER BY id DESC LIMIT 1`, function (error, results, fields) {
                                connection.release()
                                if (error) throw error;
                                console.log('Meal added');
                                res.status(201).json({
                                    status: 201,
                                    message: "Meal added with values:",
                                    result: results,
                                });
                                logger.debug(mealData.allergenes)
                            })
                        })
                    };
                }
            });
        });
    },


    // UC-302 Update a single meal
    updateMeal: (req, res, next) => {
        const mealId = req.params.mealId;
        let mealData = req.body;

        dbPools.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query(`UPDATE meal SET isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?,
        dateTime = ?, maxAmountOfParticipants = ?,
        price = ?, imageUrl = ?, cookId = ?,
        name = ?, description = ?, allergenes = ? 
        WHERE id = ?`,
                [mealData.isActive, mealData.isVega,
                mealData.isVegan, mealData.isToTakeHome, mealData.dateTime,
                mealData.maxAmountOfParticipants, mealData.price, mealData.imageUrl,
                res.locals.userid, mealData.name, mealData.description, '[' + mealData.allergenes + ']', parseInt(mealId)], function (error, results, fields) {
                    connection.release()
                    if (error) throw error;

                    if (results.warningCount > 0) {
                        const error = {
                            status: 400,
                            result: `Some input is wrong`
                        }
                        next(error);
                    } else if (results.affectedRows > 0) {
                        dbPools.getConnection(function (err, connection) {
                            connection.query('SELECT * FROM meal WHERE id = ?', [mealId], function (error, results, fields) {
                                connection.release();
                                if (error) throw error;
                                console.log('Meal updated');
                                res.status(200).json({
                                    status: 200,
                                    message: `meal ${mealId} updated to values:`,
                                    result: results,
                                });
                            });
                        });
                    } else {
                        const error = {
                            status: 400,
                            result: `meal by id ${req.params.mealId} does not exist`
                        }
                        next(error);
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
        let queryString = 'SELECT * FROM `meal`'
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
                if (error) throw error;

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
        const mealId = req.params.mealId;
        logger.debug(`Meal met ID ${mealId} gezocht`);
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!
            // Use the connection
            connection.query(`SELECT * FROM meal WHERE id = ${mealId}`, function (error, results, fields) {
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
                        logger.debug(`Meal with ID ${mealId} found`)
                    } else {
                        res.status(404).json({
                            status: 404,
                            message: 'Meal not found!'
                        })
                    }
                }
            });
        });
    },

    // UC-305 Delete a meal
    deleteMeal: (req, res) => {
        const mealId = req.params.mealId;

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query(`DELETE FROM meal WHERE id = ${mealId}`, function (error, results, fields) {
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
                    logger.debug(`Meal with ID ${mealId} deleted successfully`);
                }
            });
        });
    },
}
module.exports = controller