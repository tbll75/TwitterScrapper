//var mysql = require('mysql');
var mysql = require('mysql2/promise');
const util = require('util');
const logger = require ('../Util/Logger');

var con;


module.exports = {

    createConnection: async function ()
    {
        logger.info("createConnection start");

        con = await mysql.createConnection({
            //host: "localhost",
            host: "twitterscrapper.cfc6fjzutal3.eu-west-1.rds.amazonaws.com",
            user: "root",
            password: "bob110891",
            database: "store"
        });

        //logger.info("createConnection end");
    },

    executeQuery: async function (sql, params, showFullLog) {

        await con;

        if (showFullLog) 
        {
            logger.info("executeQuery: " + sql);
            logger.info("params: " + JSON.stringify(params));
        }

        try {
            let [rows, fields] = await con.query(sql, params);
            return rows;
        }
        catch (error) {
            logger.info(error.message);
            throw error;
        }
    }

}
