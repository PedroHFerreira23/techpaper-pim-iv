namespace TechPaperAPI.Models;
public class Orcamento {
 public int Id {get;set;} public string Cliente {get;set;}=""; public string Observacoes {get;set;}="";
 public string Status {get;set;}="Rascunho"; public int UsuarioId {get;set;} public DateTime DataCriacao {get;set;}=DateTime.UtcNow;
 public DateTime Validade {get;set;} public decimal Total {get;set;} public int Versao {get;set;}=1;
 public List<ItemOrcamento> Itens {get;set;}=[];
}
public class ItemOrcamento {
 public int Id {get;set;} public int OrcamentoId {get;set;} public int ProdutoId {get;set;}
 public string ProdutoNome {get;set;}=""; public int Quantidade {get;set;} public decimal PrecoUnitario {get;set;}
 public decimal Subtotal {get;set;}
}
