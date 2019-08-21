
const logger = require ('./Logger');

module.exports = {

    asyncForEach: async function (ar, callback)
    {
        for (let i = 0; i < ar.length; i++) {

            //logger.info("i: " + i);
            await callback.call(ar, i, ar[i], ar);
        }
    },
    
     asyncMap: function(callback)
    {
        return Promise.resolve(this).then(async (ar) =>
        {
            const out = [];
            for(let i=0;i<ar.length;i++)
            {
                out[i] = await callback.call(ar, i, ar[i], ar);
            }
            return out;
        });
    },

}