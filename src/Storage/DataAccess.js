
var FakeResponse = require ('../Storage/FakeResponse');
var DataConnection = require ('./DataConnection')

module.exports = {

    getAllProfiles: async function (limit = -1) {

        var profiles = null;
        var query = "SELECT * FROM store.twProfiles" + (limit !== -1 ? (" limit " + limit) : "");

        try {
            profiles = await DataConnection.executeQuery (query);
            //console.log("getAllProfiles end");
            //console.log(profiles);
        }
        catch (error) {
            console.log(error.error);
        }
        
        return profiles;
    }
    


}
