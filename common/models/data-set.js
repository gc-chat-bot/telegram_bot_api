'use strict';
const scrap = require('../lib/scrap-lib-infopulse')();

module.exports = function(Dataset) {
    Dataset.appDevelopment = function(cb) {
        const data  = scrap.appDevelopment(Dataset.app);
        data.then((data) =>{
            cb(null, data);
        });
    }

    Dataset.evryAppManagement = function(cb) {
        const data  = scrap.evryAppManagement(Dataset.app);
        data.then((data) =>{
            cb(null, data);
        });
    }
    
    Dataset.evryAppOperations = function(cb) {
        const data  = scrap.appOperations(Dataset.app);
        data.then((data) =>{
            cb(null, data);
        });
    }

    Dataset.remoteMethod('appDevelopment', {
        returns: { arg: 'result', type: 'object', root:true },
        http: {path: '/appDevelopment', verb: 'get'}
    });

    Dataset.remoteMethod('evryAppManagement', {
        returns: { arg: 'result', type: 'object', root:true },
        http: {path: '/evryAppManagement', verb: 'get'}
    });
};
