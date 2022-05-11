const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const database = []

chai.should()
chai.use(chaiHttp)

describe('Manage users /api/user', () => {

    describe('UC-201 Register as a new user', () => {

        //it('Required input is missing', (done) => { //TC-201-1
        //    chai
        //        .request(server)
        //        .post('/api/user')
        //        .send({
        //            //"firstName": "Test", First name is missing
        //            "lastName": "van den Test",
        //            "isActive": 1,
        //            "emailAdress": "testmail3462@gmail.com",
        //            "password": "secret",
        //            "phoneNumber": "test",
        //            "roles": "editor,guest",
        //            "street": "Lovensdijkstraat",
        //            "city": "Breda"
        //        })
        //        .end((err, res) => {
        //            res.should.be.an('object')
        //            let { status, result } = res.body;
        //            status.should.equal(404);
        //            result.should.be.an('string').that.equals("Required input is missing")
        //            done()
        //        })
        //})

        it('Invalid emailAdress', (done) => { //TC-201-2
            chai
                .request(server)
                .post('/api/user')
                .send({
                    "firstName": "Test",
                    "lastName": "van den Test",
                    "isActive": 1,
                    "emailAdress": 6, //Invalid email address
                    "password": "secret",
                    "phoneNumber": "test",
                    "roles": "editor,guest",
                    "street": "Lovensdijkstraat",
                    "city": "Breda"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body;
                    status.should.equal(404);
                    result.should.be.an('string').that.equals("Email address must be a string")
                    done()
                })
        })

        it('Invalid password', (done) => { //TC-201-3
            chai
                .request(server)
                .post('/api/user')
                .send({
                    "firstName": "Test",
                    "lastName": "van den Test",
                    "isActive": 1,
                    "emailAdress": "testmail3462@gmail.com",
                    "password": 7,
                    "phoneNumber": "test",
                    "roles": "editor,guest",
                    "street": "Lovensdijkstraat",
                    "city": "Breda"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body;
                    status.should.equal(404);
                    result.should.be.an('string').that.equals("Password must be a string")
                    done()
                })
        })

        it('User already exists', (done) => { //TC-201-3
            chai
                .request(server)
                .post('/api/user')
                .send({
                    "firstName": "Mariëtte",
                    "lastName": "van den Dullemen",
                    "isActive": 1,
                    "emailAdress": "m.vandullemen@server.nl",
                    "password": "secret",
                    "phoneNumber": "",
                    "roles": "",
                    "street": "",
                    "city": ""
                })

                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body;
                    status.should.equal(404);
                    //result.should.be.an('string').that.equals("Password is invalid")
                    done()
                })
        })

        it('User successfully added', (done) => { //TC-201-3
            chai
                .request(server)
                .post('/api/user')
                .send({
                    "firstName": "Sucessful",
                    "lastName": "van den Test",
                    "isActive": 1,
                    "emailAdress": "testmail@gmail.com",
                    "password": "secret",
                    "phoneNumber": "test",
                    "roles": "editor,guest",
                    "street": "Lovensdijkstraat",
                    "city": "Breda"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body;
                    status.should.equal(200);
                    //result.should.be.an('string').that.equals("User added successfully")
                    done()
                })
        })
        //it('When required input is missing, return an error', (done) => {}) More testcases
    })
})