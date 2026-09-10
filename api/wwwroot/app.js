'use strict';
const $ = s => document.querySelector(s);
const app = $('#app'); const modal = $('#modal'); const content = $('#modal-content');
const state = { user: null, page: 'Visão geral', produtos: [], fornecedores: [], movimentacoes: [], orcamentos: [], usuarios: [], lastSync: null, menuOpen: false };
const avatars=[
 {id:1,symbol:'👩🏻‍🦱',label:'Pessoa de pele clara e cabelo cacheado'},
 {id:2,symbol:'👨🏼‍🦰',label:'Pessoa de pele clara média e cabelo ruivo'},
 {id:3,symbol:'🧑🏽‍🦱',label:'Pessoa de pele média e cabelo cacheado'},
 {id:4,symbol:'👩🏾‍🦱',label:'Pessoa de pele morena e cabelo crespo'},
 {id:5,symbol:'👨🏿‍🦲',label:'Pessoa de pele escura e cabeça raspada'},
 {id:6,symbol:'🧕🏽',label:'Pessoa de pele média usando lenço'}
];
const educationalMessages=[
 'Respeito não tem cor: atitudes inclusivas tornam a equipe mais forte.',
 'Discriminação racial deve ser reconhecida, interrompida e comunicada.',
 'Valorizar diferentes histórias e culturas melhora o ambiente de trabalho.',
 'Escute com respeito, evite estereótipos e pratique a igualdade de oportunidades.'
];
let bannerIndex=0;
function educationalBanner(){return el('aside',{class:'educational-banner','data-education-banner':'',role:'note','aria-live':'polite'},el('strong',{},'Respeito e diversidade'),el('span',{},educationalMessages[bannerIndex]));}
setInterval(()=>{bannerIndex=(bannerIndex+1)%educationalMessages.length;document.querySelectorAll('[data-education-banner] span').forEach(node=>node.textContent=educationalMessages[bannerIndex]);},8000);
const avatarOf=id=>avatars.find(a=>a.id===id)||avatars[0];
// O atributo no elemento raiz permite que a folha de estilos aplique a paleta inteira sem duplicar telas.
function applyTheme(){document.documentElement.dataset.theme=state.user?.temaEscuro?'dark':'light';document.querySelector('meta[name="theme-color"]')?.setAttribute('content',state.user?.temaEscuro?'#0b1822':'#12374e');}
const brl = n => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
function parseApiDate(value) {
 if(value instanceof Date)return Number.isNaN(value.getTime())?null:value;
 if(typeof value==='number'){const date=new Date(value<1e12?value*1000:value);return Number.isNaN(date.getTime())?null:date;}
 if(!value)return null;
 let text=String(value).trim().replace(' ','T').replace(/([+-]\d{2})$/,'$1:00').replace(/([+-]\d{2})(\d{2})$/,'$1:$2');
 const brazilian=text.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
 if(brazilian){const [,day,month,year,hour='00',minute='00',second='00']=brazilian;const date=new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}-03:00`);return Number.isNaN(date.getTime())?null:date;}
 if(!/(?:z|[+-]\d{2}:?\d{2})$/i.test(text))text+='Z';
 const date=new Date(text);return Number.isNaN(date.getTime())?null:date;
}
const formatDateTime = value => {const date=parseApiDate(value);return date?date.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'}):'Data não informada';};
const dateKey = value => {const date=parseApiDate(value);return date?new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(date):'';};
const isToday = value => dateKey(value)===dateKey(new Date());
const uuid = () => '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
let noticeTimer;
function notify(message) { const n=$('#notice');n.textContent=message;n.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>n.hidden=true,8000); }
function el(tag,props={},...children) {
 const node=document.createElement(tag);
 for(const [key,value] of Object.entries(props)){if(key.startsWith('on'))node.addEventListener(key.slice(2),value);else if(key==='class')node.className=value;else if(key==='text')node.textContent=value;else if(value!==false&&value!=null)node.setAttribute(key,value===true?'':value);}
 for(const child of children.flat(Infinity))if(child!=null)node.append(child instanceof Node?child:document.createTextNode(String(child)));
 return node;
}
const button=(text,click,cls='')=>el('button',{type:'button',class:cls,onclick:click,'aria-label':text},text);
const icon=className=>el('i',{class:`fa-solid ${className}`,'aria-hidden':'true'});
const brandLockup=(tagline='Sistema de Gestão')=>el('div',{class:'brand-lockup'},el('img',{class:'brand-logo',src:'assets/techpaper-logo-v3.png',alt:'Símbolo TechPaper'}),el('div',{},el('div',{class:'brand'},'TechPaper'),el('small',{},tagline)));
async function api(path,options={}) {
 const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),15000);
 try {
  const response=await fetch('/api/'+path,{...options,signal:ctrl.signal,headers:{'Content-Type':'application/json','X-TechPaper-Client':'web',...options.headers},body:options.body===undefined?undefined:JSON.stringify(options.body)});
  const data=response.status===204?null:await response.json().catch(()=>null);
  if(!response.ok){const e=new Error(data?.message||Object.values(data?.errors||{}).flat().join(' ')||`Operação não concluída (${response.status}).`);e.status=response.status;if(response.status===401){state.user=null;modal.close();renderLogin();}throw e;}
  return data;
 }catch(e){if(e.name==='AbortError'||e instanceof TypeError)throw new Error('Sem confirmação do servidor. Verifique a conexão antes de tentar novamente.');throw e;}finally{clearTimeout(timer);}
}
function table(headers,rows) {return rows.length?el('div',{class:'table-wrap'},el('table',{},el('thead',{},el('tr',{},headers.map(h=>el('th',{scope:'col'},h)))),el('tbody',{},rows.map(row=>el('tr',{},row.map(c=>el('td',{},c))))))):el('div',{class:'empty'},'Nenhum registro encontrado.');}
function field(label,name,value='',type='text',extra={}) {return el('label',{},label,el('input',{name,type,value,required:true,'aria-label':label,...extra}));}
function select(label,name,values,current) {return el('label',{},label,el('select',{name,required:true,'aria-label':label},values.map(([v,t])=>el('option',{value:v,selected:String(v)===String(current)},t))));}
function showDialog(title,body){content.replaceChildren(el('h2',{},title),body);if(!modal.open)modal.showModal();}
function form(fields,save,label='Salvar') {
 const submit=el('button',{type:'submit','aria-label':label},label);const f=el('form',{},fields,el('div',{class:'toolbar'},submit,button('Cancelar',()=>modal.close(),'secondary')));
 f.addEventListener('submit',async e=>{e.preventDefault();if(submit.disabled)return;submit.disabled=true;try{await save(Object.fromEntries(new FormData(f)));modal.close();await refresh();notify('Operação concluída.');}catch(err){notify(err.message);}finally{submit.disabled=false;}});return f;
}
function renderLogin(){applyTheme();app.replaceChildren(el('main',{class:'login',id:'main'},el('section',{class:'login-intro'},brandLockup('Gestão inteligente para papelarias'),el('h1',{},'Tudo em ordem.\nDo estoque ao orçamento.'),el('p',{},'Um espaço para organizar sua papelaria, acompanhar a operação e conectar toda a equipe.')),el('section',{class:'login-form'},el('span',{class:'eyebrow'},'BEM-VINDO À EQUIPE'),el('h2',{},'Acesse sua conta'),el('p',{class:'muted'},'Entre com o acesso fornecido pelo administrador.'),(()=>{const f=el('form',{},field('E-mail','login','','email',{autocomplete:'username'}),field('Senha','password','','password',{autocomplete:'current-password'}),el('button',{type:'submit','aria-label':'Entrar'},'Entrar'));f.onsubmit=async e=>{e.preventDefault();const b=f.querySelector('button');b.disabled=true;try{const r=await api('usuarios/login',{method:'POST',body:Object.fromEntries(new FormData(f))});state.user=r.usuario;applyTheme();await refresh();}catch(err){notify(err.message);}finally{b.disabled=false;}};return f;})())));}
let refreshing=false;
async function refresh(){if(refreshing)return;refreshing=true;try{
 const names=['produtos','fornecedores','movimentacoes','orcamentos',...(state.user?.role==='Admin'?['usuarios']:[])];
 const [user,...values]=await Promise.all([api('usuarios/me'),...names.map(n=>api(n))]);state.user=user;names.forEach((n,i)=>state[n]=values[i]);state.lastSync=new Date();render();
 }finally{refreshing=false;}}
function dashboardCharts(){
 const palette=['#1e6b91','#2aa889','#e9a23b','#775da6','#d45b4c','#5f7890'];
 const categoryTotals={};for(const product of state.produtos){const name=product.categoria||'Sem categoria';categoryTotals[name]=(categoryTotals[name]||0)+Number(product.estoque||0);}
 const categories=Object.entries(categoryTotals);const total=categories.reduce((sum,[,value])=>sum+value,0);let cursor=0;
 const slices=categories.map(([,value],index)=>{const start=cursor;cursor+=total?value/total*100:0;return `${palette[index%palette.length]} ${start}% ${cursor}%`;});
 const donut=el('div',{class:'donut-chart',role:'img','aria-label':categories.length?categories.map(([name,value])=>`${name}: ${value} unidades`).join(', '):'Sem estoque cadastrado'});
 donut.style.background=total?`conic-gradient(${slices.join(',')})`:'#dce5ed';
 const legend=el('div',{class:'chart-legend'},categories.length?categories.map(([name,value],index)=>el('div',{class:'legend-row'},el('span',{class:'legend-dot','aria-hidden':'true',style:`background:${palette[index%palette.length]}`}),el('span',{},name),el('strong',{},value))):el('p',{class:'muted'},'Sem estoque cadastrado.'));
 const movementTotals={Entrada:0,Saída:0};for(const movement of state.movimentacoes){if(movement.tipo==='Entrada')movementTotals.Entrada+=movement.quantidade;else if(movement.tipo==='Saida')movementTotals['Saída']+=movement.quantidade;}
 const maximum=Math.max(1,...Object.values(movementTotals));const bars=el('div',{class:'bar-chart'},Object.entries(movementTotals).map(([label,value],index)=>el('div',{class:'bar-row'},el('div',{class:'bar-label'},el('span',{},label),el('strong',{},value+' un.')),el('div',{class:'bar-track'},el('div',{class:'bar-fill '+(index?'out':'in'),style:`width:${value/maximum*100}%`})))));
 return el('div',{class:'charts-grid'},el('section',{class:'card chart-card'},el('div',{class:'chart-title'},el('span',{class:'chart-symbol','aria-hidden':'true'},icon('fa-chart-pie')),el('div',{},el('h2',{},'Estoque por categoria'),el('p',{class:'muted'},'Quantidade disponível em cada grupo'))),el('div',{class:'donut-layout'},donut,legend)),el('section',{class:'card chart-card'},el('div',{class:'chart-title'},el('span',{class:'chart-symbol success','aria-hidden':'true'},icon('fa-chart-column')),el('div',{},el('h2',{},'Volume de movimentações'),el('p',{class:'muted'},'Comparação do histórico de entradas e saídas'))),bars));
}
function render(){if(!state.user)return renderLogin();
 applyTheme();
 const pages=['Visão geral','Produtos','Fornecedores','Estoque','Movimentações','Orçamentos','Relatórios',...(state.user.role==='Admin'?['Usuários']:[]),'Suporte e inclusão'];
 const pageIcons={'Visão geral':'fa-chart-line','Produtos':'fa-tags','Fornecedores':'fa-truck-field','Estoque':'fa-boxes-stacked','Movimentações':'fa-right-left','Orçamentos':'fa-file-invoice-dollar','Relatórios':'fa-chart-column','Usuários':'fa-users-gear','Suporte e inclusão':'fa-hands-asl-interpreting'};
 const closeMenu=()=>{state.menuOpen=false;document.querySelector('.sidebar')?.classList.remove('open');document.querySelector('.menu-backdrop')?.classList.remove('open');document.querySelector('.menu-button')?.setAttribute('aria-expanded','false');};
 const nav=el('nav',{id:'main-menu','aria-label':'Navegação principal'},pages.map(p=>el('button',{type:'button','aria-label':`Abrir ${p}`,class:p===state.page?'active':'',onclick:()=>{state.page=p;closeMenu();render();mainFocus();}},el('span',{class:'nav-icon','aria-hidden':'true'},icon(pageIcons[p])),el('span',{},p))));
 const profileButton=el('button',{type:'button',class:'user-summary profile-button','aria-label':'Abrir preferências de tema e avatar',onclick:preferencesDialog},el('span',{class:'user-avatar','aria-hidden':'true'},avatarOf(state.user.avatarId).symbol),el('span',{class:'profile-copy'},el('strong',{},state.user.name),el('span',{class:'muted'},state.user.role)));
 const toggleMenu=()=>{state.menuOpen=!state.menuOpen;document.querySelector('.sidebar')?.classList.toggle('open',state.menuOpen);document.querySelector('.menu-backdrop')?.classList.toggle('open',state.menuOpen);document.querySelector('.menu-button')?.setAttribute('aria-expanded',String(state.menuOpen));};
 const menuButton=el('button',{type:'button',class:'menu-button','aria-label':'Abrir menu principal','aria-controls':'main-menu','aria-expanded':'false',onclick:toggleMenu},icon('fa-bars'));
 const main=el('main',{class:'workspace',id:'main',tabindex:'-1'},el('header',{class:'topbar'},menuButton,el('div',{class:'page-title'},el('span',{class:'eyebrow'},'OPERAÇÃO DA PAPELARIA'),el('h1',{},state.page)),el('div',{class:'topbar-actions'},profileButton,el('div',{class:'toolbar'},el('small',{class:'muted'},state.lastSync?'Atualizado às '+state.lastSync.toLocaleTimeString('pt-BR'):''),button('Atualizar',()=>refresh().catch(e=>notify(e.message)),'secondary'),button('Sair',async()=>{try{await api('usuarios/logout',{method:'POST'});state.user=null;applyTheme();renderLogin();}catch(e){notify(e.message);}},'secondary')))));
 const sidebar=el('aside',{class:'sidebar','aria-label':'Menu do sistema'},brandLockup(),nav,el('footer',{},el('small',{},'Web + Mobile\nUma equipe, os mesmos dados.'),el('span',{class:'version'},'Versão 1.4.0')));
 const backdrop=el('button',{type:'button',class:'menu-backdrop','aria-label':'Fechar menu principal',onclick:closeMenu});
 app.replaceChildren(el('div',{class:'layout'},sidebar,backdrop,main));
 function mainFocus(){setTimeout(()=>main.focus(),0);}
 const manager=['Admin','Supervisor'].includes(state.user.role);
 if(state.page==='Visão geral'){
  const entradasHoje=state.movimentacoes.filter(m=>m.tipo==='Entrada'&&isToday(m.dataHora)).reduce((sum,m)=>sum+m.quantidade,0);
  const saidasHoje=state.movimentacoes.filter(m=>m.tipo==='Saida'&&isToday(m.dataHora)).reduce((sum,m)=>sum+m.quantidade,0);
  main.append(el('p',{class:'muted page-lead'},'Acompanhe os números principais e o movimento da papelaria em tempo real.'),el('div',{class:'dashboard-stats'},[
   ['fa-box','Total de produtos',state.produtos.length,'blue'],['fa-triangle-exclamation','Estoque baixo',state.produtos.filter(p=>p.estoque<20).length,'danger'],['fa-truck','Fornecedores',state.fornecedores.length,'blue'],['fa-arrow-right-to-bracket','Entradas hoje',entradasHoje,'success'],['fa-arrow-right-from-bracket','Saídas hoje',saidasHoje,'danger'],['fa-brazilian-real-sign','Valor em estoque',brl(state.produtos.reduce((a,p)=>a+p.estoque*p.precoCusto,0)),'amber']
  ].map(([symbol,label,value,tone])=>el('section',{class:'card stat-card '+tone},el('span',{class:'stat-icon','aria-hidden':'true'},icon(symbol)),el('div',{},el('div',{class:'muted'},label),el('div',{class:'metric'},value))))),dashboardCharts(),el('div',{class:'overview-lower'},el('section',{},el('div',{class:'section-heading'},el('div',{},el('span',{class:'eyebrow'},'ATENÇÃO'),el('h2',{},'Reposição de estoque')),el('span',{class:'badge warn'},state.produtos.filter(p=>p.estoque<20).length+' itens')),table(['Produto','SKU','Saldo'],state.produtos.filter(p=>p.estoque<20).map(p=>[p.nome,p.sku,el('span',{class:'badge warn'},p.estoque+' unidades')]))),el('section',{},el('div',{class:'section-heading'},el('div',{},el('span',{class:'eyebrow'},'ATIVIDADE'),el('h2',{},'Últimas movimentações')),button('Ver histórico',()=>{state.page='Movimentações';render();},'secondary')),table(['Data','Produto','Tipo'],state.movimentacoes.slice(0,5).map(m=>[formatDateTime(m.dataHora),m.produtoNome,el('span',{class:'badge '+(m.tipo==='Entrada'?'success':'danger')},m.tipo==='Saida'?'Saída':m.tipo)])))));
 }else if(state.page==='Produtos'){
  const area=el('div');const search=el('input',{placeholder:'Buscar por nome ou SKU','aria-label':'Buscar produto',oninput:()=>draw()});
  function draw(){const query=search.value.toLowerCase();area.replaceChildren(table(['Produto','Categoria','Fornecedor','Venda','Saldo','Ações'],state.produtos.filter(p=>(p.nome+p.sku).toLowerCase().includes(query)).map(p=>[el('div',{},el('strong',{},p.nome),el('div',{class:'muted'},p.sku)),p.categoria,p.fornecedor,brl(p.precoVenda),p.estoque,el('div',{class:'toolbar'},manager?button('Editar',()=>productForm(p),'secondary'):null,state.user.role==='Admin'?button('Excluir',()=>remove('produtos',p.id),'danger'):null)])));}
  main.append(el('div',{class:'toolbar'},search,manager?button('Novo produto',()=>productForm()):null),area);draw();
 }else if(state.page==='Estoque'){
  main.append(el('div',{class:'page-actions'},el('p',{class:'muted'},'Consulte o saldo atual e identifique os itens que precisam de reposição.'),button('Registrar movimentação',()=>movementForm())),table(['SKU','Produto','Categoria','Saldo atual','Situação','Valor em estoque'],state.produtos.map(p=>[p.sku,p.nome,p.categoria,el('strong',{},p.estoque+' un.'),el('span',{class:'badge '+(p.estoque<20?'warn':'success')},p.estoque<20?'Estoque baixo':'Regular'),brl(p.estoque*p.precoCusto)])));
 }else if(state.page==='Movimentações'){
  main.append(el('div',{class:'page-actions'},el('p',{class:'muted'},'Entradas e saídas ficam registradas com data, hora e responsável. O histórico não pode ser apagado.'),button('Nova movimentação',()=>movementForm())),table(['Data e hora','Produto','Tipo','Quantidade','Motivo','Responsável'],state.movimentacoes.map(m=>[formatDateTime(m.dataHora),m.produtoNome,el('span',{class:'badge '+(m.tipo==='Entrada'?'success':'danger')},m.tipo==='Saida'?'Saída':m.tipo),m.quantidade,m.motivo,m.responsavel])));
 }else if(state.page==='Fornecedores'){
  main.append(el('div',{class:'toolbar'},manager?button('Novo fornecedor',()=>supplierForm()):null),table(['Fornecedor','CNPJ','Contato','Prazo','Ações'],state.fornecedores.map(f=>[f.nomeFantasia,f.cnpj,f.email,f.prazoEntregaDias+' dias',el('div',{class:'toolbar'},manager?button('Editar',()=>supplierForm(f),'secondary'):null,state.user.role==='Admin'?button('Excluir',()=>remove('fornecedores',f.id),'danger'):null)])));
 }else if(state.page==='Orçamentos'){
  main.append(el('p',{class:'muted'},'Monte propostas com os produtos cadastrados. Orçamentos não reservam nem baixam estoque.'),el('div',{class:'toolbar'},button('Novo orçamento',()=>quoteForm())),table(['Número','Cliente','Validade','Status','Total','Ações'],state.orcamentos.map(o=>[o.id,o.cliente,o.validade.slice(0,10),el('span',{class:'badge '+(o.status==='Rascunho'?'warn':'')},o.status),brl(o.total),el('div',{class:'toolbar'},button('Abrir',()=>quoteDetail(o),'secondary'),o.status==='Rascunho'&&(manager||o.usuarioId===state.user.id)?button('Editar',()=>quoteForm(o),'secondary'):null)])));
 }else if(state.page==='Usuários'){
  main.append(el('div',{class:'toolbar'},button('Novo usuário',()=>userForm())),table(['Nome','E-mail','Perfil','Ações'],state.usuarios.map(u=>[u.name,u.login,u.role,el('div',{class:'toolbar'},button('Editar',()=>userForm(u),'secondary'),u.id!==state.user.id?button('Desativar',()=>remove('usuarios',u.id),'danger'):null)])));
 }else if(state.page==='Relatórios'){reports(main);
 }else{main.append(el('div',{class:'support-hero'},el('span',{class:'support-icon'},icon('fa-hands-asl-interpreting')),el('div',{},el('span',{class:'eyebrow'},'ACESSIBILIDADE'),el('h2',{},'TechPaper para toda a equipe'),el('p',{},'Use o botão azul do VLibras no canto direito da tela para traduzir o conteúdo para Libras.'))),el('div',{class:'support-grid'},el('section',{class:'card'},el('h2',{},'Tecnologia acessível e respeito à diversidade'),el('p',{},'A equipe deve oferecer atendimento respeitoso, sem discriminação racial, religiosa, de gênero ou de origem. Perfis de acesso são definidos pela responsabilidade profissional.'),el('p',{},'O portal oferece navegação por teclado, foco visível, textos compatíveis com leitores de tela e tradução pelo VLibras. Você também pode ampliar a página pelo navegador.'),el('p',{},'Não coletamos raça, religião ou outras informações sensíveis para as operações de estoque e orçamento.')),el('section',{class:'card'},el('h2',{},'Como trabalhar com segurança'),el('p',{},'Cadastre produtos com estoque zero e registre entradas e saídas em Movimentações. Se faltar confirmação, use a opção de tentar novamente: o sistema mantém a identificação da operação.'),el('p',{},'Aprovações de orçamento são realizadas por administradores ou supervisores. O aplicativo usa os mesmos dados; atualize a tela para conferir mudanças feitas por outro colega.'))));}
 main.append(educationalBanner());
 if(!state.user.avatarSelecionado)setTimeout(()=>preferencesDialog(true),0);
 }
// A API devolve o usuário atualizado; assim, a interface nunca presume que a gravação foi aceita.
function preferencesDialog(required=false){
 const selected=state.user.avatarSelecionado?state.user.avatarId:0;
 const gallery=el('div',{class:'avatar-gallery',role:'radiogroup','aria-label':'Galeria de avatares'},avatars.map(a=>el('button',{type:'button',role:'radio',class:'avatar-option'+(a.id===selected?' selected':''),'aria-label':a.label,'aria-checked':a.id===selected,onclick:()=>savePreferences(state.user.temaEscuro,a.id)},el('span',{'aria-hidden':'true'},a.symbol),el('small',{},`Opção ${a.id}`))));
 const themeLabel=state.user.temaEscuro?'Usar tema claro':'Usar tema escuro';
 modal.oncancel=required?event=>event.preventDefault():null;
 showDialog(required?'Escolha seu avatar para continuar':'Aparência e inclusão',el('div',{},el('p',{class:'muted'},required?'A seleção é obrigatória no primeiro acesso e poderá ser alterada depois.':'Escolha uma representação visual. O TechPaper salva apenas o número do avatar e não registra raça ou etnia.'),gallery,required?null:button(themeLabel,()=>savePreferences(!state.user.temaEscuro,state.user.avatarId),'theme-toggle'),required?null:button('Fechar',()=>modal.close(),'secondary')));
}
async function savePreferences(temaEscuro,avatarId){
 try{const user=await api('usuarios/me/preferencias',{method:'PATCH',body:{temaEscuro,avatarId}});state.user=user;modal.oncancel=null;modal.close();applyTheme();render();notify('Preferências atualizadas.');}
 catch(e){notify(e.message);}
}
async function remove(path,id){if(!confirm('Confirma esta operação? Registros vinculados a histórico serão preservados.'))return;try{await api(`${path}/${id}`,{method:'DELETE'});await refresh();}catch(e){notify(e.message);}}
function productForm(p={}){showDialog(p.id?'Editar produto':'Novo produto',form([
 field('SKU','sku',p.sku||'','text',{maxlength:50}),field('Nome','nome',p.nome||'','text',{maxlength:100}),field('Categoria','categoria',p.categoria||'','text',{maxlength:50}),
 select('Fornecedor','fornecedorId',state.fornecedores.map(f=>[f.id,f.nomeFantasia]),p.fornecedorId),field('Preço de custo','precoCusto',p.precoCusto||0,'number',{min:0,step:'.01'}),field('Preço de venda','precoVenda',p.precoVenda||0,'number',{min:0,step:'.01'}),el('p',{class:'note'},'O saldo é alterado exclusivamente em Movimentações.')
],async d=>{await api('produtos'+(p.id?'/'+p.id:''),{method:p.id?'PUT':'POST',body:{...d,fornecedorId:Number(d.fornecedorId),precoCusto:Number(d.precoCusto),precoVenda:Number(d.precoVenda),estoque:p.estoque||0}});}));}
function supplierForm(f={}){showDialog(f.id?'Editar fornecedor':'Novo fornecedor',form([
 field('CNPJ','cnpj',f.cnpj||'','text',{maxlength:18}),field('Razão social','razaoSocial',f.razaoSocial||'','text',{maxlength:150}),field('Nome fantasia','nomeFantasia',f.nomeFantasia||'','text',{maxlength:150}),field('Segmento','segmento',f.segmento||'','text',{maxlength:50}),field('Telefone','telefone',f.telefone||'','tel',{maxlength:20}),field('E-mail','email',f.email||'','email',{maxlength:100}),field('Prazo em dias','prazoEntregaDias',f.prazoEntregaDias||0,'number',{min:0,max:365})
],d=>api('fornecedores'+(f.id?'/'+f.id:''),{method:f.id?'PUT':'POST',body:{...d,prazoEntregaDias:Number(d.prazoEntregaDias)}})));}
function userForm(u={}){showDialog(u.id?'Editar usuário':'Novo usuário',form([
 field('Nome','name',u.name||'','text',{maxlength:100}),field('E-mail','login',u.login||'','email',{maxlength:100}),field(u.id?'Nova senha (deixe em branco para manter)':'Senha (mínimo 10 caracteres)','password','','password',{required:!u.id,minlength:10,maxlength:128,autocomplete:'new-password'}),select('Perfil','role',[['Operador','Operador'],['Supervisor','Supervisor'],['Admin','Administrador']],u.role||'Operador')
],d=>api('usuarios'+(u.id?'/'+u.id:''),{method:u.id?'PUT':'POST',body:{...d,password:d.password||null}})));}
function movementForm(){const key='tp_pending_'+state.user.id;let pending;try{pending=JSON.parse(localStorage.getItem(key));}catch{}
 const fields=pending?[el('p',{class:'note'},`Operação aguardando confirmação: ${pending.tipo}, ${pending.quantidade} unidade(s), produto #${pending.produtoId}. A nova tentativa não duplica o registro.`)]:[
 select('Produto','produtoId',state.produtos.map(p=>[p.id,`${p.nome} — saldo ${p.estoque}`])),select('Tipo','tipo',[['Entrada','Entrada'],['Saida','Saída']]),field('Quantidade','quantidade',1,'number',{min:1,max:1000000,step:1}),field('Motivo','motivo','','text',{maxlength:100})];
 showDialog('Movimentação de estoque',form(fields,async d=>{const body=pending||{...d,produtoId:Number(d.produtoId),quantidade:Number(d.quantidade),chaveOperacao:uuid()};localStorage.setItem(key,JSON.stringify(body));pending=body;
 try{await api('movimentacoes',{method:'POST',body});localStorage.removeItem(key);}catch(e){if([400,403,404,409].includes(e.status)){localStorage.removeItem(key);pending=null;}movementForm();throw e;}
 },pending?'Tentar confirmar novamente':'Confirmar movimentação'));}
function quoteForm(o={}){let items=(o.itens||[]).map(i=>({produtoId:i.produtoId,quantidade:i.quantidade}));const list=el('div');
 const product=select('Produto','produto',state.produtos.map(p=>[p.id,`${p.nome} — ${brl(p.precoVenda)}`]));const qty=field('Quantidade do item','quantidade',1,'number',{min:1,max:1000000,step:1});
 const draw=()=>list.replaceChildren(table(['Produto','Quantidade',''],items.map(i=>[state.produtos.find(p=>p.id===i.produtoId)?.nome||i.produtoId,i.quantidade,button('Remover',()=>{items=items.filter(x=>x!==i);draw();},'secondary')])));
 const add=button('Adicionar item',()=>{const id=Number(product.querySelector('select').value),n=Number(qty.querySelector('input').value);if(!id||!Number.isInteger(n)||n<=0||n>1000000)return notify('Selecione um produto e uma quantidade válida.');const i=items.find(x=>x.produtoId===id);if(i)i.quantidade+=n;else items.push({produtoId:id,quantidade:n});draw();},'secondary');draw();
 showDialog(o.id?'Editar orçamento':'Novo orçamento',form([field('Cliente','cliente',o.cliente||'','text',{maxlength:150}),field('Validade','validade',o.validade?.slice(0,10)||new Date(Date.now()+7*86400000).toISOString().slice(0,10),'date'),field('Observações','observacoes',o.observacoes||'','text',{required:false,maxlength:1000}),product,qty,add,list,el('p',{class:'muted'},'O servidor confirma preços e totais ao salvar. Editar um rascunho atualiza os preços para os valores atuais do cadastro.')],async d=>{if(!items.length)throw new Error('Inclua ao menos um item.');await api('orcamentos'+(o.id?'/'+o.id:''),{method:o.id?'PUT':'POST',body:{cliente:d.cliente,validade:d.validade,observacoes:d.observacoes,itens:items,versao:o.versao||1}});}));}
function quoteDetail(o){const body=el('div',{},el('p',{},o.cliente+' · '+o.status+' · Validade: '+o.validade.slice(0,10)),table(['Produto','Quantidade','Unitário','Subtotal'],o.itens.map(i=>[i.produtoNome,i.quantidade,brl(i.precoUnitario),brl(i.subtotal)])),el('h2',{},'Total: '+brl(o.total)),el('p',{},o.observacoes),el('p',{class:'muted'},'Proposta comercial. Não reserva nem baixa estoque.'),button('Imprimir / salvar PDF',()=>window.print(),'secondary'),button('Fechar',()=>modal.close(),'secondary'));
 if(['Admin','Supervisor'].includes(state.user.role)&&o.status==='Rascunho')for(const status of ['Aprovado','Cancelado'])body.append(button(status==='Aprovado'?'Aprovar':'Cancelar orçamento',async e=>{e.currentTarget.disabled=true;try{await api(`orcamentos/${o.id}/status`,{method:'PATCH',body:{status,versao:o.versao}});modal.close();await refresh();}catch(err){notify(err.message);e.currentTarget.disabled=false;}}));showDialog('Orçamento #'+o.id,body);}
function reports(main){let rows=[];let headers=[];const area=el('div');const type=select('Relatório','tipo',[['estoque','Estoque atual'],['critico','Estoque abaixo de 20'],['movimentos','Movimentações']]);const start=field('De','inicio','','date',{required:false});const end=field('Até','fim','','date',{required:false});
 function draw(){const t=type.querySelector('select').value;const a=start.querySelector('input').value,b=end.querySelector('input').value;
 if(t==='movimentos'){headers=['Data','Produto','Tipo','Quantidade','Motivo','Responsável'];rows=state.movimentacoes.filter(m=>{const key=dateKey(m.dataHora);return key&&(!a||key>=a)&&(!b||key<=b);}).map(m=>[formatDateTime(m.dataHora),m.produtoNome,m.tipo==='Saida'?'Saída':m.tipo,m.quantidade,m.motivo,m.responsavel]);}
 else{headers=['SKU','Produto','Categoria','Saldo','Custo unitário','Valor em estoque'];rows=state.produtos.filter(p=>t!=='critico'||p.estoque<20).map(p=>[p.sku,p.nome,p.categoria,p.estoque,brl(p.precoCusto),brl(p.estoque*p.precoCusto)]);}
 area.replaceChildren(table(headers,rows));}
 const csv=()=>{const safe=v=>{let t=String(v);if(/^[=+\-@\t\r]/.test(t))t="'"+t;return '"'+t.replaceAll('"','""')+'"';};const blob=new Blob(['\uFEFF'+[headers,...rows].map(r=>r.map(safe).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'});const link=el('a',{download:'techpaper-relatorio.csv',href:URL.createObjectURL(blob)});link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);};
 main.append(el('p',{class:'muted'},'CSV compatível com Excel. Para PDF, use a opção de salvar na janela de impressão. O período usa datas em UTC e se aplica às movimentações.'),el('div',{class:'grid'},type,start,end),el('div',{class:'toolbar'},button('Aplicar filtros',draw),button('Exportar CSV',csv,'secondary'),button('Imprimir / salvar PDF',()=>window.print(),'secondary')),area);draw();}
api('usuarios/me').then(u=>{state.user=u;return refresh();}).catch(e=>{renderLogin();if(e.status!==401)notify(e.message);});
