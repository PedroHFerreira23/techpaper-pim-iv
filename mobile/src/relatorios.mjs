const brl=n=>Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const dia=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(d));
export function relatorio(tipo,d,inicio='',fim=''){
 if(tipo==='Movimentações'){
  const header=['Data','Produto','Tipo','Quantidade','Motivo','Responsável'];
  return [header,...d.movimentacoes.filter(m=>(!inicio||dia(m.dataHora)>=inicio)&&(!fim||dia(m.dataHora)<=fim)).map(m=>[new Date(m.dataHora).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}),m.produtoNome,m.tipo==='Saida'?'Saída':'Entrada',m.quantidade,m.motivo,m.responsavel])];
 }
 return [['SKU','Produto','Categoria','Saldo','Custo unitário','Valor em estoque'],...d.produtos.filter(p=>tipo!=='Estoque crítico'||p.estoque<20).map(p=>[p.sku,p.nome,p.categoria,p.estoque,brl(p.precoCusto),brl(p.precoCusto*p.estoque)])];
}
export const csv=rows=>'\ufeff'+rows.map(r=>r.map(v=>{let t=String(v??'');if(/^[=+@\-\t\r]/.test(t))t="'"+t;return '"'+t.replaceAll('"','""')+'"';}).join(';')).join('\r\n');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const tabelaHtml=(title,rows)=>'<!doctype html><html lang="pt-BR"><meta charset="utf-8"><style>body{font:14px sans-serif;color:#12374e}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #aaa;padding:6px;text-align:left}</style><h1>'+esc(title)+'</h1><table>'+rows.map((r,i)=>'<tr>'+r.map(v=>i?'<td>'+esc(v)+'</td>':'<th>'+esc(v)+'</th>').join('')+'</tr>').join('')+'</table></html>';
