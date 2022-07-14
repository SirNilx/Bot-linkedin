const puppeteer = require('puppeteer');
const credentials = require('./credentials.json');
let navPage = 1;
let totalClickableElements = 0;

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://www.linkedin.com');

    await makeAuth(page);

    await page.waitForNavigation();

    await sleep(5000);

    console.log("Iniciando o robô!");

    await navigatePages(page, navPage)
    if (totalClickableElements > 0) {
        console.log(`Consegui me conectar com ${totalClickableElements} pessoas!`);
        
    } else{console.log("Não consegui me conectar com ninguém");}
    console.log("Encerrando robô!");

    await browser.close();
})();

async function navigatePages(page, navigationPage) {
    const searchTerm = encodeURI('recursos humanos ti');
    await page.goto(`https://www.linkedin.com/search/results/people/?keywords=${searchTerm}&origin=FACETED_SEARCH&sid=Feu&page=${navigationPage}`);

    await sleep(2000);

    const resultsPage = await page.$$('.reusable-search__result-container')
    const getClickableElements = await page.$$('.reusable-search__result-container .entity-result .entity-result__item .entity-result__actions:not(.entity-result__actions--empty)');

    console.log("Foram encontrados " + resultsPage.length + " resultados para o termo " + searchTerm + " na pagina " + navPage);
    console.log("Dos resultados encontrados, " + getClickableElements.length + " são clicáveis (possuem o botão de 'conectar')");

    totalClickableElements += getClickableElements.length;

    for (let cont = 0; cont < resultsPage.length; cont++) {
        const result = resultsPage[cont];
        const block = await result.$('.entity-result__content.entity-result__divider.pt3.pb3.t-12.t-black--light > div.mb1 > div.t-roman.t-sans > div > span.entity-result__title-line.entity-result__title-line--2-lines > span > a > span > span:nth-child(1)');

        if (!block) continue;        
       
        let name = (await block.getProperty('innerHTML')).toString();

        const cleanName = name ? name.split("JSHandle:")[1].toString().replace(/<!---->/g, '').replace(/[^a-z0-9 ]/gi, '') : "erro";

        const connectar = await result.$('.entity-result__actions.entity-result__divider > div > button');
        if(!connectar){
            totalClickableElements--;
            continue;
        }
        await connectar.click('.entity-result__actions.entity-result__divider > div > button');

        await sleep(2000);

        const addNote = await page.$('[aria-label="Adicionar nota"]');
       
        await addNote.click('[aria-label="Adicionar nota"]');
        await sleep (1000);
        await page.keyboard.type('Olá me chamo Nilton, sou estudante de programação pelo DevPlay. Está mensagem não foi enviada por mim. Ela foi enviada por um robô que criei para auxiliar no contato com empregadores e mostrar um pouco do que sei fazer. Aqui está meu gitHub, link: https://github.com/SirNilx Agradeço pela atenção!');

        const sendNote = await page.$('[aria-label="Enviar agora"]');

        await sendNote.click('[aria-label="Enviar agora"]');

        await sleep(5000);

    }
    
    navPage++

    if (navPage <= 2) {
        await navigatePages(page, navPage)
    }
}

async function makeAuth(page) {

    await page.waitForSelector('input[id="session_key"]')
    await page.waitForSelector('input[id="session_password"]')
    await page.waitForSelector('.sign-in-form__submit-button')


    const inputEmail = await page.$('input[id="session_key"]')
    if (!inputEmail) {
        throw new Error('Email não encontrado');
    }

    await page.focus('input[id="session_key"]');
    await page.keyboard.type(credentials.email);

    await sleep(2000);

    const inputPassword = await page.$('input[id="session_password"]');
    if (!inputPassword) {
        throw new Error('Senha não econtrada');
    }

    await page.focus('input[id="session_password"]');
    await page.keyboard.type(credentials.senha);

    await sleep(2000);

    await page.click('.sign-in-form__submit-button');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


