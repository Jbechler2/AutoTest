import puppeteer from "puppeteer";

async function getBunnies(){
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
    }); 


const page = await browser.newPage();

const url = 'http://localhost:3004/'

await page.goto(url);

const form = await page.$('#root > div > ul > button:nth-child(7)');

page.on("console", msg => console.log(msg.text()));

let value = await form.evaluate( form => form.click());

let options = {
    idleTime: 50000,
    timeout: 50000
}

// await delay(200000);

await waitForNetworkIdle(page, 10000)

browser.close();

}

function delay(time){
    return new Promise(function(resolve){
        setTimeout(resolve, time)
    });
}

function waitForNetworkIdle(page, timeout, maxInflightRequests = 0){
    page.on('request', onRequestStarted);
    page.on('requestfinished', onRequestFinished);
    page.on('requestfailed', onRequestFinished);

    let inflight = 0;
    let fulfill;
    let promise = new Promise(x => fulfill = x);
    let timeoutId = setTimeout(onTimeoutDone, timeout);
    return promise;


    function onTimeoutDone(){
        page.removeListener('request', onRequestStarted);
        page.removeListener('requestfinished', onRequestFinished)
        page.removeListener('requestfailed', onRequestFinished)
        fulfill();
    }

    function onRequestStarted(){
        ++inflight;
        if(inflight > maxInflightRequests)
            clearTimeout(timeoutId);
    }

    function onRequestFinished(){
        if(inflight == 0)
            return;
        --inflight;
        if(inflight === maxInflightRequests)
            timeoutId = setTimeout(onTimeoutDone, timeout);
    }
}

getBunnies();
