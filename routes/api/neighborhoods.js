var express = require('express');
var router = express.Router();
var pool = require('../../dbconnection.js');

router.get('/macroarea',function(req,res){
    if(!req.query.macroarea)
        return res.json("Wrong paremeters");
        pool.getConnection(function(err,connection){
            if(err)
                return res.json(err);
            connection.query("SELECT distinct area_name, macroarea from cod_cards where macroarea = ? ",[req.query.macroarea],function(err,rows){
                if(err)
                    return res.json(err);
                return res.json(rows);
            });
        });
});

router.get('/',function(req,res){
        pool.getConnection(function(err,connection){
            if(err)
                return res.json(err);
            connection.query("SELECT distinct area_name,macroarea from cod_cards",function(err,rows){
                if(err)
                    return res.json(err);
                return res.json(rows);
            });
        });
});

module.exports = router;