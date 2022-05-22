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
})