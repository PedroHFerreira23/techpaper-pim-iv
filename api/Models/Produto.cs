namespace TechPaperAPI.Models;
public class Produto {
 public int Id {get;set;} public string Sku {get;set;}=""; public string Nome {get;set;}="";
 public string Categoria {get;set;}=""; public string Fornecedor {get;set;}=""; public int? FornecedorId {get;set;}
 public decimal PrecoCusto {get;set;} public decimal PrecoVenda {get;set;} public int Estoque {get;set;}
 public DateTime DataCriacao {get;set;}=DateTime.UtcNow;
}
