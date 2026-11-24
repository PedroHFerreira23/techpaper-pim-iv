"""Carga fictícia reproduzível via API. Apenas localhost, em base exclusiva para demonstração."""
import argparse, datetime, getpass, json, os, uuid
from urllib import request, error
from urllib.parse import urlsplit
CATALOGO = {
 'Cadernos': ['Caderno universitário','Caderno de desenho','Agenda semanal','Bloco quadriculado','Caderno de caligrafia','Bloco de notas'],
 'Escrita': ['Caneta azul','Caneta preta','Lápis grafite','Lapiseira','Marca-texto','Caneta gel'],
 'Artes': ['Aquarela','Tinta guache','Pincel redondo','Giz pastel','Lápis de cor','Papel para pintura'],
 'Organização': ['Pasta sanfonada','Pasta catálogo','Caixa arquivo','Divisórias','Prancheta','Envelope kraft'],
 'Material escolar': ['Régua','Tesoura escolar','Cola bastão','Apontador','Borracha branca','Esquadro'],
 'Papelaria': ['Papel sulfite','Clipes','Grampeador','Grampos','Fita adesiva','Etiquetas']}
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--url',default='http://127.0.0.1:8080');p.add_argument('--login',required=True);p.add_argument('--confirmar-base-demo',action='store_true',required=True);a=p.parse_args()
 u=urlsplit(a.url)
 if u.hostname not in ('127.0.0.1','localhost','::1') or u.scheme not in ('http','https') or u.username or u.password or u.path not in ('','/') or u.query or u.fragment: p.error('Informe a origem local de uma API de demonstração.')
 token=None
 def api(path,method='GET',body=None):
  h={'Content-Type':'application/json','X-TechPaper-Client':'mobile'}
  if token:h['Authorization']='Bearer '+token
  q=request.Request(a.url.rstrip('/')+'/api/'+path,method=method,headers=h,data=None if body is None else json.dumps(body).encode())
  try:
   with request.urlopen(q,timeout=20) as r:return json.loads(r.read() or b'null')
  except error.HTTPError as e:raise SystemExit(f'{method} {path}: HTTP {e.code}: {e.read(400).decode(errors="replace")}')
 token=api('usuarios/login','POST',{'login':a.login,'password':os.environ.get('TP_DEMO_PASSWORD') or getpass.getpass('Senha do administrador local: ')})['accessToken']
 try:
  suppliers={x['cnpj']:x for x in api('fornecedores')};products={x['sku']:x for x in api('produtos')}; quotes={x['cliente']:x for x in api('orcamentos')};ids=[]
  for k,(cat,names) in enumerate(CATALOGO.items(),1):
   cnpj=f'00.000.000/990{k}-00';name='Demo '+['Horizonte','Ipê','Aurora','Cedro','Ponte','Jardim'][k-1]
   supplier=suppliers.get(cnpj) or api('fornecedores','POST',dict(cnpj=cnpj,nomeFantasia=name,razaoSocial=name+' Fictícia',segmento=cat,telefone='(00) 0000-0000',email=f'loja{k}@example.test',prazoEntregaDias=k+1))
   for j,label in enumerate(names,1):
    n=(k-1)*6+j;sku=f'PIM-DEMO-{n:03}';price=round(1.25+n*0.65,2)
    item=products.get(sku) or api('produtos','POST',dict(sku=sku,nome=label,categoria=cat,fornecedorId=supplier['id'],precoCusto=price,precoVenda=round(price*1.65,2),estoque=0))
    ids.append(item['id'])
    for tipo,qty in [('Entrada',8+n%28),('Saida',1+n%6)]:
     api('movimentacoes','POST',dict(produtoId=item['id'],tipo=tipo,quantidade=qty,motivo='Demonstração PIM IV',chaveOperacao=str(uuid.uuid5(uuid.NAMESPACE_URL,'techpaper/pim-demo-v1/'+sku+'/'+tipo))))
  for n in range(12):
   cliente=f'PIM Demo {n+1:02} / '+['Oficina de arte','Feira de ciências','Curso de desenho','Clube de leitura'][n%4]
   o=quotes.get(cliente) or api('orcamentos','POST',dict(cliente=cliente,observacoes='Pedido fictício de apresentação.',validade=str(datetime.date.today()+datetime.timedelta(days=30)),itens=[dict(produtoId=ids[n*3+j],quantidade=j+1) for j in range(3)]))
   if n%3 and o['status']=='Rascunho':api(f"orcamentos/{o['id']}/status",'PATCH',dict(status='Aprovado' if n%3==1 else 'Cancelado',versao=o['versao']))
  print('Carga concluída: 6 fornecedores, 36 produtos, 72 movimentações e 12 orçamentos fictícios.')
 finally:api('usuarios/logout','POST')
if __name__=='__main__':main()
