import express from 'express';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
dotenv.config();
import bodyParser from 'body-parser'; 
import cors from 'cors';

const app = express();
const port = 3001;
let values = [];

app.use(cors())
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/create-page', validateToken);

function validateToken(req, res, next) {
    let v = createToken(process.env.token_access);
    if (v == req.headers.authorization) {
        next();
    } else {
        res.status(401).send("Token Error");
    }
}

app.post('/create-page', async (req, res) => {
    try {
       let browser = await puppeteer.launch({headless: false, });
        let page = await browser.newPage();
        await page.goto('https://chatgpt.com/');
        const s = await page.waitForSelector("#prompt-textarea", { timeout: 50000 });
        console.log(req)
        if (s) {
            let valorT;
            const s = setTimeout(() => {
                valorT = validateCodeProblem()
                values.push({user: req.body.user, data: valorT });
                res.send(values)
            }, 50000)

            valorT = await handlePageInteraction(page, req.body.text);
            clearTimeout(s)
            values.push({user: req.body.user, data: valorT });

        } else {
            values.push({ message: null });
        }
        const indices = values
        .map((element, index) => ({ user: element.user, index }))
        .filter(obj => obj.user === req.body.user)
        .map(obj => obj.index); 

        
        await browser.close();
        res.send({message: values[indices[0]]})
        

        for(let i = 0; indices.length > i; i++){
            values.splice(i, 1)
        }
    } catch (error) {
        console.error("Error occurred:", error);
        values.push({ message: null });
        res.status(500).send("Internal Server Error");
    }
});



async function handlePageInteraction(page, text) {
    try{
        const _v = process.env.seletor
        await page.evaluate(async (text, seletor) => {
            return new Promise(resolve => {
                const esperarSeletor = (s) => {
                    return new Promise((response) => {
                        let count = 0
                        const interval = setInterval(() => {
                            count++
                            if(!!document.querySelector(s) || count > 1000){
                                setTimeout(() => {
                                    response(true)
                                    clearInterval(interval)
                                }, 500)
                            }
                        }, 100)
                    })
                }
                document.querySelector("#prompt-textarea").value = `${text},  com header, menu, main, footer, bem elaborado e com muito detalhe no html e css tudo num arquivo só, como code para copiar o codigo`;
                document.querySelector("#prompt-textarea").dispatchEvent(new Event('input', { bubbles: true }));
                setTimeout(async () => {   
                    esperarSeletor('button[data-testid="send-button"]')     
                    let v = !!document.querySelector('button[data-testid="fruitjuice-send-button"]') ? document.querySelector('button[data-testid="fruitjuice-send-button"]') : document.querySelector('button[data-testid="send-button"]')
                    v.click();
                    resolve(true)
                }, 1000);
            });
        },text, _v);
    
        const valorT = await page.evaluate(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    let int = setInterval(() => {
                        let elementos = document.querySelectorAll('div[data-message-author-role="assistant"]');
                        if (elementos.length > 0) {
                            let ultimoElemento = elementos[elementos.length - 1];
                            let v = false;
                            ultimoElemento.querySelectorAll('*').forEach(a => {
                                estiloElemento = window.getComputedStyle(a, '::after');
                                if (estiloElemento.content !== 'none' && estiloElemento.content == '"●"') {
                                    v = true;
                                }
                            });
                             console.log(v)
                            if (!v) {
                                clearInterval(int);
                                let value = !!elementos[elementos.length - 1].querySelector('code').textContent ? elementos[elementos.length - 1].querySelector('code').textContent : null;
                                resolve(value)
                            }
                        }
                    }, 1000);
                }, 10000);
            });
        });
    
        return valorT;
    } catch (error) {
        return null
    }
}

function createToken(_token){
  if(process.env.token_access == _token){
    let _ = new Date()
    const originalString = `${_.getDate()}${_.getHours()}${_.getMonth()}${_.getFullYear()}${_token}`;
    const encodedString = Buffer.from(originalString).toString('base64')
    return encodedString;
  }else{
    return false
  }
}


async function validateCodeProblem(page, seletor){
    const element = await page.$(seletor); 
    if (element) {
        return await page.evaluate(element => element.textContent, element);
    }
    return null
}

process.on('SIGINT', async () => {
    process.exit();
});

app.get('/get-token', (request, response) => {
    let v = createToken(request.headers.authorization)
    if(!!v){
        response.send({access_token: v})
    }else{
        response.status(401).send("Unauthorized");
    }
})

app.get('/status', (request, response) => {
    response.json({ message: 'server on' });
});

app.get('/get-values', (req, res) => {
    res.json(values);
});

app.use(express.static('front-dist'))

app.listen(port, () => {
    console.log(`Servidor Express rodando em http://localhost:${port}`);
});
