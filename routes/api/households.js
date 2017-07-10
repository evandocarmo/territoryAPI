var express = require('express');
var router = express.Router();
var pool = require('../../dbconnection.js');

/* GET territory listing. */
router.get('/', function(req, res, next) {
	console.log(req.query);
	if(req.query.cod_card_cod){
		if(req.query.cod_card_cod && req.query.cod_card_cod.constructor !== Array){
			console.log("not array");
			pool.getConnection(function(err,connection){
				if(err)
					return res.json(err);
				connection.query("select * from territory inner join cod_cards on cod_cards.cod_card = territory.cod_card where cod_cards.cod = ?",
					req.query.cod_card_cod,function(err,rows){
					console.log(rows);
					if(err){
						connection.release();
						return res.json(err);
					}
					connection.release();
					return res.json(rows);
				});
			});
			return;
		}
		if(req.query.cod_card_cod.constructor === Array){ //GET HOUSEHOLDS BY COD_CARD COD
			console.log(req.query.cod_card_cod);
			pool.getConnection(function(err,connection){
				if(err)
					return res.json(err);
				var query = "select * from territory inner join cod_cards on cod_cards.cod_card = territory.cod_card where ";
				for(var index in req.query.cod_card_cod){
		            var cod_card = req.query.cod_card_cod[index];
		            if(cod_card && index != 0)
		                query += " OR ";
		            if(cod_card)
		                query += "cod_cards.cod = '" + cod_card + "'";
	        	}
	        	console.log(query);
				connection.query(query,function(err,rows){
					if(err){
						connection.release();
						return res.json(err);
					}
					connection.release();
					return res.json(rows);
				});
			});
			return;
		}
	}
	else if(req.query.user){//GET HOUSEHOLDS HELD BY THAT USER
	pool.getConnection(function(err,connection){
	    if(err)
	        return res.json(err);
	    else {
	        connection.query("select * from territory where id = ?",req.query.user,function(err,rows){
	            if(err){
	            	connection.release();
	                return res.json(err);
	            }
	            else{
	            	connection.release();
	                return res.json(rows);
	            }
	        });
	    }	
	  });
	  return;
	}
	else if(req.query.cod){
		console.log(req.query.cod);
		console.log(req.query.cod.constructor);
		if(req.query.cod.constructor !== Array()){
			req.query.cod = req.query.cod.split(',');
    	}
		pool.getConnection(function(err,connection){
			if(err)
				return res.json(err);
			var query = "select * from territory where ";
			for(var index in req.query.cod){
		            var cod = req.query.cod[index];
		            if(cod && index != 0)
		                query += " OR ";
		            if(cod)
		                query += "cod = '" + cod + "'";
	        }
	        console.log(query);
	        connection.query(query,function(err,rows){
	        	if(err){
	        		connection.release();
	        		return res.json(err);
	        	}
	        	connection.release();
	        	return res.json(rows);
	        });
		});
		return;
	}
	pool.getConnection(function(err, connection) { //GET A CONNECTION FROM POOL
		if (err) {
			res.json({
				"code": 100,
				"status": "Database connection error"
			});
			return;
		} else { //CONNECTION TO DATABASE WAS SUCCESSFUL
			var query;
			if (req.query.available === "yes")
				query = "SELECT * FROM territory where available = 1";
			else if (req.query.available === "no")
				query = "SELECT * FROM territory where available = 0";
			// TODO: MOVE THIS TO INDEPENDENT ROUTE 'households/visit'
			else if (req.query.quantity) { //IF QUANTTY IS SET, USER HAS ALSO TO SELECT AN AREA
				var quantity = parseInt(req.query.quantity);
				var area_name = req.query.area_name;
				console.log(req.query);
				connection.query("select * from territory where available = 1 and area_name = ? and language != 'spanish' and language != 'french' and language != 'chinese' ORDER BY last_update LIMIT ?", [area_name,quantity], function(err, rows) {
					if (err) {
						connection.release();
						return res.json(err);
					} else {
						if (rows) {
							connection.release();
							console.log(rows);
							res.json(rows);
						} else {
							connection.release();
							res.json({
								"success": false,
								"message": "No matches"
							});
						}
					}

				});
				return;
			} else
				query = "SELECT *,DATE_FORMAT(LAST_UPDATE,'%d %b %y') as fLAST_UPDATE,DATE_FORMAT(TAKEN,'%d %b %y') as fTAKEN FROM territory";
			console.log(query);
			connection.query(query, function(err, rows) { //GET ALL ADDRESSES
				connection.release();
				if (err){
					connection.release();
					return res.json({
						success: false,
						message: err
					});
				}
				else if (rows) {
					return res.send(rows);
				} else {
					connection.release();
					return res.json({
						success: false,
						message: "Something went wrong."
					});
				}
			});
		}
	});
});

router.post("/", function(req, res) { //INSERT NEW HOUSEHOLD INTO TERRITORY
	pool.getConnection(function(err, connection) {
		if (err)
			return res.json({
				"success": false,
				"message": err
			});
		else {
			connection.query("INSERT INTO territory VALUES (?,?,?,?,?,?,?,NOW(),?,0,1,NULL,?,?,NULL);",
			[req.body.cod_card, req.body.area, req.body.area_number, req.body.address, req.body.language, req.body.comments, req.body.area_name, req.body.full_address, req.decoded.id, req.body.macroarea], function(err, rows) {
				connection.release();
				if (err)
					return res.json({
						"success": false,
						"message": err
					});
				else {
					res.json(rows);
				}
			});
		}
	});
});

router.put('/', function(req, res) { //UPDATES EXISTING HOUSEHOLD
	console.log(req.body);
	pool.getConnection(function(err, connection) {
		if (err)
			return res.json({
				"success": false,
				"message": err
			});
		else {
			var full_address = req.body.AREA + " " + req.body.AREA_NUMBER + " " + req.body.ADDRESS + " " + req.body.AREA_NAME + " Brasília DF";
			connection.query("UPDATE territory SET cod_card = ?, area = ?, area_number = ?, address = ?, language = ?, comments = ?, last_update = NOW(),full_address = ? where cod = ?",
				[req.body.COD_CARD, req.body.AREA, req.body.AREA_NUMBER, req.body.ADDRESS, req.body.LANGUAGE, req.body.COMMENTS,full_address, req.body.COD],
					function(err, rows) {
						connection.release();
						if (err)
							return res.json({
								"success": false,
								"message": err
							});
						else {
							console.log(rows);
							return res.json(rows);
						}
					});
			}
	});
});

router.put('/checkout',function(req,res){//CHECKOUT HOUSEHOLDS FOR PUBLISHER TO VISIT
	console.log(req.body);
	if(req.body.cod && req.body.user){//cod MUST BE AN ARRAY OF HOUSEHOLD CODES, USER IS THE ONE CHECKING THEM OUT
		pool.getConnection(function(err,connection){
			console.log("got connection");
			if(err)
				return res.json(err);
			else {
				var query = "UPDATE territory SET available = 0, taken = NOW(), ID = " + req.body.user + " WHERE ";
				for(var index in req.body.cod){
					var cod = req.body.cod[index];
					if(index != 0)
						query += "OR COD = " + cod +" ";
					else
						query += "COD = " + cod +" ";
				}
				console.log(query);
				connection.query(query,function(err,rows){
					connection.release();
					if(err)
						return res.json({
							"success":false,
							"message":err
						});
					else {
						connection.query("UPDATE users set visiting = visiting + ? where id = ?",[req.body.cod.length,req.body.user],function(err,userRows){
							if(err)
								return res.json(err);
							return res.json([rows,userRows]);
						});
					}
				})
			}
		})
		return;
	}
});

router.put('/return',function(req,res){//RETURN HOUSEHOLD TO POOL
	console.log(req.body);
    if (req.body.cod && req.body.user) {
        pool.getConnection(function(err,connection){
            if(err)
                return res.json(err);
            else {
                connection.query("UPDATE territory set available = 1, id = 0, last_update = NOW(), last_id = ? where cod = ?",
                    [req.body.user,req.body.cod],function(err,rows){
                    	connection.release();
                    	console.log("updating territory");
                        if(err)
                            return res.json(err);
                        else
                            connection.query("UPDATE users set visiting = (visiting - 1) where id = ?",[req.body.user],function(err,userRows){
                                console.log("updating users");
                                if(err)
                                    return res.json(err);
                                return res.json([rows,userRows]);
                            });
                    });
            }
        });
    } else { //WRONG QUERY
        return res.json("unsupported paremeter");
    }	
});

router.delete('/', function(req, res) { //DELETE EXISTING CARD
	if (!req.query.cod || !req.query.user) //REQUIRES PARAMETER "COD"
		return res.json({
			"success": false,
			"message": "Please, provide a cod"
		});
	pool.getConnection(function(err, connection) {
		if (err)
			return res.json({
				"success": false,
				"message": err
			});
		else {
			connection.query("INSERT INTO deletions SELECT * from territory where cod = ?", req.query.cod, function(err, rows1) { //SAVES DELETED HOUSEHOLD
				if (err)
					return res.json({
						"success": false,
						"message": err
					});
				else {
					connection.query("DELETE FROM territory WHERE cod = ?", req.query.cod, function(err, rows2) {
						connection.release();
						if (err)
							return res.json({
								"success": false,
								"message": err
							});
						res.json(rows2);
					});
				}
			});
		}
	});
});

module.exports = router;