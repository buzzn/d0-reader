const config = require('config')
const Auth = require('../libs/Auth')
const Mock = require('./Mock')

const chai = require('chai')
var expect = chai.expect

const redis = require('../libs/redis')

let username = 'user@email.com'
let password = 'xxxxxxxx'

describe('Auth', () => {
    var auth, mock

    before(() => {
        mock = new Mock()
        auth = new Auth()
    })

    after(() => {
        auth.reset(() => {
            mock.cleanAll()
        })
    })

    it('does not login with incorrect username and password', (done) => {
        let mockResponse = mock.oauthTokenViaPasswordInvalidGrant()

        auth.login({
            username: username,
            password: password
        }, (error, response) => {
            if (error) {
                expect(error).to.deep.equal(mockResponse)
                done()
            } else {
                console.log(response);
            }
        })
    })


    it('does login with correct username and password', (done) => {
        mock.oauthTokenViaPassword()
        let mockResponse = mock.usersMe()
        auth.login({
            username: username,
            password: password
        }, (error, response) => {
            if (error) {
                console.error(error);
            } else {
                expect(JSON.parse(response)).to.deep.equal(mockResponse.data)
                done()
            }
        })
    })


    it('does get currect token', (done) => {
        redis.get('token', (error, record) => {
            if (error) {
                console.error(error);
            } else {
                let token = JSON.parse(record)
                auth.getToken((error, response) => {
                    if (error) {
                        console.error(error);
                    } else {
                        expect(response).to.deep.equal(token)
                        done()
                    }
                })
            }
        })
    })


    it('does get a new token after two hours', (done) => {
        mock = new Mock({
            date: new Date(2016, 8, 20, 2)
        })
        let mockResponse = mock.oauthTokenViaRefreshToken()
        auth.getToken((error, response) => {
            if (error) {
                console.error(error);
            } else {
                expect(JSON.parse(response)).to.deep.equal(mockResponse)
                done()
            }
        })
    })


    it('does logout and reset the meter', (done) => {
        let mockResponse = mock.oauthRevoke()
        auth.logout((error, response) => {
            if (error) {
                console.error(error)
            } else {
                expect(response).to.deep.equal(mockResponse)
                done()
            }
        })
    })




})
