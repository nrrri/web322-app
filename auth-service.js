//
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
var userSchema = new Schema({
    "userName": { // must be unique
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
});

let User; // to be defined on new connection (see initialize)

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://#####.rq2o9d4.mongodb.net/web322-app")

        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};


module.exports.registerUser = function(userData) {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("PASSWORDS DO NOT MATCH")
        } else {
            bcrypt.hash(userData.password, 10).then((hash) => {
                userData.password = hash
                let newUser = new User(userData)
                newUser.save().then(() => {
                    resolve()                                                   // created success!
                }).catch((err) => {
                    if(err.code == 11000) {                                     // error == 11000
                        console.log("USERNAME TAKEN")
                        reject("USERNAME ALREADY TAKEN!")
                    } else {
                        reject("There was an error creating the user: " + err)  // error != 11000
                        
                    }
                })
            }).catch((err) => {
                console.log(err)
                reject("PASSWORD ENCRYPTION ERROR")                             // error encrypt
            })

        }
    })
}
    

module.exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {
        User.findOne({ userName: userData.userName })
            .exec().then((users) => {
                if (!users) {
                    reject("Unable to find user:" + userData.userName)
                } else {
                    bcrypt.compare(userData.password, users.password)
                        .then((res) => {
                            if (res == true) {
                                  // 1 push loginHistory
                                  users.loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent })
                                  // 2 update user
                                  User.updateOne(
                                      { userName: users.userName },
                                      { $set: { loginHistory: users.loginHistory } }
                                  ).exec().then((() => {
                                          resolve(users);
                                      })).catch((err) => {
                                          reject("There was an error verifying the user: " + err)
                                      })
                            } else { // password is not matched
                                reject("Incorrect Password for user: " + userData.userName)
                              
                            }
                        })
                }
            }).catch((err) => {
                console.log(err)
                reject("Unable to find user : " + userData.userName)
            })
    })
}
