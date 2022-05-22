process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'
process.env.LOGLEVEL = 'warn'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const pools = require('../../src/database/dbconnection')
const bcrypt = require('bcrypt');

chai.should()
chai.use(chaiHttp)

/**
* Db queries to clear and fill the test database before each test.
*/
const CLEAR_MEAL_TABLE = 'DELETE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

let key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQyLCJpYXQiOjE2NTMyNDg5MDIsImV4cCI6MTY1Mzg1MzcwMn0.ox1BP_zIQ5gkj1z3lEzoYMYK3O95qRVPAnH2AbSb2QQ";

describe('Users', () => {

    describe('UC-101 Login', () => {
        
        beforeEach((done) =>{
            pools.getConnection(function(err, connection){
                connection.query(CLEAR_MEAL_TABLE, function (error, results, fields) {
                    if (error) console.log(error);
                    connection.query(CLEAR_PARTICIPANTS_TABLE, function (error, results, fields) {
                        if (error) console.log(error);
                        connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
                            if (error) console.log(error);
                            bcrypt.hash("secret", 10, function(err, hash) {
                                if(err) throw err;
                                connection.query(`INSERT INTO user (id, firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
                                (1,"test","test",0,"testing@email.com",?,"test","guest","test","test")`, [hash], function (error, results, fields) {
                                    if (error) throw error;
                                    connection.release();
                                    done();
                                });
                            });
                        });
                    });
                });
            })
        });
        
        it('TC-101-1 Verplicht veld ontbreekt', (done) => {
            chai
            .request(server)
            .post('/api/auth/login')
            .send({
                //"emailAdress": "testing@email.com",
                "password": "secret",
            })
            .end((err, res) => {
                res.should.be.an('object')
                let { status, result } = res.body;
                status.should.equal(400);
                result.should.be.an('string').that.equals("Email and/or password not defined or not valid");
                done();
            }) 
        });
        it('TC-101-2 Niet-valide email adres', (done) => {
            chai
            .request(server)
            .post('/api/auth/login')
            .send({
                "emailAdress": "testingemail.com",
                "password": "secret",
            })
            .end((err, res) => {
                res.should.be.an('object')
                let { status, result } = res.body;
                status.should.equal(400);
                result.should.be.an('string').that.equals("Email and/or password not defined or not valid");
                done();
            }) 
        });
        it('TC-101-3 Niet-valide wachtwoord', (done) => {
            chai
            .request(server)
            .post('/api/auth/login')
            .send({
                "emailAdress": "testing@email.com",
                "password": 3,
            })
            .end((err, res) => {
                res.should.be.an('object')
                let { status, result } = res.body;
                status.should.equal(400);
                result.should.be.an('string').that.equals("Email and/or password not defined or not valid");
                done();
            }) 
        });
        it('TC-101-4 Gebruiker bestaat niet', (done) => {
            chai
            .request(server)
            .post('/api/auth/login')
            .send({
                "emailAdress": "testing2@email.com",
                "password": "secret2",
            })
            .end((err, res) => {
                res.should.be.an('object')
                let { status, result } = res.body;
                status.should.equal(404);
                result.should.be.an('string').that.equals("No user with email: testing2@email.com");
                done();
            }) 
        });
        it('TC-101-5 Gebruiker succesvol ingelogd', (done) => {
            chai
            .request(server)
            .post('/api/auth/login')
            .send({
                "emailAdress": "testing@email.com",
                "password": "secret",
            })
            .end((err, res) => {
                res.should.be.an('object')
                let { status, result } = res.body;
                status.should.equal(200);
                result.should.be.an('string');
                done();
            }) 
        });
    });
    describe('UC-201 Registreren als nieuwe gebruiker', () => {
        
        beforeEach((done) =>{
            pools.getConnection(function(err, connection){
                connection.query(CLEAR_MEAL_TABLE, function (error, results, fields) {
                    if (error) console.log(error);
                    connection.query(CLEAR_PARTICIPANTS_TABLE, function (error, results, fields) {
                        if (error) console.log(error);
                        connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
                            if (error) console.log(error);
                            bcrypt.hash("secret", 10, function(err, hash) {
                                if(err) throw err;
                                connection.query(`INSERT INTO user (id, firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
                                (1,"test","test",0,"testing@email.com",?,"test","guest","test","test")`, [hash], function (error, results, fields) {
                                    if (error) throw error;
                                    connection.release();
                                    done();
                                });
                            });
                        });
                    });
                });
            })
        });
        
        it('TC-201-1 Verplicht veld ontbreekt', (done) => {
            chai
            .request(server)
            .post('/api/user')
            .send({
                "lastName": "Test3",
                "isActive": 0,
                "emailAdress": "m.vaaldp@er.nl",
                "password": "secret",
                "phoneNumber": "0691214328",
                "roles": "guest",
                "street": "Test3",
                "city": "Test3" 
            })
            .end((err, res) => {
                res.should.be.an('object')
                let { status, result } = res.body;
                status.should.equal(400);
                result.should.be.an('string').that.equals("firstName must be a string");
                done();
            }) 
        });
        
        it('TC-101-2 Niet-valide email adres', (done) => {
            chai
            .request(server)
            .post('/api/user')
            .send({
                "firstName": "Test3",
                "lastName": "Test3",
                "isActive": 0,
                "emailAdress": "",
                "password": "secret",
                "phoneNumber": "0691214328",
                "roles": "guest",
                "street": "Test3",
                "city": "Test3"
            })
            .end((err, res) => {
                res.should.be.an('object')
                let { status, result } = res.body;
                status.should.equal(400);
                result.should.be.an('string').that.equals("Email can\'t be empty");
                done();
            }) 
        });
        
        it('TC-101-3 Niet-valide wachtwoord', (done) => {
            chai
            .request(server)
            .post('/api/user')
            .send({
                "firstName": "Test3",
                "lastName": "Test3",
                "isActive": 0,
                "emailAdress": "m.vaaldp@er.nl",
                "password": "",
                "phoneNumber": "0691214328",
                "roles": "guest",
                "street": "Test3",
                "city": "Test3"
            })
            .end((err, res) => {
                res.should.be.an('object')
                let { status, result } = res.body;
                status.should.equal(400);
                result.should.be.an('string').that.equals("Password can\'t be empty");
                done();
            }) 
        });
        
        it('TC-201-4 Gebruiker bestaat al', (done) => {            
            chai
            .request(server)
            .post('/api/user')
            .send({
                "firstName": "Test3",
                "lastName": "Test3",
                "isActive": 0,
                "emailAdress": "testing@email.com",
                "password": "secret",
                "phoneNumber": "0691214328",
                "roles": "guest",
                "street": "Test3",
                "city": "Test3"
            })
            .end((err, res) => {
                res.should.be.an('object')
                let { status, result } = res.body;
                status.should.equal(409);
                result.should.be.an('string').that.equals("email already exists");
                done();
            }) 
        });
        
        it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {            
            chai
            .request(server)
            .post('/api/user')
            .send({
                "firstName": "Test3",
                "lastName": "Test3",
                "isActive": 0,
                "emailAdress": "newTest@email.com",
                "password": "secret",
                "phoneNumber": "0691214328",
                "roles": "guest",
                "street": "Test3",
                "city": "Test3"
            })
            .end((err, res) => {
                res.should.be.an('object')
                let { status, message, result } = res.body;
                status.should.equal(201);
                message.should.be.an('string').that.equals("User added with values:");
                result.should.be.an('array');
                done();
            }) 
        });
        
    });
    describe('UC-202 Overzicht van gebruikers', () => {
        beforeEach((done) =>{
            pools.getConnection(function(err, connection){
                connection.query(CLEAR_MEAL_TABLE, function (error, results, fields) {
                    if (error) console.log(error);
                    connection.query(CLEAR_PARTICIPANTS_TABLE, function (error, results, fields) {
                        if (error) console.log(error);
                        connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
                            if (error) console.log(error);
                            done();
                        });
                    });
                });
            })
        });
        it('TC-202-1 Toon nul gebruikers', (done) => {
            chai
            .request(server)
            .get('/api/user')
            .end((err, res) => {
                res.should.be.an('object')
                let { status, result } = res.body;
                status.should.equal(201);
                result.should.be.an('array').to.have.lengthOf(0);;
                done();
            }) 
        });
        it('TC-202-2 Toon twee gebruikers', (done) => {
            pools.getConnection(function(err, connection){
                connection.query(`INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
                ("test","test",0,"test@email.com","secret","test","guest","test","test")`, function (error, results, fields) {
                    if (error) throw error;
                    connection.query(`INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
                    ("test2","test",1,"test@2email.com","secret","test","guest","test","test")`, function (error, results, fields) {
                        if (error) throw error;
                        connection.release();
                        chai
                        .request(server)
                        .get('/api/user')
                        .end((err, res) => {
                            res.should.be.an('object')
                            let { status, result } = res.body;
                            status.should.equal(201);
                            result.should.be.an('array').to.have.lengthOf(2);
                            done();
                        }) 
                    });
                });
            });
        });
        it('TC-202-3 Toon gebruikers met zoekterm op niet-bestaande naam', (done) => {
            chai
            .request(server)
            .get('/api/user?name=test3')
            .end((err, res) => {
                res.should.be.an('object')
                let { status, result } = res.body;
                status.should.equal(201);
                result.should.be.an('array').to.have.lengthOf(0);
                done();
            }) 
        });
        it('TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld ‘actief’=false', (done) => {
            chai
            .request(server)
            .get('/api/user?actief=false')
            .end((err, res) => {
                res.should.be.an('object')
                let { status, result } = res.body;
                status.should.equal(201);
                result.should.be.an('array');
                done();
            }) 
        });
        it('TC-202-5 Toon gebruikers met gebruik van de zoekterm op het veld ‘actief’=true', (done) => {
            chai
            .request(server)
            .get('/api/user?actief=true')
            .end((err, res) => {
                res.should.be.an('object')
                let { status, result } = res.body;
                status.should.equal(201);
                result.should.be.an('array');
                done();
            }) 
        });
        it('TC-202-6 Toon gebruikers met zoekterm op bestaande naam', (done) => {
            chai
            .request(server)
            .get('/api/user?name=test')
            .end((err, res) => {
                res.should.be.an('object')
                let { status, result } = res.body;
                status.should.equal(201);
                result.should.be.an('array');
                done();
            }) 
        });
    });
    describe('UC-203 Gebruikersprofiel opvragen', () => {
        beforeEach((done) => {
            pools.getConnection(function(err, connection){
                connection.query(CLEAR_MEAL_TABLE, function (error, results, fields) {
                    if (error) console.log(error);
                    connection.query(CLEAR_PARTICIPANTS_TABLE, function (error, results, fields) {
                        if (error) console.log(error);
                        connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
                            if (error) console.log(error);
                            connection.query(`INSERT INTO user (id, firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
                            (1,"test","test",0,"testing@email.com","secret","test","guest","test","test")`, function (error, results, fields) {
                                if (error) throw error;
                                connection.release();
                                done();
                            });
                        });
                    });
                });
            })
        });
        it('TC-203-1 Ongeldig token', (done) => {
            let wrongkey = "wrongKey";
            chai
            .request(server)
            .get('/api/user/profile')
            .set({'authorization': wrongkey})
            .end((err, res) => {
                res.should.be.an('object')
                let { status, result } = res.body;
                status.should.equal(404);
                result.should.be.an('string').that.equals("This key isn't linked to any users");
                done();
            })
        });        
    });
    describe('UC-204 Details van gebruiker', () => {
        let insertedId;
        beforeEach((done) =>{
            pools.getConnection(function(err, connection){
                connection.query(CLEAR_MEAL_TABLE, function (error, results, fields) {
                    if (error) console.log(error);
                    connection.query(CLEAR_PARTICIPANTS_TABLE, function (error, results, fields) {
                        if (error) console.log(error);
                        connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
                            if (error) console.log(error);
                            connection.query(`INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
                            ("test","test",0,"test@email.com","secret","test","guest","test","test")`, function (error, results, fields) {
                                if (error) throw error;
                                insertedId = results.insertId;
                                connection.release();
                                done();
                            });
                        });
                    });
                });
            })
        });
    });
    describe('UC-205 Gebruiker wijzigen', () => {
        let insertedId;
        beforeEach((done) =>{
            pools.getConnection(function(err, connection){
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
                                insertedId = results.insertId;
                                done();
                            });
                        });
                    });
                });
            })
        });
    
        it('TC-205-5 Niet ingelogd', (done) => {
            chai
            .request(server)
            .put(`/api/user/1`)
            .send({
                "firstName": "Test3",
                "lastName": "Test3",
                "isActive": 0,
                "emailAdress": "m.vaaldp@er.nl",
                "password": "secret",
                "phoneNumber": "0691214328",
                "roles": "guest",
                "street": "Test3",
                "city": "Test3"
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
    describe('UC-206 Gebruiker verwijderen', () => {
        let insertedId;
        beforeEach((done) =>{
            pools.getConnection(function(err, connection){
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
                                connection.query(`INSERT INTO user (id,firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES
                                (2,"test","test",0,"test32@email.com","secret","test","guest","test","test")`, function (error, results, fields) {
                                    if (err) throw err;
                                    connection.release();
                                    done();
                                });
                            });
                        });
                    });
                });
            })
        });
        
        it('TC-206-2 Niet ingelogd', (done) => {
            chai
            .request(server)
            .delete(`/api/user/1`)
            .end((err, res) => {
                res.should.be.an('object')
                let { status, result } = res.body;
                status.should.equal(401);
                result.should.be.an('string').that.equals(`No key found`);
                done();
            })
        });
        it('TC-206-3 Actor is geen eigenaar', (done) => {
            chai
            .request(server)
            .delete(`/api/user/2`)
            .end((err, res) => {
                res.should.be.an('object')
                let { status, result } = res.body;
                status.should.equal(401);
                result.should.be.an('string').that.equals(`No key found`);
                done();
            })
        });
    });
});