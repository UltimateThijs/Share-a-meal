const assert = require('assert');
let database = [];
let id = 0;

let controller = {
    // UC
    validateUser:(req, res, next) => {
        let user = req.body;
        
        let { firstName, lastName, street, city, emailAdress, password, phoneNumber } = user;
        try {
            assert(typeof emailAdress === 'string', 'Email adress must be a string')
            assert(typeof password === 'string', 'Password must be a string')
            next()
        } catch (err) {
            const error = {
                status: 400,
                result: err.message,
            };
            next(error)
        }
    },
    // UC-201 Register as a new user
    addUser:(req, res) => {
        let user = req.body;
        let email = req.body.email
        if (database.filter((item) => item.email == email).length == 0) {
            id++;
            user = {
            id,
            ...user,
            };
            console.log(user);
            database.push(user);
            res.status(201).json({
            status: 201,
            result: database,
            });
        } else {
            res.status(404).json({
            status: 404,
            result: `Email address is already in use`,
            });
        }
    },
    // UC-202 Get all users
    getAllUsers:(req, res) => {
        console.log(database)
        res.status(200).json({
            status: 200,
            result: database,
        });
    },
    // UC-203 Request personal user profile
    requestUserProfile:(req, res) => {
        res.status(404).json({
            status: 404,
            result: "Function not functioning yet",
        });
    },
    // UC-204 Get single user by ID
    getUserById:(req, res) => {
        const userId = req.params.userId;
        console.log(`User met ID ${userId} gezocht`);
        let user = database.filter((item) => item.id == userId);
        if (user.length > 0) {
            console.log(user);
            res.status(200).json({
            status: 200,
            result: user,
            });
        } else {
            const error = {
            status: 404,
            result: `User with ID ${userId} not found`,
            }
            next(error)
        };
    },
    // UC-205 Update a single user
    updateUser:(req, res) => {
        let user = req.body;
        const removedIndex = database.findIndex((item) => item.id == req.params.userId)

            if(removedIndex == -1) {
            res.status(404).json({
            status: 404,
            result: `User with ID ${req.params.userId} does not exist`
            })
            return
        } else if(user.email == null || database.filter((item) => item.email == user.email).length > 0) {
            res.status(404).json({
            status: 404,
            result: "Email address is already in use"
            })
            return
        }

        database.splice(removedIndex, 1)

        user = {
            id:req.params.userId,
            ...user
        }
        database.push(user)

        console.log(`User with id ${req.params.userId} updated successfully`)
        res.status(200).json({
            status: 200,
            result: `User with id ${req.params.userId} updated successfully`
        })
    },
    // UC-206 Delete a user
    deleteUser:(req, res) => {
        const removeIndex = database.findIndex((item) => item.id == req.params.userId)
        if(removeIndex != -1) {
            database.splice(removeIndex, 1)
            console.log(`User with id ${req.params.userId} deleted successfully`)
            res.status(200).json({
            status: 200,
            result: `User with id ${req.params.userId} deleted successfully`
            })
            return
        } else {
            res.status(404).json({
            status: 404,
            result: `User with id ${req.params.userId} does not exist`
            })
        }
    }
}
module.exports = controller