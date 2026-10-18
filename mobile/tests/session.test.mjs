import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionScope } from '../src/session.mjs';
const deferred = () => { let resolve; const promise = new Promise(r => { resolve=r; }); return { promise, resolve }; };

test('resposta da conta antiga não pode atualizar a conta seguinte', async () => {
 const scope=createSessionScope(); const accountA=scope.begin(); const response=deferred(); let screen='';
 const sync=response.promise.then(value=>{if(scope.current(accountA))screen=value;});
 scope.begin(); screen='conta B'; response.resolve('dados da conta A'); await sync;
 assert.equal(screen,'conta B');
});
test('logout limpa armazenamento depois de gravação que já estava em voo', async () => {
 const scope=createSessionScope();const account=scope.begin(); const started=deferred();const finish=deferred();let saved;
 const writing=scope.write(account,async()=>{started.resolve();await finish.promise;saved='token antigo';});
 await started.promise;scope.begin();const cleanup=scope.cleanup(()=>{saved=null;});
 finish.resolve();await Promise.all([writing,cleanup]);assert.equal(saved,null);
});
test('gravação enfileirada de sessão inválida é descartada', async () => {
 const scope=createSessionScope();const old=scope.begin();const blocking=deferred();
 const barrier=scope.cleanup(()=>blocking.promise);let leaked=false;
 const oldWrite=scope.write(old,()=>{leaked=true;});scope.begin();blocking.resolve();
 await Promise.all([barrier,oldWrite]);assert.equal(leaked,false);
});
test('falha de persistência não bloqueia limpeza e novo login', async () => {
 const scope=createSessionScope();const first=scope.begin();let state='';
 await assert.rejects(scope.write(first,()=>{throw Error('storage');}));
 scope.begin();await scope.cleanup(()=>{state='limpo';});const next=scope.begin();
 await scope.write(next,()=>{state='conta nova';});assert.equal(state,'conta nova');
});
