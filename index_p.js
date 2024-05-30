import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://chatgpt.com/');

    const s = await page.waitForSelector("#prompt-textarea", { timeout: 10000 });
    if (s) {
        let valorT;
        valorRetornado = await page.evaluate(async () => {
            return new Promise(resolve => {
                document.querySelector("#prompt-textarea").value = 'faz um site moderno de vendas de telefones,  com header, menu, main, footer, bem elaborado e com muito detalhe no html e css tudo num arquivo só';
                document.querySelector("#prompt-textarea").dispatchEvent(new Event('input', { bubbles: true }));
                setTimeout(() => {        
                    document.querySelector('button[data-testid="send-button"]').click();
                    resolve(true)
                }, 1000);
            });
        });

        valorT = await page.evaluate(() => {
            return new Promise((response) => {
                setTimeout(() => {
                    let int = setInterval(() => {
                        const elementos = document.querySelectorAll('div[data-message-author-role="assistant"]');
                        if(elementos.length > 0){
                            const ultimoElemento = elementos[elementos.length - 1];
                            let v = false
                            ultimoElemento.querySelectorAll('*').forEach(a => {
                                estiloElemento = window.getComputedStyle(a, '::after');
                                if (estiloElemento.content !== 'none') {
                                    v = true
                                }
                                });
                                if(!v){
                                    clearInterval(int)
                                    response(elementos[elementos.length - 1].querySelector('code').textContent)
                                }
                        }
                    }, 1000)
                }, 1000)
            })
        })
        console.log(valorT)
    }
})();