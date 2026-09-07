namespace TechPaperAPI.Models;
public class Movimentacao {
 public int Id {get;set;} public string Tipo {get;set;}=""; public int ProdutoId {get;set;}
 public string ProdutoNome {get;set;}=""; public int Quantidade {get;set;} public string Motivo {get;set;}="";
 public string Responsavel {get;set;}=""; public string UsuarioId {get;set;}=""; public int ResponsavelId {get;set;}
 public string ChaveOperacao {get;set;}=""; public DateTime DataHora {get;set;}
}
