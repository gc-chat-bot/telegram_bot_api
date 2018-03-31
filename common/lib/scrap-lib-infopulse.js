const needle = require('needle');
const cheerio = require('cheerio');
const moment = require('moment');
const _ = require('lodash');
const fs = require('fs');
const util = require('util');

const options = { headers: { 'Content-Type': 'application/json' } };

module.exports = function (loopbackApplication){
   return {
    appDevelopment: appDevelopment
   };
}

async function appDevelopment(app) {
    let result = [];
    const URL = app.get('scrapUrl')+ '/software-engineering/application-development';
    const html = await getHTML(URL);
    let $ = cheerio.load(html.body, {
        normalizeWhitespace: true
    });
    const article = 'html body main div.content-container div.single-wrapper div.content-wrapper div.post-content article';
    $(`${article}`)
    .each((index, chunk) => {
        result.push($(chunk).text().split("\n").filter((value => {
            return (value.replace(/\s/g, '')) 
        })));
    });
    const json = [];
    result = _.flatten(result);

    //Major Types of Applications
    for (i=0; i<= 17; i++) {
        json.push({
            category: result[8],
            text: result[8+i]
        });
    }
  
    //Application Development: Facts & Figures
    for (i=0; i<= 4; i++) {
        json.push({
            category: result[3],
            text: result[3+i]
        });
    }

    //Scope of Application Development Services
    for (i=0; i<=21; i++) {
        json.push({
            category: result[26],
            text: result[26+i]
        });
    }

    //Related Case Studies
    for (i=0; i<=8; i++) {
        json.push({
            category: result[48],
            text: result[48+i]
        });
    }
    
    fsWriteFile = util.promisify(fs.writeFile);
    await fsWriteFile('../datasets/application-development.json', JSON.stringify(json));
    console.log("file saved");
}


async function getHTML(URL) {   
    return new Promise( (resolve, reject) => {
        needle.post(URL,{},options,(err, data) => {
            if (err) getHTML(URL);
            resolve(data);
        });
    });
}


