using System.Reflection;
using Microsoft.EntityFrameworkCore;

namespace TechPaperAPI.Data;

public static class DatabaseInitializer {
 public static async Task Run(WebApplication app) {
  if(!app.Configuration.GetValue<bool>("DatabaseInit:Enabled"))return;
  using var scope=app.Services.CreateScope();
  var db=scope.ServiceProvider.GetRequiredService<AppDbContext>();
  await db.Database.OpenConnectionAsync();
  try {
   await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_lock(84723104)");
   foreach(var file in new[]{"001_schema.sql","002_routines.sql"})await Execute(db,file);
   if(app.Configuration.GetValue<bool>("DatabaseInit:DemoData"))await Execute(db,"003_demo.sql");
  } finally {
   try {await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_unlock(84723104)");} finally {await db.Database.CloseConnectionAsync();}
  }
 }
 // Lote opcional e isolado. Em colisão, a transação reverte sem impedir a inicialização.
 public static async Task Apresentacao(WebApplication app) {
  if(!app.Configuration.GetValue<bool>("Presentation:SeedOnStart"))return;
  using var scope=app.Services.CreateScope();
  var db=scope.ServiceProvider.GetRequiredService<AppDbContext>();
  try {
   await Execute(db,"005_apresentacao.sql");
   var qtd=await db.Produtos.CountAsync(p=>p.Sku.StartsWith("PIM-DEMO-"));
   var movimentos=await db.Movimentacoes.CountAsync(m=>m.UsuarioId=="lote-banca-v1@example.invalid");
   var orcamentos=await db.Orcamentos.CountAsync(o=>o.UsuarioId==db.Usuarios.Where(u=>u.Login=="lote-banca-v1@example.invalid").Select(u=>u.Id).First());
   app.Logger.LogInformation("Lote PIM conferido: {Produtos} produtos, {Movimentos} movimentos e {Orcamentos} orçamentos.",qtd,movimentos,orcamentos);
  } catch(Npgsql.PostgresException e) {app.Logger.LogWarning("Lote PIM não aplicado. Código PostgreSQL: {Codigo}. Os dados anteriores foram preservados.",e.SqlState);}
 }
 private static async Task Execute(AppDbContext db,string file) {
  var assembly=Assembly.GetExecutingAssembly();
  var resource=assembly.GetManifestResourceNames().Single(x=>x.EndsWith(file,StringComparison.Ordinal));
  await using var stream=assembly.GetManifestResourceStream(resource) ?? throw new InvalidOperationException($"Script {file} não encontrado.");
  using var reader=new StreamReader(stream);
  await db.Database.ExecuteSqlRawAsync(await reader.ReadToEndAsync());
 }
}
