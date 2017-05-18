var mysql = require('mysql');
var pool = mysql.createPool({
    host:'us-cdbr-iron-east-04.cleardb.net',
    user:'b9d470ad53730e',
    password:'d79fd4b8',
    database:'heroku_c993f4839b871ff'
});

module.exports = pool;