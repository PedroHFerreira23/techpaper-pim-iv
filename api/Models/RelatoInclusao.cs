namespace TechPaperAPI.Models;

// Registro reservado para barreiras de acessibilidade, discriminação e sugestões.
// A identidade não é exibida na interface comum: somente o autor e administradores
// podem consultar o registro por meio das regras aplicadas no controlador.
public class RelatoInclusao {
 public int Id {get;set;}
 public string Categoria {get;set;}="";
 public string Descricao {get;set;}="";
 public string Status {get;set;}="Recebido";
 public int UsuarioId {get;set;}
 public string UsuarioNome {get;set;}="";
 public DateTime DataCriacao {get;set;}=DateTime.UtcNow;
 public DateTime? DataAtualizacao {get;set;}
}
