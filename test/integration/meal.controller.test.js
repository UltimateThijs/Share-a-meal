process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index.js')
const pools = require('../../src/database/dbconnection')

chai.should();
chai.use(chaiHttp)

const CLEAR_MEAL_TABLE = 'DELETE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE FROM `user`';
let key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQyLCJpYXQiOjE2NTMyNDg5MDIsImV4cCI6MTY1Mzg1MzcwMn0.ox1BP_zIQ5gkj1z3lEzoYMYK3O95qRVPAnH2AbSb2QQ";

describe('Meals', () => {

    describe('UC-301 Maaltijd aanmaken', () => {
        beforeEach((done) => {
            pools.getConnection(function (err, connection) {
                connection.query(CLEAR_MEAL_TABLE, function (error, results, fields) {
                    if (error) console.log(error);
                    connection.query(CLEAR_PARTICIPANTS_TABLE, function (error, results, fields) {
                        if (error) console.log(error);
                        connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
                            if (error) console.log(error);
                            connection.query(`INSERT INTO user (id,firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
              (1,"test","test",0,"test@email.com","secret","test","guest","test","test")`, function (error, results, fields) {
                                if (err) throw err;
                                connection.release();
                                done();
                            });
                        });
                    });
                });
            })
        });

        it('TC-301-2 Niet ingelogd', (done) => {
            chai
                .request(server)
                .post('/api/meal')
                .send({
                    "isActive": 0,
                    "isVega": 0,
                    "isVegan": 1,
                    "isToTakeHome": 0,
                    "dateTime": "2006-12-30 00:38:54.840",
                    "maxAmountOfParticipants": 9,
                    "price": 1.20,
                    "imageUrl": "https://www.boodschappen.nl/app/uploads/2021/02/spaghetti-met-gekaramelliseerde-sjalotten-en-mozzarellaBronbeeld-scaled.jpg",
                    "name": "pasta",
                    "description": "normal pastaxl",
                    "allergenes": ""
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body;
                    status.should.equal(401);
                    result.should.be.an('string').that.equals(`No key found`);
                    done();
                })
        });
    });

    describe('UC-302 Maaltijd wijzigen', () => {
        beforeEach((done) => {
            pools.getConnection(function (err, connection) {
                connection.query(CLEAR_MEAL_TABLE, function (error, results, fields) {
                    if (error) console.log(error);
                    connection.query(CLEAR_PARTICIPANTS_TABLE, function (error, results, fields) {
                        if (error) console.log(error);
                        connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
                            if (error) console.log(error);
                            connection.query(`INSERT INTO user (id,firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
              (5,"test","test",0,"test2@email.com","secret","test","guest","test","test")`, function (error, results, fields) {
                                if (error) throw error;
                                connection.query(`INSERT INTO user (id,firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
                (1,"test","test",0,"test@email.com","secret","test","guest","test","test")`, function (error, results, fields) {
                                    if (error) throw error;
                                    connection.query(`INSERT INTO meal (id,isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES
                  (2,0,0,0,0,"2006-12-30 00:38:54.840",5,1.20,"https://www.boodschappen.nl/app/uploads/2021/02/spaghetti-met-gekaramelliseerde-sjalotten-en-mozzarellaBronbeeld-scaled.jpg",
                  1,"pasta","normal pastaxl","Gluten,noten")`, function (error, results, fields) {
                                        if (error) throw error;
                                        connection.query(`INSERT INTO meal (id,isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES
                    (3,0,0,0,0,"2006-12-30 00:38:54.840",5,1.20,"https://www.boodschappen.nl/app/uploads/2021/02/spaghetti-met-gekaramelliseerde-sjalotten-en-mozzarellaBronbeeld-scaled.jpg",
                    5,"pasta","normal pastaxl","Gluten,noten")`, function (error, results, fields) {
                                            if (error) throw error;
                                            connection.release();
                                            done();
                                        })
                                    })
                                });
                            });
                        });
                    });
                });
            })
        })
            it('TC-302-2 Niet ingelogd', (done) => {
                chai
                    .request(server)
                    .put('/api/meal/2')
                    .send({
                        "isActive": 0,
                        "isVega": 0,
                        "isVegan": 1,
                        "isToTakeHome": 0,
                        "dateTime": "2006-12-30 00:38:54.840",
                        "maxAmountOfParticipants": 9,
                        "price": 1.20,
                        "imageUrl": "https://www.boodschappen.nl/app/uploads/2021/02/spaghetti-met-gekaramelliseerde-sjalotten-en-mozzarellaBronbeeld-scaled.jpg",
                        "name": "pasta",
                        "description": "normal pastaxl",
                        "allergenes": ""
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let { status, result } = res.body;
                        status.should.equal(401);
                        result.should.be.an('string').that.equals("No key found");
                        done();
                    })
            }),
            it('TC-302-3 Niet de eigenaar van de data', (done) => {
                chai
                    .request(server)
                    .put('/api/meal/3')
                    .send({
                        "isActive": 0,
                        "isVega": 0,
                        "isVegan": 1,
                        "isToTakeHome": 0,
                        "dateTime": "2006-12-30 00:38:54.840",
                        "maxAmountOfParticipants": 9,
                        "price": 1.20,
                        "imageUrl": "https://www.boodschappen.nl/app/uploads/2021/02/spaghetti-met-gekaramelliseerde-sjalotten-en-mozzarellaBronbeeld-scaled.jpg",
                        "name": "pasta",
                        "description": "normal pastaxl",
                        "allergenes": ""
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let { status, result } = res.body;
                        status.should.equal(401);
                        result.should.be.an('string').that.equals("No key found");
                        done();
                    })
            }),
            it('TC-302-4 Maaltijd bestaat niet', (done) => {
                chai
                    .request(server)
                    .put('/api/meal/10')
                    .send({
                        "isActive": 0,
                        "isVega": 0,
                        "isVegan": 1,
                        "isToTakeHome": 0,
                        "dateTime": "2006-12-30 00:38:54.840",
                        "maxAmountOfParticipants": 9,
                        "price": 1.20,
                        "imageUrl": "https://www.boodschappen.nl/app/uploads/2021/02/spaghetti-met-gekaramelliseerde-sjalotten-en-mozzarellaBronbeeld-scaled.jpg",
                        "name": "pasta",
                        "description": "normal pastaxl",
                        "allergenes": ""
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let { status, result } = res.body;
                        status.should.equal(404);
                        result.should.be.an('string').that.equals("Meal by id 10 does not exist");
                        done();
                    })
            })
    });
    describe('UC-303 Lijst van maaltijden opvragen', () => {
        beforeEach((done) => {
            pools.getConnection(function (err, connection) {
                connection.query(CLEAR_MEAL_TABLE, function (error, results, fields) {
                    if (error) console.log(error);
                    connection.query(CLEAR_PARTICIPANTS_TABLE, function (error, results, fields) {
                        if (error) console.log(error);
                        connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
                            if (error) console.log(error);
                            connection.query(`INSERT INTO user (id,firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
              (5,"test","test",0,"test2@email.com","secret","test","guest","test","test")`, function (error, results, fields) {
                                if (error) throw error;
                                connection.query(`INSERT INTO user (id,firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
                (1,"test","test",0,"test@email.com","secret","test","guest","test","test")`, function (error, results, fields) {
                                    if (error) throw error;
                                    connection.query(`INSERT INTO meal (id,isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES
                  (2,0,0,0,0,"2006-12-30 00:38:54.840",5,1.20,"https://www.boodschappen.nl/app/uploads/2021/02/spaghetti-met-gekaramelliseerde-sjalotten-en-mozzarellaBronbeeld-scaled.jpg",
                  1,"pasta","normal pastaxl","Gluten,noten")`, function (error, results, fields) {
                                        if (error) throw error;
                                        connection.query(`INSERT INTO meal (id,isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES
                    (3,0,0,0,0,"2006-12-30 00:38:54.840",5,1.20,"https://www.boodschappen.nl/app/uploads/2021/02/spaghetti-met-gekaramelliseerde-sjalotten-en-mozzarellaBronbeeld-scaled.jpg",
                    5,"pasta","normal pastaxl","Gluten,noten")`, function (error, results, fields) {
                                            if (error) throw error;
                                            connection.release();
                                            done();
                                        })
                                    })
                                });
                            });
                        });
                    });
                });
            })
        });

        it('TC-303-1 Lijst van maaltijden geretourneerd', (done) => {
            chai
                .request(server)
                .get('/api/meal')
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body;
                    status.should.equal(200);
                    result.should.be.an('array');
                    done();
                })
        })
    });
    describe('UC-304 Details van een maaltijd opvragen', () => {
        beforeEach((done) => {
            pools.getConnection(function (err, connection) {
                connection.query(CLEAR_MEAL_TABLE, function (error, results, fields) {
                    if (error) console.log(error);
                    connection.query(CLEAR_PARTICIPANTS_TABLE, function (error, results, fields) {
                        if (error) console.log(error);
                        connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
                            if (error) console.log(error);
                            connection.query(`INSERT INTO user (id,firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
              (5,"test","test",0,"test2@email.com","secret","test","guest","test","test")`, function (error, results, fields) {
                                if (error) throw error;
                                connection.query(`INSERT INTO user (id,firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
                (1,"test","test",0,"test@email.com","secret","test","guest","test","test")`, function (error, results, fields) {
                                    if (error) throw error;
                                    connection.query(`INSERT INTO meal (id,isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES
                  (2,0,0,0,0,"2006-12-30 00:38:54.840",5,1.20,"https://www.boodschappen.nl/app/uploads/2021/02/spaghetti-met-gekaramelliseerde-sjalotten-en-mozzarellaBronbeeld-scaled.jpg",
                  1,"pasta","normal pastaxl","Gluten,noten")`, function (error, results, fields) {
                                        if (error) throw error;
                                        connection.query(`INSERT INTO meal (id,isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES
                    (3,0,0,0,0,"2006-12-30 00:38:54.840",5,1.20,"https://www.boodschappen.nl/app/uploads/2021/02/spaghetti-met-gekaramelliseerde-sjalotten-en-mozzarellaBronbeeld-scaled.jpg",
                    5,"pasta","normal pastaxl","Gluten,noten")`, function (error, results, fields) {
                                            if (error) throw error;
                                            connection.release();
                                            done();
                                        })
                                    })
                                });
                            });
                        });
                    });
                });
            })
        });

        it('TC-304-1 Maaltijd bestaat niet', (done) => {
            chai
                .request(server)
                .get('/api/meal/10')
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body;
                    status.should.equal(404);
                    result.should.be.an('string').that.equals("meal by id 10 does not exist");
                    done();
                })
        })
        it('TC-304-1 Maaltijd bestaat niet', (done) => {
            chai
                .request(server)
                .get('/api/meal/2')
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body;
                    status.should.equal(200);
                    result.should.be.an('array');
                    done();
                })
        })
    });
    describe('UC-305 Maaltijd verwijderen', () => {
        beforeEach((done) => {
            pools.getConnection(function (err, connection) {
                connection.query(CLEAR_MEAL_TABLE, function (error, results, fields) {
                    if (error) console.log(error);
                    connection.query(CLEAR_PARTICIPANTS_TABLE, function (error, results, fields) {
                        if (error) console.log(error);
                        connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
                            if (error) console.log(error);
                            connection.query(`INSERT INTO user (id,firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
              (5,"test","test",0,"test2@email.com","secret","test","guest","test","test")`, function (error, results, fields) {
                                if (error) throw error;
                                connection.query(`INSERT INTO user (id,firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
                (1,"test","test",0,"test@email.com","secret","test","guest","test","test")`, function (error, results, fields) {
                                    if (error) throw error;
                                    connection.query(`INSERT INTO meal (id,isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES
                  (2,0,0,0,0,"2006-12-30 00:38:54.840",5,1.20,"https://www.boodschappen.nl/app/uploads/2021/02/spaghetti-met-gekaramelliseerde-sjalotten-en-mozzarellaBronbeeld-scaled.jpg",
                  1,"pasta","normal pastaxl","Gluten,noten")`, function (error, results, fields) {
                                        if (error) throw error;
                                        connection.query(`INSERT INTO meal (id,isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES
                    (3,0,0,0,0,"2006-12-30 00:38:54.840",5,1.20,"https://www.boodschappen.nl/app/uploads/2021/02/spaghetti-met-gekaramelliseerde-sjalotten-en-mozzarellaBronbeeld-scaled.jpg",
                    5,"pasta","normal pastaxl","Gluten,noten")`, function (error, results, fields) {
                                            if (error) throw error;
                                            connection.release();
                                            done();
                                        })
                                    })
                                });
                            });
                        });
                    });
                });
            })
        });

        it('TC-305-2 Niet ingelogd', (done) => {
            chai
                .request(server)
                .delete('/api/meal/2')
                //.set({'authorization': key})
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body;
                    status.should.equal(401);
                    result.should.be.an('string').that.equals("No key found");
                    done();
                })
        }),

        it('TC-305-4 Maaltijd bestaat niet', (done) => {
            chai
                .request(server)
                .delete('/api/meal/10')
                .set({ 'authorization': key })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body;
                    status.should.equal(404);
                    result.should.be.an('string').that.equals("Meal by id 10 does not exist");
                    done();
                })
        })
    });
});