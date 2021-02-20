let e = require('express');
let a = e();
let bodyParser = require('body-parser');
let s = require('express-session')
let m = require('memorystore')(s);
let fs = require('fs');
let h = require('helmet');
a.use(h());
a.use(s({
  secret: 'wikipages.md:verysecretkey',
  store: new m({
      ttl: 60 *60*1000,
      checkPeriod: 20 *60*1000
  }),
  resave: false,
  rolling: true,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true, sameSite: true }
}));
a.use(e.static(__dirname+"/www"));
a.use(e.json());
a.post("/login/:user", (req,res) => {
  let userdir;
  if (req.params.user === "admin") {
    userdir = __dirname;
  } else {
    userdir = __dirname+"/userdata/"+req.params.user;
  }
  fs.readFile(userdir+"/.pwhash",'utf8',(err,pwd) => {
    if (err) {
      res.status(424).send("424 - failed dependency - no .pwhash file for this user found (user is locked or does not exist)");
      return;
    }
    if (req.body.pwhash === pwd) {
      req.session.user = req.params.user;
      req.session.authenticated = true;
      if (req.params.user === "admin") {userdir += "/publicdata";}
      req.session.dir = userdir;
      res.send(req.params.user);
    } else {
      res.status(406).send("406 - not acceptable - wrong password");
    }
  });
});
a.get("/heartbeat", (req,res) => {
  if (req.session.user) res.send({username: req.session.user, validUntil: Date.now()+1800000});
  else res.status(401).send("401 - unauthorized - you need to login to trigger the heartbeat");
});
a.delete("/logout/:user", (req,res) => {
  req.session.destroy();
  res.send(req.params.user);
});
a.put("/adminapi", (req,res) => {
  fs.readFile(__dirname+"/.pwhash",'utf8',(err,pwd) => {
    if (err) {
      res.status(424).send("424 - failed dependency - no .adminpwhash file on root directory found (admin features disabled)");
      return;
    }
    if (req.body.adminpwhash === pwd) {
      if (req.body.usertoedit === "admin") {
        res.status(403).send("403 - forbidden - you cannot edit the admin user from the web.");
        return;
      }
      if (req.body.operation === "create") {
        fs.mkdir(__dirname+"/userdata/"+req.body.usertoedit+"/public", {recursive: true}, (err) => {
          if(err) {
            res.status(500).send("500 - internal server error - could not create directory");
            return;
          }
          fs.copyFile(__dirname+"/userdata/.userbackup/README.md",__dirname+"/userdata/"+req.body.usertoedit+"/README.md",fs.constants.COPYFILE_EXCL, (err) => {
            if(err) {
              res.status(409).send("409 - conflict - user already exists");
              return;
            }
            fs.copyFile(__dirname+"/userdata/.userbackup/public/index.md",__dirname+"/userdata/"+req.body.usertoedit+"/public/index.md",fs.constants.COPYFILE_EXCL, (err) => {
              if(err) {
                res.status(409).send("409 - conflict - user already exists");
                return;
              }
              fs.writeFile(__dirname+"/userdata/"+req.body.usertoedit+"/.pwhash", req.body.newusrpw, (err) => {
                if(err) {
                  res.status(500).send("500 - internal server error - could not write to file");
                  return;
                }
                res.send("operationcompletedsuccessfully");
              });
            });
          });
        });
      }
      else if (req.body.operation === "passwd") {
        fs.writeFile(__dirname+"/userdata/"+req.body.usertoedit+"/.pwhash", req.body.newusrpw, (err) => {
          if(err) {
            res.status(500).send("500 - internal server error - could not write to file");
            return;
          }
          res.send("operationcompletedsuccessfully");
        });
      }
      else if (req.body.operation === "lock") {
        fs.rename(__dirname+"/userdata/"+req.body.usertoedit+"/.pwhash", __dirname+"/userdata/"+req.body.usertoedit+"/.locked", (err) => {
          if (err) {
            res.status(409).send("409 - conflict - user already locked");
            return;
          }
          res.send("operationcompletedsuccessfully");
        });
      }
      else if (req.body.operation === "unlock") {
        fs.rename(__dirname+"/userdata/"+req.body.usertoedit+"/.locked", __dirname+"/userdata/"+req.body.usertoedit+"/.pwhash", (err) => {
          if (err) {
            res.status(409).send("409 - conflict - user already unlocked");
            return;
          }
          res.send("operationcompletedsuccessfully");
        });
      }
      else if (req.body.operation === "delete") {
        fs.rmdir(__dirname+"/userdata/"+req.body.usertoedit, {recursive: true}, (err) => {
          if(err) {
            res.status(500).send("500 - internal server error - could not delete folder");
            return;
          }
          res.send("operationcompletedsuccessfully");
        });
      }
      else {
        res.status(400).send("400 - bad request - operation not implemented");
      }
    } else {
      res.status(406).send("406 - not acceptable - wrong password");
    }
  });
});
a.get("/privateuserdata/:user*?", (req,res) => {
  let authenticated = req.session.authenticated;
  if (authenticated) {
    res.sendFile(req.session.dir+req.params[0], (err) => {
      if(err) {
        res.sendFile(req.session.dir+"/index.md", (err) => {
          if(err) res.sendFile(__dirname+"/publicdata/index.md");
        });
      }
    });
  } else {
    res.status(403).send("403 - forbidden - you need to login to access this resource");
  }
});
a.post("/privateuserdata/:user*?", (req,res) => {
  let authenticated = req.session.authenticated;
  if (authenticated) {
    if (req.body.type === "file") {
      fs.appendFile(req.session.dir+req.params[0], "", (err) => {
        if(err) {
          res.status(500).send("500 - internal server error - could not create or open file");
          return;
        }
        res.send(req.params[0]);
      });
    }
    else if (req.body.type === "folder") {
      fs.mkdir(req.session.dir+req.params[0], {recursive: true}, (err) => {
        if(err) {
          res.status(500).send("500 - internal server error - could not create directory");
          return;
        }
        res.send(req.params[0]);
      });
    }
  } else {
    res.status(403).send("403 - forbidden - you need to login to access this resource");
  }
});
a.put("/privateuserdata/:user*?", (req,res) => {
  let authenticated = req.session.authenticated;
  if (authenticated) {
    fs.writeFile(req.session.dir+req.params[0], req.body.data, (err) => {
      if(err) {
        res.status(500).send("500 - internal server error - could not write to file");
        return;
      }
      res.send(req.params[0]);
    });
  } else {
    res.status(403).send("403 - forbidden - you need to login to access this resource");
  }
});
a.delete("/privateuserdata/:user*?", (req,res) => {
  let authenticated = req.session.authenticated;
  if (authenticated) {
    if (req.body.type === "file") {
      fs.unlink(req.session.dir+req.params[0], (err) => {
        if(err) {
          res.status(500).send("500 - internal server error - could not delete file");
          return;
        }
        res.send(req.params[0]);
      });
    }
    else if (req.body.type === "folder") {
      fs.rmdir(req.session.dir+req.params[0], {recursive: true}, (err) => {
        if(err) {
          res.status(500).send("500 - internal server error - could not delete folder");
          return;
        }
        res.send(req.params[0]);
      });
    }
  } else {
    res.status(403).send("403 - forbidden - you need to login to access this resource");
  }
});
a.get("/privateuserfilelist/:user*?", (req,res) => {
  let authenticated = req.session.authenticated;
  if (authenticated) {
    fs.readdir(req.session.dir+req.params[0], {withFileTypes: true}, (err,files) => {
      if (err) {
        res.status(404).send("404 - not found - the specified resource cannot be found");
        return;
      }
      let filelist = [];
      let directorylist = [];
      files.forEach(file => {
        if(!file.name.startsWith(".")) {
          if (file.isFile()) filelist.push(file.name);
          if (file.isDirectory()) directorylist.push(file.name);
        }
      });
      res.send({directories: directorylist, files: filelist});
    });
  } else {
    res.status(403).send("403 - forbidden - you need to login to access this resource");
  }
});
a.get("/publicuserdata/:user*?", (req,res) => {
  fs.access(__dirname+"/userdata/"+req.params.user+"/.pwhash", fs.constants.F_OK, (err) => {
    if(err) {
      res.sendFile(__dirname+"/publicdata/defaultuserindex.md");
      return;
    }
    res.sendFile(__dirname+"/userdata/"+req.params.user+"/public"+req.params[0], (err) => {
      if(err) {
        res.sendFile(__dirname+"/userdata/"+req.params.user+"/public"+"/index.md", (err) => {
          if(err) res.sendFile(__dirname+"/publicdata/defaultuserindex.md");
        });
      }
    });
  });
});
a.get("/:path*", (req,res) => {
  if (req.params.path === "publicdata") {
    res.sendFile(__dirname+"/publicdata"+req.params[0], (err) => {
      if(err) res.sendFile(__dirname+"/publicdata/index.md");
    });
  } else {
    res.sendFile(__dirname + "/www/index.html");
  }
});
if(process.argv[2] === "-p") {
  a.listen(8000,()=>{console.log("serving wikipages.md ("+__dirname+") on port 8000")});
} else {
  a.listen(8000,'localhost',()=>{console.log("serving wikipages.md ("+__dirname+") on localhost port 8000. Start with -p to serve public.")});
}
