const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const database = []

chai.should()
chai.use(chaiHttp)

describe('Manage users /api/user', () => {
    describe('UC-201 Register as a new user', () => {
        beforeEach((done) => {
            database = []
            done()
        })

        it('When a required input is missing, a valid error should be returned', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .send({
                    //"firstName": "John", Firstname mist
                    "lastName": 'Doe',
                    "emailAdress": "test@gmail.com",
                    "password": "pixar"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body;
                    status.should.equal(404);
                    result.should.be.an('string').that.equals("firstName must be a string")
                    done()
                })
        })
        //it('When required input is missing, return an error', (done) => {}) More testcases
    })
})