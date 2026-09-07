using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TechPaperAPI.Contracts;
using TechPaperAPI.Data;
using TechPaperAPI.Models;
using TechPaperAPI.Services;
namespace TechPaperAPI.Controllers;
[ApiController,Route("api/orcamentos"),Authorize]
public class OrcamentosController(AppDbContext db,OrcamentoService service):ControllerBase {
 [HttpGet] public async Task<IActionResult> Get()=>Ok(await db.Orcamentos.AsNoTracking().Include(x=>x.Itens).OrderByDescending(x=>x.Id).ToListAsync());
 [HttpGet("{id:int}")] public async Task<IActionResult> GetById(int id){var o=await db.Orcamentos.AsNoTracking().Include(x=>x.Itens).SingleOrDefaultAsync(x=>x.Id==id);return o is null?NotFound():Ok(o);}
 [HttpPost] public async Task<IActionResult> Post(OrcamentoRequest r){var o=new Orcamento {UsuarioId=int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!)};await service.Preencher(o,r);db.Orcamentos.Add(o);await db.SaveChangesAsync();return CreatedAtAction(nameof(GetById),new{id=o.Id},o);}
 [HttpPut("{id:int}")] public async Task<IActionResult> Put(int id,OrcamentoRequest r){
  var o=await db.Orcamentos.Include(x=>x.Itens).SingleOrDefaultAsync(x=>x.Id==id);if(o is null)return NotFound();
  if(User.IsInRole("Operador")&&o.UsuarioId.ToString()!=User.FindFirstValue(ClaimTypes.NameIdentifier))return Forbid();
  if(o.Status!="Rascunho"||o.Versao!=r.Versao)return Conflict(new{message="Orçamento não está em rascunho ou foi alterado. Atualize a tela."});
  await service.Preencher(o,r);o.Versao++;await db.SaveChangesAsync();return Ok(o);
 }
 [HttpPatch("{id:int}/status"),Authorize(Roles="Admin,Supervisor")] public async Task<IActionResult> Status(int id,StatusRequest r){
  var o=await db.Orcamentos.FindAsync(id);if(o is null)return NotFound();
  if(o.Status!="Rascunho"||o.Versao!=r.Versao)return Conflict(new{message="Somente rascunhos atuais podem mudar de status."});
  if(r.Status=="Aprovado"&&o.Validade.Date<DateTime.UtcNow.Date)return Conflict(new{message="Orçamento vencido. Revise a validade."});
  o.Status=r.Status;o.Versao++;await db.SaveChangesAsync();return Ok(o);
 }
}
