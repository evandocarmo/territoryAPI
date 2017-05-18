var express = require('express');
var router = express.Router();
var pool = require('../dbconnection.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  pool.getConnection(function(err,connection){
  if (err) {
    res.json({"code" : 100, "status" : "Error in connection database"});
    return;
  } 
  console.log('connected as id ' + connection.threadId);
  connection.query("select name from users",function(err,rows){
      connection.release();
      if(!err) {
          res.json(rows);
      }           
  });
});
});

module.exports = router;
