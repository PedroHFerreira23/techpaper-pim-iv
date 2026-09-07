using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TechPaperAPI.Data;
namespace TechPaperAPI.Security;
public class SessionAuthentication(IOptionsMonitor<AuthenticationSchemeOptions> options,ILoggerFactory logger,UrlEncoder encoder,AppDbContext db)
 :AuthenticationHandler<AuthenticationSchemeOptions>(options,logger,encoder) {
 public static string Hash(string token)=>Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
 public static string? Token(HttpRequest request) {
  var h=request.Headers.Authorization.ToString();return h.StartsWith("Bearer ",StringComparison.OrdinalIgnoreCase)?h[7..]:request.Cookies["techpaper_session"];
 }
 protected override async Task<AuthenticateResult> HandleAuthenticateAsync() {
  var token=Token(Request);if(string.IsNullOrEmpty(token))return AuthenticateResult.NoResult();
  var hash=Hash(token);
  var session=await db.Sessoes.AsNoTracking().FirstOrDefaultAsync(x=>x.TokenHash==hash && x.ExpiraEm>DateTime.UtcNow);
  if(session is null)return AuthenticateResult.Fail("Sessão expirada.");
  var user=await db.Usuarios.AsNoTracking().FirstOrDefaultAsync(x=>x.Id==session.UsuarioId && x.Ativo);
  if(user is null)return AuthenticateResult.Fail("Usuário inativo.");
  var identity=new ClaimsIdentity(new[]{new Claim(ClaimTypes.NameIdentifier,user.Id.ToString()),new Claim(ClaimTypes.Name,user.Name),new Claim(ClaimTypes.Role,user.Role)},Scheme.Name);
  return AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity),Scheme.Name));
 }
 protected override Task HandleChallengeAsync(AuthenticationProperties properties) {Response.StatusCode=401;return Response.WriteAsJsonAsync(new {message="Faça login para continuar."});}
 protected override Task HandleForbiddenAsync(AuthenticationProperties properties) {Response.StatusCode=403;return Response.WriteAsJsonAsync(new {message="Seu perfil não permite esta operação."});}
}
