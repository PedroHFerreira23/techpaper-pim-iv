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
 private static async Task Execute(AppDbContext db,string file) {
  var assembly=Assembly.GetExecutingAssembly();
  var resource=assembly.GetManifestResourceNames().Single(x=>x.EndsWith(file,StringComparison.Ordinal));
  await using var stream=assembly.GetManifestResourceStream(resource) ?? throw new InvalidOperationException($"Script {file} não encontrado.");
  using var reader=new StreamReader(stream);
  await db.Database.ExecuteSqlRawAsync(await reader.ReadToEndAsync());
 }
}
