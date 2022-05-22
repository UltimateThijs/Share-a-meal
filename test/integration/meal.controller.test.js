process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'
process.env.LOGLEVEL = 'warn'

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index.js');
const pools = require('../../database/databaseConnection');

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = 'DELETE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE FROM `user`';
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

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
                            connection.query(`INSERT INTO user (id,firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES (1,"testname","test",0,"testmail@gmail.com","secret","test","guest","test","test")`, function (error, results, fields) {
                                if (err) throw err;
                                connection.release();
                                done();
                            });
                        });
                    });
                });
            })
        });

        it('TC-301-1 Verplicht veld ontbreekt', (done) => {
            chai
                .request(server)
                .post('/api/meal')
                .set({ 'authorization': key })
                .send({
                    "isActive": 1,
                    "isVega": 1,
                    "isVegan": 0,
                    "isToTakeHome": 0,
                    "dateTime": "2020-05-20 00:40:00.000",
                    "maxAmountOfParticipants": 5,
                    "price": 4.20,
                    "imageUrl": "https://images0.persgroep.net/rcs/MbMRv6NyAxtAIhKmT4_pYZstOuY/diocontent/115445912/_fitwidth/694/?appId=21791a8992982cd8da851550a453bd7f&quality=0.8",
                    //"name":"fries",
                    "description": "tasty fries",
                    "allergenes": ""
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body;
                    status.should.equal(400);
                    result.should.be.an('string').that.equals("name must be present and be a string");
                    done();
                })
        });

        it('TC-301-2 Niet ingelogd', (done) => {
            chai
                .request(server)
                .post('/api/meal')
                .send({
                    "isActive": 1,
                    "isVega": 1,
                    "isVegan": 0,
                    "isToTakeHome": 0,
                    "dateTime": "2020-05-20 00:40:00.000",
                    "maxAmountOfParticipants": 5,
                    "price": 4.20,
                    "imageUrl": "https://images0.persgroep.net/rcs/MbMRv6NyAxtAIhKmT4_pYZstOuY/diocontent/115445912/_fitwidth/694/?appId=21791a8992982cd8da851550a453bd7f&quality=0.8",
                    "name": "fries",
                    "description": "tasty fries",
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

        it('TC-301-3 Maaltijd succesvol toegevoegd', (done) => {
            chai
                .request(server)
                .post('/api/meal')
                .set({ 'authorization': key })
                .send({
                    "isActive": 1,
                    "isVega": 1,
                    "isVegan": 0,
                    "isToTakeHome": 0,
                    "dateTime": "2020-05-20 00:40:00.000",
                    "maxAmountOfParticipants": 5,
                    "price": 4.20,
                    "imageUrl": "https://images0.persgroep.net/rcs/MbMRv6NyAxtAIhKmT4_pYZstOuY/diocontent/115445912/_fitwidth/694/?appId=21791a8992982cd8da851550a453bd7f&quality=0.8",
                    "name": "fries",
                    "description": "tasty fries",
                    "allergenes": ""
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body;
                    status.should.equal(201);
                    result.should.be.an('array');
                    done();
                })
        });
    });

    describe('UC-302 Maaltijd updaten', () => {
        beforeEach((done) => {
            pools.getConnection(function (err, connection) {
                connection.query(CLEAR_MEAL_TABLE, function (error, results, fields) {
                    if (error) console.log(error);
                    connection.query(CLEAR_PARTICIPANTS_TABLE, function (error, results, fields) {
                        if (error) console.log(error);
                        connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
                            if (error) console.log(error);
                            connection.query(`INSERT INTO user (id, firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES (5,"testname2","test",0,"testmail2@gmail.com","secret","test","guest","test","test")`, function (error, results, fields) {
                                if (error) throw error;
                                connection.query(`INSERT INTO user (id, firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES (1,"testname","test",0,"testmail@gmail.com","secret","test","guest","test","test")`, function (error, results, fields) {
                                    if (error) throw error;
                                    connection.query(`INSERT INTO meal (id,isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES
                      (2,0,0,0,0, "2020-05-20 00:40:00.000", 5, 4.20, "https://images0.persgroep.net/rcs/MbMRv6NyAxtAIhKmT4_pYZstOuY/diocontent/115445912/_fitwidth/694/?appId=21791a8992982cd8da851550a453bd7f&quality=0.8",
                      1,"fries","tasty fries","gluten")`, function (error, results, fields) {
                                        if (error) throw error;
                                        connection.query(`INSERT INTO meal (id,isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES
                        (3,0,0,0,0,"2020-05-20 00:40:00.000", 5, 4.20, "https://www.boodschappen.nl/app/uploads/2021/02/spaghetti-met-gekaramelliseerde-sjalotten-en-mozzarellaBronbeeld-scaled.jpg",
                        5,"fries", "tasty fries", "gluten")`, function (error, results, fields) {
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

        it('TC-302-1 Verplicht velden “name” en/of “price”en/of “maxAmountOfParticipants ontbreken', (done) => {
            chai
                .request(server)
                .put('/api/meal/2')
                .set({ 'authorization': key })
                .send({
                    "isActive": 1,
                    "isVega": 1,
                    "isVegan": 0,
                    "isToTakeHome": 0,
                    "dateTime": "2020-05-20 00:40:00.000",
                    "maxAmountOfParticipants": 5,
                    "price": 4.20,
                    "imageUrl": "https://images0.persgroep.net/rcs/MbMRv6NyAxtAIhKmT4_pYZstOuY/diocontent/115445912/_fitwidth/694/?appId=21791a8992982cd8da851550a453bd7f&quality=0.8",
                    //"name": "fries",
                    "description": "tasty fries",
                    "allergenes": ""
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body;
                    status.should.equal(400);
                    result.should.be.an('string').that.equals("name must be present and be a string");
                    done();
                })
        }),

            it('TC-302-2 Niet ingelogd', (done) => {
                chai
                    .request(server)
                    .put('/api/meal/2')
                    .send({
                        "isActive": 1,
                        "isVega": 1,
                        "isVegan": 0,
                        "isToTakeHome": 0,
                        "dateTime": "2020-05-20 00:40:00.000",
                        "maxAmountOfParticipants": 5,
                        "price": 4.20,
                        "imageUrl": "https://images0.persgroep.net/rcs/MbMRv6NyAxtAIhKmT4_pYZstOuY/diocontent/115445912/_fitwidth/694/?appId=21791a8992982cd8da851550a453bd7f&quality=0.8",
                        "name": "fries",
                        "description": "tasty fries",
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
                        "isActive": 1,
                        "isVega": 1,
                        "isVegan": 0,
                        "isToTakeHome": 0,
                        "dateTime": "2020-05-20 00:40:00.000",
                        "maxAmountOfParticipants": 5,
                        "price": 4.20,
                        "imageUrl": "https://images0.persgroep.net/rcs/MbMRv6NyAxtAIhKmT4_pYZstOuY/diocontent/115445912/_fitwidth/694/?appId=21791a8992982cd8da851550a453bd7f&quality=0.8",
                        "name": "fries",
                        "description": "tasty fries",
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
                        "isActive": 1,
                        "isVega": 1,
                        "isVegan": 0,
                        "isToTakeHome": 0,
                        "dateTime": "2020-05-20 00:40:00.000",
                        "maxAmountOfParticipants": 5,
                        "price": 4.20,
                        "imageUrl": "https://images0.persgroep.net/rcs/MbMRv6NyAxtAIhKmT4_pYZstOuY/diocontent/115445912/_fitwidth/694/?appId=21791a8992982cd8da851550a453bd7f&quality=0.8",
                        "name": "fries",
                        "description": "tasty fries",
                        "allergenes": ""
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let { status, result } = res.body;
                        status.should.equal(404);
                        result.should.be.an('string').that.equals("Meal by id 10 does not exist");
                        done();
                    })
            }),

            it('TC-302-5 Maaltijd succesvol gewijzigd', (done) => {
                chai
                    .request(server)
                    .put('/api/meal/2')
                    .set({ 'authorization': key })
                    .send({
                        "isActive": 1,
                        "isVega": 1,
                        "isVegan": 0,
                        "isToTakeHome": 0,
                        "dateTime": "2020-05-20 00:40:00.000",
                        "maxAmountOfParticipants": 5,
                        "price": 4.20,
                        "imageUrl": "https://images0.persgroep.net/rcs/MbMRv6NyAxtAIhKmT4_pYZstOuY/diocontent/115445912/_fitwidth/694/?appId=21791a8992982cd8da851550a453bd7f&quality=0.8",
                        "name": "fries",
                        "description": "tasty fries",
                        "allergenes": ""
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let { status, result } = res.body;
                        status.should.equal(200);
                        result.should.be.an('array');
                        done();
                    })
            })
    });

    describe('UC-303 Lijst van alle maaltijden opvragen', () => {
        beforeEach((done) => {
            pools.getConnection(function (err, connection) {
                connection.query(CLEAR_MEAL_TABLE, function (error, results, fields) {
                    if (error) console.log(error);
                    connection.query(CLEAR_PARTICIPANTS_TABLE, function (error, results, fields) {
                        if (error) console.log(error);
                        connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
                            if (error) console.log(error);
                            connection.query(`INSERT INTO user (id,firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
                            (5,"testname","test",0,"testmail2@gmail.com","secret","test","guest","test","test")`, function (error, results, fields) {
                                if (error) throw error;
                                connection.query(`INSERT INTO user (id,firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
                                (1,"testname","test", 0,"testmail@gmail.com","secret","test","guest","test","test")`, function (error, results, fields) {
                                    if (error) throw error;
                                    connection.query(`INSERT INTO meal (id,isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES
                                    (2,0,0,0,0, "2020-05-20 00:40:00.000", 5, 4.20, "https://images0.persgroep.net/rcs/MbMRv6NyAxtAIhKmT4_pYZstOuY/diocontent/115445912/_fitwidth/694/?appId=21791a8992982cd8da851550a453bd7f&quality=0.8",
                                    1,"fries","tasty fries","gluten")`, function (error, results, fields) {
                                        if (error) throw error;
                                        connection.query(`INSERT INTO meal (id,isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES
                                        (3,0,0,0,0, "2020-05-20 00:40:00.000", 5, 4.20, "https://images0.persgroep.net/rcs/MbMRv6NyAxtAIhKmT4_pYZstOuY/diocontent/115445912/_fitwidth/694/?appId=21791a8992982cd8da851550a453bd7f&quality=0.8",
                                        5,"fries","tasty fries","gluten")`, function (error, results, fields) {
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

        it('TC-303-1 Lijst van alle maaltijden teruggegeven', (done) => {
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
                            (5,"testname","test",0,"testmail2@gmail.com","secret","test","guest","test","test")`, function (error, results, fields) {
                                if (error) throw error;
                                connection.query(`INSERT INTO user (id,firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
                                (1,"testname","test", 0,"testmail@gmail.com","secret","test","guest","test","test")`, function (error, results, fields) {
                                    if (error) throw error;
                                    connection.query(`INSERT INTO meal (id,isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES
                                    (2,0,0,0,0, "2020-05-20 00:40:00.000", 5, 4.20, "https://images0.persgroep.net/rcs/MbMRv6NyAxtAIhKmT4_pYZstOuY/diocontent/115445912/_fitwidth/694/?appId=21791a8992982cd8da851550a453bd7f&quality=0.8",
                                    1,"fries","tasty fries","gluten")`, function (error, results, fields) {
                                        if (error) throw error;
                                        connection.query(`INSERT INTO meal (id,isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES
                                        (3,0,0,0,0, "2020-05-20 00:40:00.000", 5, 4.20, "https://images0.persgroep.net/rcs/MbMRv6NyAxtAIhKmT4_pYZstOuY/diocontent/115445912/_fitwidth/694/?appId=21791a8992982cd8da851550a453bd7f&quality=0.8",
                                        5,"fries","tasty fries","gluten")`, function (error, results, fields) {
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
        
        it('TC-304-2 Details van maaltijd geretourneerd', (done) => {
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
})
