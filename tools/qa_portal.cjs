const {chromium}=require('playwright');const fs=require('fs');
if(!['127.0.0.1','localhost','[::1]'].includes(new URL(process.env.TP_TEST_URL).hostname)||process.env.TP_TEST_ALLOW_MUTATIONS!=='1')throw Error('Use uma base local exclusiva de ensaio.');
const cap=process.env.CAPDIR||fs.mkdtempSync(require('path').join(require('os').tmpdir(),'techpaper-'));
(async()=>{const b=await chromium.launch({executablePath:process.env.TP_CHROME||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
try{
const pg=await b.newPage({viewport:{width:1366,height:768}});const errors=[];pg.on('pageerror',e=>errors.push(String(e)));
await pg.route('**/*',r=>new URL(r.request().url()).origin===new URL(process.env.TP_TEST_URL).origin?r.continue():r.abort());await pg.goto(process.env.TP_TEST_URL);
await pg.locator('[name=login]').fill(process.env.TP_TEST_LOGIN);await pg.locator('[name=password]').fill(process.env.TP_TEST_PASSWORD);await pg.getByRole('button',{name:'Entrar',exact:true}).click();await pg.locator('.workspace').waitFor();if(await pg.locator('dialog[open]').count()) {await pg.getByRole('radio').first().click();await pg.locator('dialog[open]').waitFor({state:'hidden'});}
async function nav(name){if(await pg.locator('.menu-button').isVisible())await pg.locator('.menu-button').click();await pg.getByRole('button',{name:'Abrir '+name,exact:true}).click();await pg.waitForTimeout(30);}
const rows=[];for(const width of [320,390,768,1366]){
 await pg.setViewportSize({width,height:800});for(const name of ['Resumo','Produtos','Fornecedores','Estoque','Movimentações','Orçamentos','Relatórios','Usuários','Inclusão','Conta']){
 await nav(name); rows.push(await pg.evaluate(({width,name})=>({width,name,doc:document.documentElement.scrollWidth,focus:document.activeElement.id}),{width,name}));
 }}
await nav('Relatórios');const dl=pg.waitForEvent('download');await pg.getByRole('button',{name:'Exportar CSV'}).click();let csv=fs.readFileSync(await(await dl).path(),'utf8');if(!csv.includes('PIM-DEMO-036'))throw Error('Produto ausente do CSV');
await nav('Orçamentos');await pg.getByRole('button',{name:'Novo orçamento',exact:true}).click();await pg.locator('[name=quantidade]').fill('1000000');await pg.getByRole('button',{name:'Adicionar item'}).click();await pg.locator('[name=quantidade]').fill('1');await pg.getByRole('button',{name:'Adicionar item'}).click();let cart=await pg.locator('dialog tbody').innerText();await pg.locator('dialog').getByRole('button',{name:'Cancelar',exact:true}).click();
await nav('Produtos');await pg.locator('main input').first().fill('PIM-DEMO-020');if(await pg.locator('main tbody tr').count()!==1)throw Error('Filtro de produto');
await nav('Resumo');await pg.screenshot({path:cap+'/portal-desktop.png'});await pg.setViewportSize({width:390,height:844});await pg.screenshot({path:cap+'/portal-390.png'});
await pg.setViewportSize({width:1366,height:800});
await nav('Conta'); const theme=pg.getByRole('button',{name:/Usar tema (escuro|claro)/});const orig=await pg.locator('html').getAttribute('data-theme');
await theme.click();await pg.waitForFunction(t=>document.documentElement.dataset.theme!==t,orig);await theme.click();await pg.waitForFunction(t=>document.documentElement.dataset.theme===t,orig);
await nav('Orçamentos');
const draft=pg.locator('main tr').filter({hasText:'Rascunho'}).first();await draft.getByRole('button',{name:'Abrir',exact:true}).click();
await pg.route('**/api/orcamentos/*/status',r=>r.fulfill({status:409,contentType:'application/json',body:JSON.stringify({message:'Orçamento já atualizado.'})}));
const approve=pg.getByRole('button',{name:'Aprovar',exact:true});await approve.click();await pg.getByRole('alert').filter({hasText:'Orçamento já atualizado.'}).waitFor();if(!await approve.isEnabled())throw Error('Ação indisponível depois de conflito');
await pg.getByRole('button',{name:'Fechar',exact:true}).click();
await pg.getByRole('button',{name:'Sair',exact:true}).click();await pg.getByRole('button',{name:'Entrar',exact:true}).waitFor();
console.log(JSON.stringify({rows,cart,errors,csv:true,tema:true,conflitoSimulado:true,logout:true},null,2));if((rows.some(r=>r.doc>r.width||r.focus!=='main')||cart.includes('1000001')||errors.length))throw Error('Regressão de navegação, largura ou carrinho');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
