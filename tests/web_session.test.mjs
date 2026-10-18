import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const script=readFileSync(new URL('../api/wwwroot/app.js',import.meta.url),'utf8');
function harness(fetcher) {
 const nodes=new Map();
 const node=()=>({hidden:false,open:false,children:[],setAttribute(){},addEventListener(){},append(...values){this.children.push(...values);},appendChild(value){this.children.push(value);return value;},replaceChildren(...values){this.children=values;},querySelector(){return null;},close(){this.open=false;}});
 const document={querySelector(selector){if(!nodes.has(selector))nodes.set(selector,node());return nodes.get(selector);},createElement:node,createTextNode:text=>({textContent:text})};
 const context=vm.createContext({document,Node:Object,fetch:fetcher,AbortController,URL,crypto:globalThis.crypto,setInterval(){},setTimeout(){return 1;},clearTimeout(){},console});
 // Skip only the automatic startup request; all tested functions are production code.
 vm.runInContext(script.slice(0,script.lastIndexOf("api('usuarios/me').then"))+"\nrenderLogin=()=>{};render=()=>{};",context);
 return { context,nodes,eval:code=>vm.runInContext(code,context) };
}
test('encerrar sessão remove dados administrativos, relatos e diálogo',()=>{
 const h=harness();h.eval("state.user={id:1};state.usuarios=[{name:'Admin'}];state.relatos=[{descricao:'reservado'}];state.produtos=[{}];state.page='Usuários';modal.open=true;clearSession();");
 assert.equal(h.eval('state.user'),null);assert.equal(h.eval('state.page'),'Resumo');assert.equal(h.eval('state.usuarios.length+state.relatos.length+state.produtos.length'),0);assert.equal(h.eval('modal.open'),false);
});
test('sincronização atrasada não restaura a sessão encerrada',async()=>{
 const waiting=[];const h=harness(()=>new Promise(resolve=>waiting.push(resolve)));
 h.eval("state.user={id:1,role:'Admin'}");const sync=h.eval('refresh()');const rejected=assert.rejects(sync,e=>e.stale===true);
 h.eval('clearSession()');for(const resolve of waiting)resolve({ok:true,status:200,json:async()=>({id:1})});
 await rejected;assert.equal(h.eval('state.user'),null);assert.equal(h.eval('state.usuarios.length'),0);
});
test('401 restaura login e apaga coleções da conta anterior',async()=>{
 const h=harness(async()=>({ok:false,status:401,json:async()=>({message:'expirada'})}));
 h.eval("state.user={id:1};state.orcamentos=[{cliente:'Cliente A'}]");await assert.rejects(h.eval("api('usuarios/me')"),e=>e.status===401);
 assert.equal(h.eval('state.user'),null);assert.equal(h.eval('state.orcamentos.length'),0);
});
test('erro de formulário é apresentado dentro do diálogo aberto',()=>{
 const h=harness();h.eval("modal.open=true;notify('Falha ao salvar');");const content=h.nodes.get('#modal-content');
 assert.equal(content.children.at(-1).textContent,'Falha ao salvar');assert.equal(h.nodes.get('#notice')?.textContent,undefined);
});
