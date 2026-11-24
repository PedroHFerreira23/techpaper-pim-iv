import React,{useState} from 'react';
import {Alert,View} from 'react-native';
import {File,Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import {csv,relatorio,tabelaHtml} from './relatorios.mjs';
const specs={
 Produtos:{path:'produtos',one:'produto',name:'nome',fields:[['sku','SKU'],['nome','Nome'],['categoria','Categoria'],['fornecedorId','Fornecedor'],['precoCusto','Preço de custo'],['precoVenda','Preço de venda']]},
 Fornecedores:{path:'fornecedores',one:'fornecedor',name:'nomeFantasia',fields:[['cnpj','CNPJ'],['razaoSocial','Razão social'],['nomeFantasia','Nome fantasia'],['segmento','Segmento'],['telefone','Telefone'],['email','E-mail'],['prazoEntregaDias','Prazo de entrega (dias)']]},
 Usuários:{path:'usuarios',one:'usuário',name:'name',fields:[['name','Nome'],['login','E-mail'],['password','Senha'],['role','Perfil']]},
};
const tipos=['Estoque atual','Estoque crítico','Movimentações'];
const cats=['Cadernos','Escrita','Material escolar','Organização','Artes','Papelaria','Outros'];
export const imprimirOrcamento=o=>Print.printAsync({html:tabelaHtml('Orçamento #'+o.id+' · '+o.cliente,[['Produto','Quantidade','Preço unitário (R$)','Subtotal (R$)'],...o.itens.map(i=>[i.produtoNome,i.quantidade,i.precoUnitario,i.subtotal]),['Total (R$)','','',o.total],['Validade',o.validade.slice(0,10),'Status',o.status],['Observações',o.observacoes||'','','']])});
export function Gestao({tab,data,user,busy,operar,ui}){
 const {Card,Text,Field,Button,s}=ui;
 const [form,setForm]=useState(null),[busca,setBusca]=useState(''),[tipo,setTipo]=useState(tipos[0]),[de,setDe]=useState(''),[ate,setAte]=useState('');
 const run=fn=>operar(fn);const spec=specs[tab];
 const allowUser=user.role==='Admin',manager=allowUser||user.role==='Supervisor';
 if(tab==='Usuários'&&!allowUser)return null;
 if(tab==='Relatórios'){
  const rows=relatorio(tipo,data,de,ate), valid=(!de||/^\d{4}-\d{2}-\d{2}$/.test(de))&&(!ate||/^\d{4}-\d{2}-\d{2}$/.test(ate))&&(!de||!ate||de<=ate);
  return <><Card>{tipos.map(v=><Button key={v} title={v} secondary={tipo!==v} onPress={()=>setTipo(v)}/>)}{tipo==='Movimentações'&&<><Field label="De (AAAA-MM-DD)" value={de} onChangeText={setDe}/><Field label="Até (AAAA-MM-DD)" value={ate} onChangeText={setAte}/>{!valid&&<Text>Confira o período informado.</Text>}</>}
  <Button title="Exportar CSV" disabled={busy||!valid} onPress={()=>run(async()=>{if(!await Sharing.isAvailableAsync())throw Error('Compartilhamento indisponível neste aparelho.');const f=new File(Paths.cache,'techpaper-'+Date.now()+'.csv');try{f.create();f.write(csv(rows));await Sharing.shareAsync(f.uri,{mimeType:'text/csv',dialogTitle:'Salvar ou compartilhar relatório'});}finally{if(f.exists)f.delete();}})}/>
  <Button title="Imprimir / salvar PDF" disabled={busy||!valid} onPress={()=>run(()=>Print.printAsync({html:tabelaHtml(tipo,rows)}))}/></Card><Text>{rows.length-1} registro(s)</Text>{rows.slice(1).map((r,i)=><Card key={i}>{r.map((v,j)=><Text key={j}>{rows[0][j]}: {String(v)}</Text>)}</Card>)}</>;
 }
 if(tab==='Movimentações')return <><Field label="Buscar movimentação" value={busca} onChangeText={setBusca}/>{data.movimentacoes.filter(m=>(m.produtoNome+' '+m.motivo+' '+m.responsavel).toLowerCase().includes(busca.toLowerCase())).map(m=><Card key={m.id}><Text style={s.label}>{m.produtoNome} · {m.tipo==='Saida'?'Saída':'Entrada'} de {m.quantidade}</Text><Text>{m.motivo}</Text><Text>{m.responsavel} · {new Date(m.dataHora).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})}</Text></Card>)}</>;
 if(!spec)return null;
 const records=data[spec.path]||[];
 const saldo=form?.estoque||0;
 const edit=r=>setForm({...r,role:r.role||'Operador',categoria:r.categoria||cats[0],password:''});
 const set=(k,v)=>setForm(f=>({...f,[k]:v}));
 const execute=async req=>{const b={};for(const [k] of spec.fields){let v=form[k];if(['precoCusto','precoVenda','prazoEntregaDias','fornecedorId'].includes(k)){if(v==null||String(v).trim()==='')throw Error('Preencha todos os campos numéricos.');v=Number(String(v).replace(',','.'));if(!Number.isFinite(v)||v<0)throw Error('Confira o valor numérico informado.');}else if(k==='password'&&!v&&form.id)v=null;else if(v==null||String(v).trim()==='')throw Error('Preencha os campos obrigatórios.');b[k]=v;}if(tab==='Produtos')b.estoque=saldo;
 await req(spec.path+(form.id?'/'+form.id:''),{method:form.id?'PUT':'POST',body:b});setForm(null);};
 if(form&&manager)return <Card><Text style={s.subtitle}>{form.id?'Editar':'Cadastrar'} {spec.one}</Text>{spec.fields.map(([k,label])=>{let opts=k==='categoria'?[...new Set([...cats,form.categoria])].map(x=>[x,x]):k==='role'?['Operador','Supervisor','Admin'].map(x=>[x,x]):k==='fornecedorId'?(data.fornecedores||[]).map(f=>[f.id,f.nomeFantasia]):null;
 return opts?<View key={k}><Text style={s.label}>{label}</Text>{opts.map(([v,n])=><Button key={v} title={(form[k]===v?'✓ ':'')+n} secondary={form[k]!==v} onPress={()=>set(k,v)}/>)}</View>:<Field key={k} label={k==='password'&&form.id?'Nova senha (opcional)':label} value={String(form[k]??'')} onChangeText={v=>set(k,v)} secureTextEntry={k==='password'} autoCapitalize="none" keyboardType={['precoCusto','precoVenda','prazoEntregaDias'].includes(k)?'decimal-pad':'default'}/>;})}
 <Button title="Salvar" disabled={busy} onPress={()=>run(execute,true)}/><Button title="Cancelar" secondary onPress={()=>setForm(null)}/></Card>;
 return <><Field label={'Buscar em '+tab} value={busca} onChangeText={setBusca}/>{manager&&<Button title={'Cadastrar '+spec.one} onPress={()=>edit({})}/>}
 {records.filter(r=>[r[spec.name],r.sku,r.cnpj,r.login].filter(Boolean).join(' ').toLowerCase().includes(busca.toLowerCase())).map(r=><Card key={r.id}><Text style={s.subtitle}>{r[spec.name]}</Text>{spec.fields.filter(([k])=>k!=='password'&&k!==spec.name).map(([k,l])=><Text key={k}>{l}: {k==='fornecedorId'?r.fornecedor:String(r[k]??'—')}</Text>)}{tab==='Produtos'&&<Text>Saldo: {r.estoque} unidades</Text>}{manager&&<Button title="Editar" secondary onPress={()=>edit(r)}/>}
 {allowUser&&(tab!=='Usuários'||user.id!==r.id)&&<Button title={tab==='Usuários'?'Desativar':'Excluir'} secondary disabled={busy} onPress={()=>Alert.alert('Confirmar operação',r[spec.name],[{text:'Voltar',style:'cancel'},{text:'Confirmar',onPress:()=>run(req=>req(spec.path+'/'+r.id,{method:'DELETE'}),true)}])}/>}</Card>)}</>;
}
