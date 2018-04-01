const needle = require('needle');
const cheerio = require('cheerio');
const moment = require('moment');
const _ = require('lodash');
const fs = require('fs');
const util = require('util');

const options = { headers: { 'Content-Type': 'application/json' } };

module.exports = function (loopbackApplication){
   return {
    appDevelopment: appDevelopment,
    evryAppManagement: evryAppManagement,
    appOperations: appOperations,
    dataOperations: dataOperations
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

async function evryAppManagement(app){
    let result = [];
    const URL = app.get('evryUrl')+'consulting/application-management/';
    const html = await getHTML(URL);
    let $ = cheerio.load(html.body, {
        normalizeWhitespace: true
    });
    const article = 'html body div.evo-container div.evo-container-inner section.article-module div';
    $(`${article}`).attr('data-block', 'h2')
    .each((index, chunk) => {
        result.push($(chunk).text().split("\n").filter((value => {
            return (value.replace(/\s/g, '')) 
        })));
    });
    const json = [];
    result = _.flatten(result);

    // Application management
    for (let i=2; i<10; i++) {
        json.push({
            category: 'Application management',
            text: result[i]
        });
    }

    fsWriteFile = util.promisify(fs.writeFile);
    await fsWriteFile('../datasets/application-management.json', JSON.stringify(json));
    console.log("file saved");
}

async function appOperations(app){
    let result = [];
    const URL = app.get('evryUrl')+'infrastructure/application-operations/';
    const html = await getHTML(URL);
    let $ = cheerio.load(html.body, {
        normalizeWhitespace: true
    });
    const article = 'html body div.evo-container div.evo-container-inner section.article-module div';
    $(`${article}`).attr('data-block', 'h2')
    .each((index, chunk) => {
        result.push($(chunk).text().split("\n").filter((value => {
            return (value.replace(/\s/g, '')) 
        })));
    });
    const json = [];
    result = _.flatten(result);
    for (let i=7; i<39; i++) {
        json.push({
            category: 'Application operations',
            text: result[i]
        });
    }
    fsWriteFile = util.promisify(fs.writeFile);
    await fsWriteFile('../datasets/application-operations.json', JSON.stringify(json));
    console.log("file saved");
}

async function dataOperations(app){
    let result = [];
    const URL = app.get('evryUrl')+'infrastructure/database-operations/';
    const html = await getHTML(URL);
    let $ = cheerio.load(html.body, {
        normalizeWhitespace: true
    });
    const article = 'html body div.evo-container div.evo-container-inner section.article-module div';
    $(`${article}`).attr('data-block', 'h2')
    .each((index, chunk) => {
        result.push($(chunk).text().split("\n").filter((value => {
            return (value.replace(/\s/g, '')) 
        })));
    });
    const json = [];
    result = _.flatten(result);

    for (let i=1; i<6; i++) {
        json.push({
            category: 'Database operations',
            text: result[i]
        });
    }
    for (let i=15; i<23; i++) {
        json.push({
            category: 'Database operations',
            text: result[i]
        });
    }
    fsWriteFile = util.promisify(fs.writeFile);
    await fsWriteFile('../datasets/database-operations.json', JSON.stringify(json));
    console.log("file saved");
}

async function mainCrawler(){
    let result = [];
    const URL = 'https://www.evry.com/en/what-we-do/services-a-z/services-a-z/';
    const html = await getHTML(URL);
    let $ = cheerio.load(html.body, {
        normalizeWhitespace: true
    });
    const article = 'html body div.evo-container div.evo-container-inner section.focus-module #block_51627';
    $(`${article}`)
    .each((index, chunk) => {
        $(chunk).attr('data-block','news').children('a').each(async (childIndex, childChunk) => {
            const html = await getHTML(childChunk);
            const childArticle = 'html body div.evo-container div.evo-container-inner section.article-module div';
            $(`${childArticle}`).attr('data-block', 'h2')
            .each((index, chunk) => {
                result.push($(chunk).text().split("\n").filter((value => {
                    return (value.replace(/\s/g, '')) 
                })));
            });
            const json = [];
            result = _.flatten(result);
            fsWriteFile = util.promisify(fs.writeFile);
            await fsWriteFile('../datasets/maindataset.json', JSON.stringify(json));
            console.log("file saved");
        });
    });
    const json = [];
    result = _.flatten(result);
}



async function getHTML(URL) {   
    return new Promise( (resolve, reject) => {
        needle.get(URL,(err, data) => {
            if (err) getHTML(URL);
            resolve(data);
        });
    });
}


