var express = require('express');
var router = express.Router();
var pool = require('../../dbconnection.js');

router.get('/',function(req,res){
    pool.getConnection(function(err,connection){
        if(err)
            return res.json(err);
        connection.query("SELECT distinct macroarea from cod_cards",function(err,rows){
            if(err)
                return res.json(err);
            var result = [];
            for(var index in rows){
                result.push(rows[index].macroarea);
            }
            console.log(result);
            return res.json(result);
        });
    });
});

module.exports = router;