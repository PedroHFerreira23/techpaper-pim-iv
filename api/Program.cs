using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Threading.RateLimiting;
using TechPaperAPI.Data;
using TechPaperAPI.Models;
using TechPaperAPI.Security;
using TechPaperAPI.Services;

var builder=WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();builder.Logging.AddConsole();
builder.Services.AddControllers();
var connection=builder.Configuration.GetConnectionString("DefaultConnection");
if(string.IsNullOrWhiteSpace(connection))connection=Environment.GetEnvironmentVariable("DATABASE_URL");
if(string.IsNullOrWhiteSpace(connection))throw new InvalidOperationException("Configure ConnectionStrings__DefaultConnection ou DATABASE_URL para PostgreSQL.");
connection=NormalizePostgresUrl(connection);
builder.Services.AddDbContext<AppDbContext>(o=>o.UseNpgsql(connection,n=>n.EnableRetryOnFailure()));
builder.Services.AddScoped<IPasswordHasher<Usuario>,PasswordHasher<Usuario>>();
builder.Services.AddScoped<EstoqueService>();builder.Services.AddScoped<OrcamentoService>();
builder.Services.AddAuthentication("Session").AddScheme<AuthenticationSchemeOptions,SessionAuthentication>("Session",null);
builder.Services.AddAuthorization(o=>o.FallbackPolicy=new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build());
builder.Services.AddRateLimiter(o=> {o.RejectionStatusCode=429;o.AddPolicy("login",ctx=>RateLimitPartition.GetFixedWindowLimiter(ctx.Connection.RemoteIpAddress?.ToString()??"unknown",_=>new FixedWindowRateLimiterOptions {PermitLimit=15,Window=TimeSpan.FromMinutes(1),QueueLimit=0}));});
var app=builder.Build();
app.Use(async(ctx,next)=> {
 try {await next();}
 catch(DbUpdateConcurrencyException) {ctx.Response.StatusCode=409;await ctx.Response.WriteAsJsonAsync(new {message="Os dados mudaram. Atualize a tela e tente novamente."});}
 catch(Exception ex) when(ex is PostgresException || ex is DbUpdateException) {
  app.Logger.LogWarning(ex,"Operação de banco rejeitada");
  var sql=ex as PostgresException ?? ex.InnerException as PostgresException;
  ctx.Response.StatusCode=sql?.SqlState is PostgresErrorCodes.RaiseException or PostgresErrorCodes.UniqueViolation or PostgresErrorCodes.ForeignKeyViolation or PostgresErrorCodes.CheckViolation?409:503;
  await ctx.Response.WriteAsJsonAsync(new {message=sql?.SqlState==PostgresErrorCodes.RaiseException?sql.MessageText:ctx.Response.StatusCode==409?"Operação conflita com os dados existentes.":"Banco indisponível. Tente novamente."});
 }
 catch(ArgumentException ex) {ctx.Response.StatusCode=400;await ctx.Response.WriteAsJsonAsync(new {message=ex.Message});}
 catch(Exception ex) {app.Logger.LogError(ex,"Falha não prevista");ctx.Response.StatusCode=500;await ctx.Response.WriteAsJsonAsync(new {message="Não foi possível concluir a operação."});}
});
app.Use(async(ctx,next)=> {
 ctx.Response.Headers["X-Content-Type-Options"]="nosniff";ctx.Response.Headers["Referrer-Policy"]="same-origin";
 if(ctx.Request.Path.StartsWithSegments("/api")) {
  ctx.Response.Headers.CacheControl="no-store";
  if(!HttpMethods.IsGet(ctx.Request.Method) && !HttpMethods.IsHead(ctx.Request.Method)) {
   var origin=ctx.Request.Headers.Origin.ToString();
   if(!((ctx.Request.Headers["X-TechPaper-Client"]=="mobile" && origin.Length==0) || (Uri.TryCreate(origin,UriKind.Absolute,out var originUri) && string.Equals(originUri.Authority,ctx.Request.Host.Value,StringComparison.OrdinalIgnoreCase)))) {
    ctx.Response.StatusCode=403;await ctx.Response.WriteAsJsonAsync(new {message="Origem da requisição não permitida."});return;
   }
  }
 }
 await next();
});
app.UseDefaultFiles();app.UseStaticFiles();app.UseRouting();app.UseRateLimiter();app.UseAuthentication();app.UseAuthorization();
app.MapControllers();
app.MapGet("/health",()=>Results.Ok(new {status="ok"})).AllowAnonymous();
app.MapGet("/health/ready",async(AppDbContext db)=>await db.Database.CanConnectAsync()?Results.Ok(new {status="ready"}):Results.StatusCode(503)).AllowAnonymous();
await DatabaseInitializer.Run(app);
if(builder.Configuration.GetValue<bool>("Bootstrap:Enabled")) {
 using var scope=app.Services.CreateScope();var db=scope.ServiceProvider.GetRequiredService<AppDbContext>();
 if(!await db.Usuarios.AnyAsync()) {
  var login=builder.Configuration["Bootstrap:Login"];var password=builder.Configuration["Bootstrap:Password"];
  if(string.IsNullOrWhiteSpace(login)||password is null||password.Length<10)throw new InvalidOperationException("Bootstrap requer login e senha de pelo menos 10 caracteres.");
  var u=new Usuario{Name="Administrador",Login=login.Trim().ToLowerInvariant(),Role="Admin"};u.Password=scope.ServiceProvider.GetRequiredService<IPasswordHasher<Usuario>>().HashPassword(u,password);db.Usuarios.Add(u);await db.SaveChangesAsync();
 }
}
app.Run();

static string NormalizePostgresUrl(string value) {
 if(!value.StartsWith("postgres://",StringComparison.OrdinalIgnoreCase) && !value.StartsWith("postgresql://",StringComparison.OrdinalIgnoreCase))return value;
 var uri=new Uri(value);var credentials=uri.UserInfo.Split(':',2);
 var cs=new NpgsqlConnectionStringBuilder {Host=uri.Host,Port=uri.IsDefaultPort?5432:uri.Port,Database=Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/')),
  Username=Uri.UnescapeDataString(credentials[0]),Password=credentials.Length>1?Uri.UnescapeDataString(credentials[1]):"",SslMode=SslMode.Require};
 return cs.ConnectionString;
}
