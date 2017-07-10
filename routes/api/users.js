var express = require('express');
var router = express.Router();
var pool = require('../../dbconnection.js');
var crypt = require('crypt3/sync');

/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.query.maxed === 'no'){//GET ONLY THE USERS WHO ARE NOT MAXED OUT FOR RESEARCH WORK
       pool.getConnection(function(err,connection){
        if(err)
            return res.json(err);
        else {
            connection.query("select id,name,privilege, max, holding from users WHERE holding <= max",function(err,rows){
                connection.release();
                if(err)
                    return res.json(err);
                else
                    return res.json(rows);
            });
        }
      }); 
    return;
  } else if(req.query.maxed === 'yes'){ //GET ONLY MAXED OUT USERS FOR RESEARCH WORK
    pool.getConnection(function(err,connection){
        if(err)
            return res.json(err);
        else {
            connection.query("select id,name,privilege,max,holding from users where holding >= max",function(err,rows){
                connection.release();
                if(err)
                    return res.json(err);
                else
                    return res.json(rows);
            });
        }
      });
    return;
  }
  else if(req.query.maxedVisits === 'no'){//GET ONLY THE USERS WHO ARE NOT MAXED OUT FOR VISIT WORK
       pool.getConnection(function(err,connection){
        if(err)
            return res.json(err);
        else {
            connection.query("select id,name,privilege, max_visiting, visiting from users WHERE visiting <= max_visiting",function(err,rows){
                connection.release();
                if(err)
                    return res.json(err);
                else
                    return res.json(rows);
            });
        }
      }); 
    return;
  } else if(req.query.maxedVisits === 'yes'){ //GET ONLY MAXED OUT USERS FOR RESEARCH WORK
    pool.getConnection(function(err,connection){
        if(err)
            return res.json(err);
        else {
            connection.query("select id,name,privilege,max_visiting,visiting from users where visiting >= max_visiting",function(err,rows){
                connection.release();
                if(err)
                    return res.json(err);
                else
                    return res.json(rows);
            });
        }
      });
    return;
  }else if(req.query.info){
      if(req.query.info === "me"){
        req.query.info = req.decoded.id;
      }
      pool.getConnection(function(err,connection){
          if(err)
            return res.json(err);
          connection.query("select id,name,privilege,max,holding,max_visiting,visiting from users where id = ?",[req.query.info],function(err,rows){
            connection.release();
              if(err)
                return res.json(err);
              return res.json(rows);
          });
      });
      return;
  }
  pool.getConnection(function(err,connection){
    if(err)
        return res.json(err);
    else {
        connection.query("select id,name,privilege,max,holding,max_visiting,visiting from users",function(err,rows){ //GET ALL USERS
            connection.release();
            if(err)
                return res.json(err);
            else
                return res.json(rows);
        });
    }
  });
});

router.post("/",function(req,res){
    if(req.body.name && req.body.password && req.body.privilege){//CHECK IF ALL PAREMETERS HAVE BEEN SENT
        var hash = crypt(req.body.password, hash); //GENERATE HASH
        var max = req.body.privilege === 'ELDER' ? 10 : 3; //SET MAX NUMBERS DEPENDING ON PRIVILEGE
        var max_visiting = req.body.privilege === 'ELDER' ? 30 : 20;
        pool.getConnection(function(err,connection){
            if(err)
                return res.json(err);
            connection.query("SELECT name from users",function(err,rows){
                if(err)
                    return res.json(err);
                for(var i = 0; i < rows.length; i++){ //CHECK IF NAME IS ALREADY TAKEN
                    if(rows[i].name === req.body.name){
                        return res.json({success:false,message:"Sorry. This name is already taken"});
                    }
                }
                console.log(max_visiting);
                connection.query("INSERT INTO users (ID,NAME,PRIVILEGE,HASH,REGISTERED_BY,MAX,HOLDING,MAX_VISITING,VISITING) \
                values (NULL,?,?,?,?,?,0,?,0)",[req.body.name,req.body.privilege,hash,req.decoded.id,max,max_visiting],function(err,userRows){
                    connection.release();
                    if(err)
                        return res.json(err);
                    return res.json(userRows);
                });
            });
        });
    } else{//WONRG PAREMETERS
        return res.json("Wrong paremeters");
    }
});

router.delete("/",function(req,res){
    console.log(req.body);
   if(!req.query.user)
    return res.json("Please select a publisher to be deleted");
    //BEFORE DELETING PUBLISHER, TRANSFER ALL HIS CURRENT CARDS AND HOUSEHOLDS BACK TO POOL
    pool.getConnection(function(err,connection){
        if(err)
            return res.json(err);
        connection.query("UPDATE cod_cards set available = 1, id = 0, last_update = NOW(), last_id = 0 where id = ?",[req.body.user],function(err,cardRows){
                                  if(err)
                                    return res.json(err);
                                  connection.query("UPDATE territory set available = 1, id = 0, last_update = NOW(), last_id = 0 where id = ? ",[req.query.user],function(err,territoryRows){
                                      if(err)
                                        return res.json(err);
                                      connection.query("DELETE FROM users WHERE id = ?",[req.query.user],function(err,deleteRows){
                                        connection.release();
                                        if(err)
                                            return res.json(err);
                                        return res.json([cardRows,territoryRows,deleteRows]);
                                      });
                                  });
                              });
    });
});
router.put('/password',function(req,res){//CHANGE PASSWORD
    console.log(req);
    if(!req.body.user && req.body.password)
        return res.json("Please provide a user and a new password");
    var hash = crypt(req.body.password,hash);
    console.log(hash);
    pool.getConnection(function(err,connection){
        if(err)
            return res.json(err);
        connection.query("UPDATE users SET hash = ? where id = ?",[hash,req.body.user],function(err,rows){
            connection.release();
            if(err)
                return res.json(err);
            return res.json(rows);
        });
    });
});

router.put('/',function(req,res){
    console.log(req.body);
    if(req.body.id){
        pool.getConnection(function(err,connection){
            if(err)
                return res.json(err);
            connection.query("UPDATE users set name = ?,privilege = ?,max = ?,holding = ?, max_visiting = ?, visiting = ? where id = ?",
            [req.body.name,req.body.privilege,req.body.max,req.body.holding,req.body.max_visiting,req.body.visiting,req.body.id],function(err,rows){
                connection.release();
                if(err)
                    return res.json(err);
                return res.json(rows);
            });
        });
    }
});

module.exports = router;