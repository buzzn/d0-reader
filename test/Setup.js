const setup = require('../libs/setup')
const Auth = require('../libs/Auth')
const Mock = require('./Mock')

const chai = require('chai')
var expect = chai.expect

let username = 'user@email.com'
let password = 'xxxxxxxx'

describe('Setup', () => {
    var auth, mock, rawSML

    before(() => {
        auth = new Auth()
        mock = new Mock()

        rawSML =
            "\n\
    /ESY5Q3DA1004 V3.04\n\
    \
    1-0:0.0.0*255(60327685)\n\
    1-0:1.8.0*255(00000000.6400000*kWh)\n\
    1-0:21.7.0*255(000000.10*W)\n\
    1-0:41.7.0*255(000002.00*W)\n\
    1-0:61.7.0*255(000000.50*W)\n\
    1-0:1.7.0*255(000002.60*W)\n\
    1-0:96.5.5*255(60)\n\
    0-0:96.1.255*255(1ESY1160327685)\n\
    !"
    })


    after(() => {
        auth.reset(() => {
            mock.cleanAll()
        })
    })


    it('does not init Setup with loggedIn false', (done) => {
        setup.init(rawSML)
            .then(
                resolved => {},
                rejected => {
                    expect(rejected.message).to.equal('noAuth')
                    done()
                }
            )
    })




    it('does not init Setup with loggedIn true and foreign existing meter', (done) => {
        mock.oauthTokenViaPassword()
        mock.usersMe()
        mock.userMetersEmpty()
        let mockResponse = mock.createExistingMeter()

        auth.login({
                username: username,
                password: password
            })
            .then(
                resolve => {
                    return setup.init(rawSML)
                }
            )
            .then(
                resolved => {
                    console.log(resolved);
                },
                rejected => {
                    let firstError = mockResponse.errors[0] // really ugly
                    expect(rejected.message).to.deep.equal(firstError.detail)
                    done()
                }
            )
    })



    it('does init Setup with loggedIn true and created meter and inRegister', (done) => {
        mock.oauthTokenViaPassword()
        mock.usersMe()
        mock.userMetersEmpty()
        let mockResponse = mock.createMeter()
        mock.createRegister('in')

        auth.login({
                username: username,
                password: password
            })
            .then(
                resolve => setup.init(rawSML)
            )
            .then(
                resolved => {
                    expect(JSON.parse(resolved)).to.deep.equal(mockResponse.data)
                    done()
                }
            )
    })



    it('does init Setup with loggedIn true and with existing meter', (done) => {
        mock.oauthTokenViaPassword()
        mock.usersMe()
        let mockResponse = mock.userMeters()
        mock.createReading()

        auth.login({
                username: username,
                password: password
            })
            .then(
                resolve => setup.init(rawSML)
            )
            .then(
                resolved => {
                    expect(JSON.parse(resolved)).to.deep.equal(mockResponse.data[0])
                    done()
                }
            )
    })




})
