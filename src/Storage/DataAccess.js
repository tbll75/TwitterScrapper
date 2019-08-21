
var FakeResponse = require ('../Storage/FakeResponse');
var DataConnection = require ('./DataConnection')
const logger = require ('../Util/Logger');

module.exports = {

    getAllProfiles: async function (limit = -1, order = "", showFullLog = false) {

        //logger.info("getAllProfiles");
        var profiles = null;
        var query = "SELECT * FROM store.twProfiles "
                        + order + " "
                        + (limit !== -1 ? ("limit " + limit) : "") + " ";

        //logger.info(query);

        try {
            profiles = await DataConnection.executeQuery (query, showFullLog);
            //logger.info("getAllProfiles end");
            //logger.info(profiles);
        }
        catch (error) {
            logger.info(error.error);
        }
        
        return profiles;
    }
    


}
