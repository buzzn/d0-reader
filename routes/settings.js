var express = require('express');
var router = express.Router();
var rest = require('restler');

var redis = require('redis');
var redisClient = redis.createClient();

router.get('/edit', function(req, res) {
  redisClient.mget(['host', 'token', 'meterId'], function(err, reply) {

    if(reply[0] == null){
      var hostValue = "https://app.buzzn.net"
    }else{
      var hostValue = reply[0]
    }

    if(reply[1] == null){
      var tokenValue = "add_your_token_here"
    }else{
      var tokenValue = reply[1]
    }

    if(reply[2] == null){
      var meterIdValue = "add_your_meter_id_here"
    }else{
      var meterIdValue = reply[2]
    }

    res.render('settings_edit', { host: hostValue, token: tokenValue, meterId: meterIdValue  });
  });

});

router.post('/save', function(req, res) {
  var host = req.body.host;
  var token = req.body.token;
  var meterId = req.body.meterId;
  rest.get(host + '/api/v1/users/me',{
    accessToken: token
  }).on('success', function(data) {
    redisClient.set('host', host);
    redisClient.set('token', token);
    redisClient.set('meterId', meterId);
    redisClient.set('user', data['data']['attributes']['email']);
    res.redirect("/");
  }).on('fail', function(data) {
    res.redirect('back');
  });
});


module.exports = router;
