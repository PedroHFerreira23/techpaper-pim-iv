using System.Text.Json.Serialization;
namespace TechPaperAPI.Models;
public class Usuario {
 public int Id {get;set;} public string Name {get;set;}=""; public string Login {get;set;}="";
 [JsonIgnore] public string Password {get;set;}="";
 public string Role {get;set;}="Operador"; public bool Ativo {get;set;}=true; public DateTime DataCriacao {get;set;}=DateTime.UtcNow;
}
public class Sessao { public string TokenHash {get;set;}=""; public int UsuarioId {get;set;} public DateTime ExpiraEm {get;set;} }
