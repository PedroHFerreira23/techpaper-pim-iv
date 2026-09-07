"""Testes com banco descartável. Não apontar para dados reais."""
import concurrent.futures
import datetime
import json
import os
import unittest
import urllib.error
import urllib.request
import uuid

BASE = os.environ.get('TP_TEST_URL', 'http://127.0.0.1:5184')
def request(path, method='GET', body=None, token=None, headers=None):
    h = {'Content-Type': 'application/json', 'X-TechPaper-Client': 'mobile'}
    if token: h['Authorization'] = 'Bearer ' + token
    h.update(headers or {})
    req = urllib.request.Request(BASE+'/api/'+path, data=None if body is None else json.dumps(body).encode(), headers=h, method=method)
    try: response = urllib.request.urlopen(req, timeout=20)
    except urllib.error.HTTPError as error: response = error
    raw = response.read()
    try: data = json.loads(raw) if raw else None
    except ValueError: data = raw.decode(errors='replace')
    return response.status, data

@unittest.skipUnless(os.environ.get('TP_TEST_ALLOW_MUTATIONS') == '1', 'Ative apenas para banco de testes descartável.')
class IntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.suffix = uuid.uuid4().hex[:8]
        status, data = request('usuarios/login', 'POST', {'login': os.environ['TP_TEST_LOGIN'], 'password': os.environ['TP_TEST_PASSWORD']})
        assert status == 200, (status, data)
        cls.admin = data['accessToken']
        cls.password = 'Senha-Teste-2026!'
        cls.operator_login = cls.suffix+'@example.com'
        status, cls.operator_user = request('usuarios', 'POST', {'name':'Operador Teste', 'login':cls.operator_login,'password':cls.password,'role':'Operador'}, cls.admin)
        assert status == 200, (status, cls.operator_user)
        status, data = request('usuarios/login', 'POST', {'login':cls.operator_login,'password':cls.password})
        assert status == 200, (status,data)
        cls.operator = data['accessToken']
        status, supplier = request('fornecedores', 'POST', {'cnpj':cls.suffix,'razaoSocial':'Teste fictício','nomeFantasia':'Teste '+cls.suffix,'segmento':'Papelaria','telefone':'0000','email':'teste@example.com','prazoEntregaDias':3}, cls.admin)
        assert status == 200, (status,supplier)
        cls.supplier = supplier['id']

    def product(self):
        body = {'sku':uuid.uuid4().hex,'nome':'Produto teste','categoria':'Teste','fornecedorId':self.supplier,'precoCusto':2,'precoVenda':3.75,'estoque':0}
        status,p = request('produtos','POST',body,self.admin)
        self.assertEqual(status,201,p)
        return p

    def movement(self,p,quantity=10,tipo='Entrada',key=None):
        return {'produtoId':p['id'],'tipo':tipo,'quantidade':quantity,'motivo':'Teste integração','chaveOperacao':key or str(uuid.uuid4())}

    def test_01_anonymous_and_roles(self):
        for path in ['produtos','usuarios','movimentacoes','orcamentos']:
            self.assertEqual(request(path)[0],401)
        self.assertEqual(request('usuarios',token=self.operator)[0],403)
        self.assertEqual(request('produtos','POST',{},self.operator)[0],403)
        self.assertEqual(request('produtos',token=self.operator)[0],200)

    def test_02_password_never_returned(self):
        for path in ['usuarios','usuarios/me']:
            status,data=request(path,token=self.admin)
            self.assertEqual(status,200)
            self.assertNotIn('password',json.dumps(data).lower())
        self.assertEqual(request('usuarios/login','POST',{'login':self.operator_login,'password':'errada'})[0],401)

    def test_03_movement_idempotency_and_identity(self):
        p=self.product();body=self.movement(p);body.update({'responsavel':'Falso','usuarioId':'999'})
        status,first=request('movimentacoes','POST',body,self.operator)
        self.assertEqual(status,200,first)
        self.assertEqual(first['responsavelId'],self.operator_user['id'])
        self.assertEqual(first['responsavel'],'Operador Teste')
        status,again=request('movimentacoes','POST',body,self.operator)
        self.assertEqual(status,200,again);self.assertEqual(first['id'],again['id'])
        self.assertEqual(request('produtos/'+str(p['id']),token=self.admin)[1]['estoque'],10)
        body['quantidade']=9
        self.assertEqual(request('movimentacoes','POST',body,self.operator)[0],409)

    def test_04_concurrent_withdrawals(self):
        p=self.product();self.assertEqual(request('movimentacoes','POST',self.movement(p,10),self.operator)[0],200)
        def withdraw(_): return request('movimentacoes','POST',self.movement(p,7,'Saida'),self.operator)[0]
        with concurrent.futures.ThreadPoolExecutor(2) as pool: statuses=list(pool.map(withdraw,range(2)))
        self.assertEqual(sorted(statuses),[200,409])
        self.assertEqual(request('produtos/'+str(p['id']),token=self.admin)[1]['estoque'],3)

    def test_05_invalid_stock(self):
        p=self.product()
        self.assertEqual(request('movimentacoes','POST',self.movement(p,1,'Saida'),self.operator)[0],409)
        self.assertEqual(request('movimentacoes','POST',self.movement(p,0),self.operator)[0],400)
        self.assertEqual(request('movimentacoes','POST',self.movement(p,1,'Invalido'),self.operator)[0],400)
        self.assertEqual(request('produtos', 'POST',{'sku':uuid.uuid4().hex,'nome':'Inválido','categoria':'Teste','fornecedorId':self.supplier,'precoVenda':-1,'precoCusto':0,'estoque':0},self.admin)[0],400)

    def test_06_quotes_total_roles_and_version(self):
        p=self.product();body={'cliente':'Cliente fictício','validade':(datetime.date.today()+datetime.timedelta(days=7)).isoformat(),'itens':[{'produtoId':p['id'],'quantidade':3,'precoUnitario':0.01}],'total':0.03}
        status,o=request('orcamentos','POST',body,self.operator)
        self.assertEqual(status,201,o);self.assertEqual(o['total'],11.25)
        self.assertEqual(request('produtos/'+str(p['id']),token=self.admin)[1]['estoque'],0)
        self.assertEqual(request(f"orcamentos/{o['id']}/status",'PATCH',{'status':'Aprovado','versao':1},self.operator)[0],403)
        body['versao']=1
        status,updated=request(f"orcamentos/{o['id']}",'PUT',body,self.operator)
        self.assertEqual(status,200,updated);self.assertEqual(updated['versao'],2)
        self.assertEqual(request(f"orcamentos/{o['id']}",'PUT',body,self.operator)[0],409)
        self.assertEqual(request(f"orcamentos/{o['id']}/status",'PATCH',{'status':'Aprovado','versao':2},self.admin)[0],200)
        body['versao']=3
        self.assertEqual(request(f"orcamentos/{o['id']}",'PUT',body,self.operator)[0],409)

    def test_07_foreign_origin_rejected(self):
        self.assertEqual(request('usuarios/logout','POST',{},self.operator,{'Origin':'https://outro.example'})[0],403)

    def test_08_logout_revokes_token(self):
        status,data=request('usuarios/login','POST',{'login':self.operator_login,'password':self.password})
        self.assertEqual(status,200,data);token=data['accessToken']
        self.assertEqual(request('usuarios/logout','POST',{},token)[0],204)
        self.assertEqual(request('usuarios/me',token=token)[0],401)

    def test_09_concurrent_same_operation(self):
        p=self.product();body=self.movement(p,6)
        with concurrent.futures.ThreadPoolExecutor(2) as pool: results=list(pool.map(lambda _:request('movimentacoes','POST',body,self.operator),range(2)))
        self.assertEqual([r[0] for r in results],[200,200],results)
        self.assertEqual(results[0][1]['id'],results[1][1]['id'])
        self.assertEqual(request('produtos/'+str(p['id']),token=self.admin)[1]['estoque'],6)

if __name__=='__main__': unittest.main(verbosity=2)
