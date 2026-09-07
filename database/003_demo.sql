-- Dados fictícios idempotentes para demonstração. Não contém senhas.
INSERT INTO fornecedores("Cnpj","RazaoSocial","NomeFantasia","Segmento","Telefone","Email","PrazoEntregaDias")
VALUES('00.000.000/0001-00','Fornecedor Demonstrativo','Papel & Cia Demo','Papelaria','(11) 0000-0000','contato@example.com',5)
ON CONFLICT ("Cnpj") DO NOTHING;
INSERT INTO produtos("Sku","Nome","Categoria","Fornecedor","FornecedorId","PrecoCusto","PrecoVenda")
SELECT 'CAD-001','Caderno universitário','Cadernos',"NomeFantasia","Id",12.50,24.90 FROM fornecedores WHERE "Cnpj"='00.000.000/0001-00'
ON CONFLICT ("Sku") DO NOTHING;
INSERT INTO produtos("Sku","Nome","Categoria","Fornecedor","FornecedorId","PrecoCusto","PrecoVenda")
SELECT 'CAN-001','Caneta azul','Escrita',"NomeFantasia","Id",1.20,2.50 FROM fornecedores WHERE "Cnpj"='00.000.000/0001-00'
ON CONFLICT ("Sku") DO NOTHING;
