var express = require('express');
var router = express.Router();
var pool = require('../dbconnection.js');
var crypt = require('crypt3/sync');
var jwt = require('jsonwebtoken');
var config = require('../config');
var User = require('../models/User.js');

router.post('/', function(req, res, next) {
    console.log(req);
  	if (!req.body.username || !req.body.password) {
  		res.send({success:false,message:"Please, insert correct name and password"});
  		return;
  	} else {
  		pool.getConnection(function(err, connection) {
  			if (err) {
  				res.json({
  					"code": 100,
  					"status": "Error in connection database"
  				});
  				return;
  			}
  			connection.query("select * from users where name = ?", [req.body.username], function(err, rows) {
  				if (err) {
  					res.json({success:false, message: err});
  				}
  				console.log(rows);
  				if (!err && Object.keys(rows).length > 0) {
  				  var user = new User(rows[0]['ID'],rows[0]['NAME'],rows[0]['PRIVILEGE'],rows[0]['REGISTERED_BY'],rows[0]['MAX'],rows[0]['HOLDING'],rows[0].MAX_VISITING,rows[0].VISITING);
  				  var hash = rows[0]['HASH'];
  					if (crypt(req.body.password, hash) === hash) {
              var token = jwt.sign(user, config.secret, {
              expiresInMinutes: 1440
              });
              res.json({
                success: true,
                message: user.name + ' is logged in!',
                token: token
              });
  				  } else {
  					res.json({success:false,message:"access denied"});
  			  	}
  			  } else {
  			    res.json({success:false,message:"access denied"});
  			  }
  				connection.release();
  			});
  		});
  	}
});

module.exports = router;