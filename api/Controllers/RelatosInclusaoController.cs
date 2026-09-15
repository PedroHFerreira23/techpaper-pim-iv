using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TechPaperAPI.Contracts;
using TechPaperAPI.Data;
using TechPaperAPI.Models;

namespace TechPaperAPI.Controllers;

[ApiController,Route("api/relatos-inclusao"),Authorize]
public class RelatosInclusaoController(AppDbContext db):ControllerBase {
 [HttpGet]
 public async Task<IActionResult> Get() {
  var usuarioId=int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
  var consulta=db.RelatosInclusao.AsNoTracking();
  if(!User.IsInRole("Admin"))consulta=consulta.Where(x=>x.UsuarioId==usuarioId);
  var relatos=await consulta.OrderByDescending(x=>x.DataCriacao).ThenByDescending(x=>x.Id).ToListAsync();
  return Ok(relatos.Select(x=>Resposta(x,User.IsInRole("Admin"))));
 }

 [HttpPost]
 public async Task<IActionResult> Post(RelatoInclusaoRequest request) {
  var usuarioId=int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
  var usuario=await db.Usuarios.AsNoTracking().SingleAsync(x=>x.Id==usuarioId&&x.Ativo);
  var relato=new RelatoInclusao {
   Categoria=request.Categoria,Descricao=request.Descricao.Trim(),UsuarioId=usuario.Id,
   UsuarioNome=usuario.Name,Status="Recebido",DataCriacao=DateTime.UtcNow
  };
  db.RelatosInclusao.Add(relato);await db.SaveChangesAsync();
  return Created($"/api/relatos-inclusao/{relato.Id}",Resposta(relato,false));
 }

 [HttpPatch("{id:int}/status"),Authorize(Roles="Admin")]
 public async Task<IActionResult> PatchStatus(int id,StatusRelatoRequest request) {
  var relato=await db.RelatosInclusao.FindAsync(id);if(relato is null)return NotFound();
  relato.Status=request.Status;relato.DataAtualizacao=DateTime.UtcNow;
  await db.SaveChangesAsync();return Ok(Resposta(relato,true));
 }

 private static object Resposta(RelatoInclusao x,bool exibirAutor)=>new {
  x.Id,x.Categoria,x.Descricao,x.Status,
  UsuarioNome=exibirAutor?x.UsuarioNome:null,
  DataCriacao=DateTime.SpecifyKind(x.DataCriacao,DateTimeKind.Utc),
  DataAtualizacao=x.DataAtualizacao is null?(DateTime?)null:DateTime.SpecifyKind(x.DataAtualizacao.Value,DateTimeKind.Utc)
 };
}
