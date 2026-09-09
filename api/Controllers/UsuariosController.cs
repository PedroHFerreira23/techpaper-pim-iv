using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;
using TechPaperAPI.Contracts;
using TechPaperAPI.Data;
using TechPaperAPI.Models;
using TechPaperAPI.Security;
namespace TechPaperAPI.Controllers;
[ApiController,Route("api/usuarios"),Authorize]
public class UsuariosController(AppDbContext db,IPasswordHasher<Usuario> hasher):ControllerBase {
 [HttpPost("login"),AllowAnonymous,EnableRateLimiting("login")]
 public async Task<IActionResult> Login(LoginRequest r) {
  var login=r.Login.Trim().ToLowerInvariant();var u=await db.Usuarios.FirstOrDefaultAsync(x=>x.Login==login && x.Ativo);
  PasswordVerificationResult result=PasswordVerificationResult.Failed;
  if(u is not null) {try {result=hasher.VerifyHashedPassword(u,u.Password,r.Password);}catch(FormatException) {}}
  if(u is null||result==PasswordVerificationResult.Failed)return Unauthorized(new {message="E-mail ou senha inválidos."});
  if(result==PasswordVerificationResult.SuccessRehashNeeded)u.Password=hasher.HashPassword(u,r.Password);
  var token=Convert.ToHexString(RandomNumberGenerator.GetBytes(32));var expiry=DateTime.UtcNow.AddHours(8);
  db.Sessoes.Add(new Sessao {TokenHash=SessionAuthentication.Hash(token),UsuarioId=u.Id,ExpiraEm=expiry});
  await db.Sessoes.Where(x=>x.ExpiraEm<DateTime.UtcNow).ExecuteDeleteAsync();await db.SaveChangesAsync();
  bool mobile=Request.Headers["X-TechPaper-Client"]=="mobile";
  if(!mobile)Response.Cookies.Append("techpaper_session",token,new CookieOptions {HttpOnly=true,Secure=Request.IsHttps,SameSite=SameSiteMode.Strict,Expires=expiry,Path="/"});
  return Ok(new {usuario=u,accessToken=mobile?token:null,expiraEm=expiry});
 }
 [HttpGet("me")] public async Task<IActionResult> Me()=>Ok(await db.Usuarios.FindAsync(int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!)));
 // PATCH limita a escrita às preferências do próprio usuário autenticado.
 // Nome, perfil, senha e situação da conta continuam protegidos pelos fluxos administrativos.
 [HttpPatch("me/preferencias")]
 public async Task<IActionResult> PatchPreferencias(PreferenciasUsuarioRequest r) {
  var id=int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
  var u=await db.Usuarios.FindAsync(id);if(u is null||!u.Ativo)return NotFound();
  u.TemaEscuro=r.TemaEscuro;u.AvatarId=r.AvatarId;
  await db.SaveChangesAsync();return Ok(u);
 }
 [HttpPost("logout")] public async Task<IActionResult> Logout() {
  var token=SessionAuthentication.Token(Request);if(token is not null) {var hash=SessionAuthentication.Hash(token);await db.Sessoes.Where(x=>x.TokenHash==hash).ExecuteDeleteAsync();}
  Response.Cookies.Delete("techpaper_session");return NoContent();
 }
 [HttpGet,Authorize(Roles="Admin")] public async Task<IActionResult> Get()=>Ok(await db.Usuarios.AsNoTracking().Where(x=>x.Ativo).ToListAsync());
 [HttpPost,Authorize(Roles="Admin")] public async Task<IActionResult> Post(UsuarioRequest r) {
  if(string.IsNullOrEmpty(r.Password))return BadRequest(new {message="Informe uma senha de pelo menos 10 caracteres."});
  var u=new Usuario{Name=r.Name.Trim(),Login=r.Login.Trim().ToLowerInvariant(),Role=r.Role};u.Password=hasher.HashPassword(u,r.Password);db.Usuarios.Add(u);await db.SaveChangesAsync();return Ok(u);
 }
 [HttpPut("{id:int}"),Authorize(Roles="Admin")] public async Task<IActionResult> Put(int id,UsuarioRequest r) {
  var u=await db.Usuarios.FindAsync(id);if(u is null||!u.Ativo)return NotFound();
  if(id.ToString()==User.FindFirstValue(ClaimTypes.NameIdentifier)&&r.Role!="Admin")return BadRequest(new {message="Não altere seu próprio perfil administrativo."});
  u.Name=r.Name.Trim();u.Login=r.Login.Trim().ToLowerInvariant();u.Role=r.Role;
  if(!string.IsNullOrEmpty(r.Password))u.Password=hasher.HashPassword(u,r.Password);
  await db.Sessoes.Where(x=>x.UsuarioId==id).ExecuteDeleteAsync();await db.SaveChangesAsync();return Ok(u);
 }
 [HttpDelete("{id:int}"),Authorize(Roles="Admin")] public async Task<IActionResult> Delete(int id) {
  if(id.ToString()==User.FindFirstValue(ClaimTypes.NameIdentifier))return BadRequest(new {message="Não é permitido desativar sua própria conta."});
  var u=await db.Usuarios.FindAsync(id);if(u is null)return NotFound();u.Ativo=false;
  await db.Sessoes.Where(x=>x.UsuarioId==id).ExecuteDeleteAsync();await db.SaveChangesAsync();return NoContent();
 }
}
