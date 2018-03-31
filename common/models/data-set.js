'use strict';
const scrap = require('../lib/scrap-lib-infopulse')();

module.exports = function(Dataset) {
    Dataset.appDevelopment = function(cb) {
        console.log("work");
        const data  = scrap.appDevelopment(Dataset.app);
        data.then((data) =>{
            cb(null, data);
        });
    }

    Dataset.remoteMethod('appDevelopment', {
        returns: { arg: 'result', type: 'object', root:true },
        http: {path: '/appDevelopment', verb: 'get'}
    });
};
