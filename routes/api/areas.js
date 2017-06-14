var express = require('express');
var router = express.Router();
var pool = require('../../dbconnection.js');

router.get('/',function(req,res){
    if(!req.query.neighborhood)
        return res.json("Please, provide a neighborhood")
    pool.getConnection(function(err,connection){
        if(err)
            return res.json(err);
        connection.query("SELECT distinct area from cod_cards where area_name = ?",[req.query.neighborhood],function(err,rows){
            if(err)
                return res.json(err);
            var result = [];
            for(var index in rows){
                result.push(rows[index].area);
            }
            console.log(result);
            return res.json(result);
        });
    });
});

module.exports = router;