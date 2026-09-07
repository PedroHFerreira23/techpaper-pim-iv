using System.Data;
using Microsoft.EntityFrameworkCore;
using TechPaperAPI.Contracts;
using TechPaperAPI.Data;
namespace TechPaperAPI.Services;
public class EstoqueService(AppDbContext db) {
 public async Task<int> Registrar(MovimentoRequest r,int usuarioId) {
  if(!Guid.TryParse(r.ChaveOperacao,out var chave))throw new ArgumentException("Chave de operação inválida.");
  var tipo=r.Tipo.Trim().ToLowerInvariant();tipo=tipo=="saída"?"saida":tipo;
  if(tipo is not ("entrada" or "saida"))throw new ArgumentException("Tipo inválido.");
  await db.Database.OpenConnectionAsync();
  try {
   using var cmd=db.Database.GetDbConnection().CreateCommand();cmd.CommandType=CommandType.Text;
   cmd.CommandText="SELECT sp_registrar_movimentacao(@p_produto,@p_tipo,@p_quantidade,@p_motivo,@p_usuario,@p_chave)";
   Add(cmd,"p_produto",DbType.Int32,r.ProdutoId);Add(cmd,"p_tipo",DbType.String,tipo=="entrada"?"Entrada":"Saida");
   Add(cmd,"p_quantidade",DbType.Int32,r.Quantidade);Add(cmd,"p_motivo",DbType.String,r.Motivo.Trim());Add(cmd,"p_usuario",DbType.Int32,usuarioId);Add(cmd,"p_chave",DbType.String,chave.ToString());
   return Convert.ToInt32(await cmd.ExecuteScalarAsync());
  }finally {await db.Database.CloseConnectionAsync();}
 }
 private static void Add(System.Data.Common.DbCommand cmd,string name,DbType type,object value){var p=cmd.CreateParameter();p.ParameterName=name;p.DbType=type;p.Value=value;cmd.Parameters.Add(p);}
}
