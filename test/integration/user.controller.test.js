const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const database = []

chai.should()
chai.use(chaiHttp)

describe('Manage users /api/user', () => {

    describe('UC-201 Registreren', () => {
        it('TC-201-1 Verplicht velt ontbreekt', (done) => {
            chai.request(server).post('/api/user').send({
                //"firstName": "John",
                lastName: "Doe",
                isActive: 1,
                emailAdress: "test@gmail.com",
                password: "secret",
                phoneNumber: "-",
                roles: "guest",
                street: "Lovensdijkstraat",
                city: "Breda"
            })
            .end((err, res) => {
                res.should.be.an('object');
                let { status, message } = res.body;
                status.should.equals(400)
                message.should.be.a('string').that.equals('firstName must be a string');
                done();
            });
        })
        it('TC-201-4 Gebruiker bestaat al', (done) => {
            chai
            .request(server)
            .post('/api/user')
            .send({
                "firstName": "Johannes",
                "lastName": "Wiebel",
                "emailAdress": "testmail@gmail.com",
                "password": "secret",
                "street": "test",
                "city": "test"
            })
            .end((err, res) => {
                res.should.be.an('object')
                let { status, message } = res.body;
                status.should.equal(409);
                message.should.be.an('string');
                done();
            }) 
        })

        it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
            chai
            .request(server)
            .post('/api/user')
            .send({
                "firstName": "Test",
                "lastName": "Tester",
                "isActive": 1,
                "emailAdress": "newuser@gmail.com",
                "password": "secret",
                "phoneNumber": "-",
                "roles": "guest",
                "street": "Lovensdijkstraat",
                "city": "Breda"
            })
            .end((err, res) => {
                res.should.be.an('object')
                let { status, result } = res.body;
                status.should.equal(201);
                result.should.be.an('object');
                done();
            }) 
        });
    })

    describe('UC-204 register as new user', () => {
        it('TC-204-2 Gebruiker-ID bestaat niet', (done) => {
            chai
                .request(server)
                .get('/api/user/420')
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body;
                    status.should.equal(404);
                    message.should.be.an('string').that.equals("User not found!");
                    done();
                })
        })
        it('TC-204-4 Gebruiker-ID bestaat', (done) => {
            chai
                .request(server)
                .get('/api/user/' + insertId)
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body;
                    status.should.equal(200);
                    result.should.be.an('object');
                    done();
                })
        })
    })
})