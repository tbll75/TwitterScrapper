
var FakeResponse = require ('../Storage/FakeResponse');
var DataConnection = require ('./DataConnection')

module.exports = {

    getAllProfiles: async function (limit = -1, order = "", showFullLog = false) {

        //console.log("getAllProfiles");
        var profiles = null;
        var query = "SELECT * FROM store.twProfiles "
                        + order + " "
                        + (limit !== -1 ? ("limit " + limit) : "") + " ";

        //console.log(query);

        try {
            profiles = await DataConnection.executeQuery (query, showFullLog);
            //console.log("getAllProfiles end");
            //console.log(profiles);
        }
        catch (error) {
            console.log(error.error);
        }
        
        return profiles;
    }
    


}
