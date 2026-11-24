import assert from 'node:assert/strict';
import test from 'node:test';
import {relatorio,csv,tabelaHtml} from '../src/relatorios.mjs';
test('relatório em Brasília usa o dia anterior à meia-noite UTC e inclui a última data',()=>{
 const r=relatorio('Movimentações',{movimentacoes:[{dataHora:'2026-11-24T01:15:00Z',tipo:'Saida',quantidade:5,produtoNome:'Caderno'}]},'2026-11-23','2026-11-23');
 assert.equal(r.length,2);assert.equal(r[1][3],5);
});
test('estoque crítico e exportações preservam valores e tratam texto como texto',()=>{
 const d={produtos:[{sku:'=1',nome:'A & B',estoque:19,precoCusto:2},{sku:'X',nome:'Outro',estoque:20,precoCusto:8}]};
 const r=relatorio('Estoque crítico',d);assert.equal(r.length,2);assert.match(csv(r),/"'=1"/);assert.match(tabelaHtml('Estoque',r),/A &amp; B/);
});
