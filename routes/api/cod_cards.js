var express = require('express');
var router = express.Router();
var pool = require('../../dbconnection.js');
var json2xls = require('json2xls');
var fs = require('fs');

router.get('/', function(req, res) { //LIST COD_CARDS
    var query = "SELECT *,DATE_FORMAT(LAST_UPDATE,'%d %b %y') as LAST_UPDATE,DATE_FORMAT(TAKEN,'%d %b %y') as TAKEN FROM cod_cards";
    var counter = 0;
    for (var property in req.query) {
        if (req.query.hasOwnProperty(property)) {
            if(property === "excel"){
                console.log('excel');
                continue;
            }
            if (counter === 0)
                query += " WHERE ";
            else
                query += " AND ";
            if (property === "available"){
                var available = req.query.available == "yes" ? 1 : 0;
                query += "available = " + available;
            }
            else if(property === "user")
                query += "id = " + req.query.user;
            else if(property === "macroarea")
                query += "macroarea = '" + req.query.macroarea + "'";
            else if(property === "area_name")
                query += "area_name = '" + req.query.area_name + "'";
            else if(property === "last")
                query += "TAKEN BETWEEN NOW() - INTERVAL " + req.query.last + " DAY AND NOW()";
            else if(property === "more_than")
                query += "TAKEN < NOW() - INTERVAL " + req.query.more_than + " DAY";
            else if(property === "cod"){
                query += "cod === " + req.query.cod;
        } else {
            return res.json({
                "success":false,
                "message": property + " is not an accepeted query"
            });
        }
        counter++;
        }
    }
    pool.getConnection(function(err,connection){
        if(err)
            return res.json(err);
        else {
            console.log(query);
            connection.query(query,function(err,rows){
                connection.release();
                if(err)
                    return res.json(err);
                else if(req.query.excel){
                    console.log(rows);
                    var xls = json2xls(rows);
                    fs.writeFileSync('routes/api/territory.xlsx', xls, 'binary');
                    res.download('routes/api/territory.xlsx');
                    return;
                }
                return res.json(rows);
            });
        }
    });
});

router.put('/checkout', function(req, res) {
    
    //CHECKOUT ONE OR MORE COD_CARDS FOR THIS USER
    console.log(req.body);
    if (req.body.user && req.body.cod && req.body.cod.constructor === Array) {
        var query = "UPDATE cod_cards SET id = ?, available = 0, taken = NOW() WHERE ";
        for(var index in req.body.cod){
            var cod = req.body.cod[index];
            if(cod && index != 0)
                query += " OR ";
            if(cod)
                query += "cod = " + cod;
        }
        console.log(query);
        pool.getConnection(function(err,connection){
            if(err)
                return res.json(err);
            else {
                connection.query(query,req.body.user,function(err,rows){
                    if(err)
                        return res.json(err);
                    else
                        connection.query("UPDATE users set holding = holding + ? where id = ?",[req.body.cod.length,req.body.user],function(err,userRows){
                            connection.release();
                            if(err)
                                return res.json(err);
                            return res.json([rows,userRows]);
                        });
                });
            }
        });
        
    } else {
        return res.json("Unsupported parameters");
    }
});

router.put('/return', function(req, res) {
    if (req.body.cod && req.body.user) {
        //RETURN COD_CARD TO POOL
        pool.getConnection(function(err,connection){
            if(err)
                return res.json(err);
            else {
                connection.query("UPDATE cod_cards set available = 1, id = 0, last_update = NOW(), last_id = ? where cod = ?",
                    [req.body.user,req.body.cod],function(err,rows){
                        if(err)
                            return res.json(err);
                        else
                            connection.query("UPDATE users set holding = holding - 1 where id = ?",[req.body.user],function(err,userRows){
                                connection.release();
                                if(err)
                                    return res.json(err);
                                return res.json([rows,userRows]);
                            })
                    });
            }
        });
    } else { //WRONG QUERY
        return res.json("unsupported paremeter");
    }
});

router.post('/', function(req, res) {
    if (req.body.area && req.body.area_name && req.body.area_number && req.body.macroarea) {
        //CREATE NEW COD_CARD
        pool.getConnection(function(err,connection){
            if(err)
                return res.json(err);
            else {
                connection.query("INSERT INTO cod_cards (cod_card, area,area_name,area_number,macroarea,available,id) \
                VALUES(?,?,?,?,?,1,0)",
                [req.body.area + req.body.area_number,req.body.area,req.body.area_name,req.body.area_number,req.body.macroarea],
                function(err,rows){
                        connection.release();
                        if(err)
                            return res.json(err);
                        else
                            return res.json(rows);
                    });
            }
        });    
    } else {
        console.log(req.body);
        return res.json('wrong parameters');
    }
});

router.delete('/', function(req, res) {
    if (req.query.cod) {
        //DELETE COD_CARD
        pool.getConnection(function(err,connection){
            if(err)
                return res.json(err);
            else {
                connection.query("DELETE FROM cod_cards where cod = ?",req.query.cod,function(err,rows){
                    connection.release();
                    if(err)
                        return res.json(err);
                    return res.json(rows);
                });
            }
        });
    }
});

module.exports = router;