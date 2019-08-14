//var mysql = require('mysql');
var mysql = require('mysql2/promise');
const util = require('util');

var con;


module.exports = {

    createConnection: async function ()
    {
        console.log("createConnection start");

        con = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "bob110891",
            database: "store"
        });

        //console.log("createConnection end");
    },

    executeQuery: async function (sql, params, showFullLog) {

        await con;

        //console.log("executeQuery: " + sql +  " / params: " + JSON.stringify(params));
        if (showFullLog) console.log("executeQuery: " + sql);

        try {
            let [rows, fields] = await con.query(sql, params);
            return rows;
        }
        catch (error) {
            console.log(error.message);
            throw error;
        }
    }

}
