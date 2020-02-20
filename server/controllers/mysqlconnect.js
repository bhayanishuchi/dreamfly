const mysql = require('mysql');
var pool = {};
var config = {};

var config = require('../config/config')


function getPool(env) {
    if (typeof pool[env] === "undefined") {
        config[env] = {
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database,
            connectTimeout : 50000,
            charset: "utf8mb4_unicode_ci",
            multipleStatements: true
        };
        pool[env] = mysql.createPool(config[env]);
    }
}
module.exports = function(query, params = [], callback){
    var env = process.config.env;
    env = env? env: "DEV";
    getPool(env);

    var executeQuery = function(err, results){
        if(err) {
            console.log(err);
            if (err.code == 'POOL_CLOSED') {
                console.log("pool closed found, resetting pool");
                pool[env] = mysql.createPool(config[env]);
                pool[env].query(query, params, executeQuery);
                return;
            }
            callback('Connection timeout try again.', null);
        } else {
            callback(null, results);
        }
    }
    pool[env].query(query, params, executeQuery);
};


// defines app specific callback...
function myCleanup(code) {
    var env = process.config.env;
    env = env? env: "DEV";
    console.log(`App specific cleanup code...: ${code}`);
    pool[env].end(function(e){
        console.log('cleanup code called with');
        console.log(e);
        delete pool[env];
    });
};
