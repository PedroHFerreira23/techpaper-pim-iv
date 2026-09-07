using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechPaperAPI.Contracts;
using TechPaperAPI.Data;
using TechPaperAPI.Models;
namespace TechPaperAPI.Controllers;
[ApiController,Route("api/fornecedores"),Authorize]
public class FornecedoresController(AppDbContext db):ControllerBase {
 [HttpGet] public async Task<IActionResult> Get()=>Ok(await db.Fornecedores.AsNoTracking().OrderBy(x=>x.NomeFantasia).ToListAsync());
 [HttpGet("{id:int}")] public async Task<IActionResult> GetById(int id){var f=await db.Fornecedores.FindAsync(id);return f is null?NotFound():Ok(f);}
 static void Apply(Fornecedor f,FornecedorRequest r){f.Cnpj=r.Cnpj;f.RazaoSocial=r.RazaoSocial.Trim();f.NomeFantasia=r.NomeFantasia.Trim();f.Segmento=r.Segmento;f.Telefone=r.Telefone;f.Email=r.Email;f.PrazoEntregaDias=r.PrazoEntregaDias;}
 [HttpPost,Authorize(Roles="Admin,Supervisor")] public async Task<IActionResult> Post(FornecedorRequest r){var f=new Fornecedor{DataCriacao=DateTime.UtcNow};Apply(f,r);db.Fornecedores.Add(f);await db.SaveChangesAsync();return Ok(f);}
 [HttpPut("{id:int}"),Authorize(Roles="Admin,Supervisor")] public async Task<IActionResult> Put(int id,FornecedorRequest r){var f=await db.Fornecedores.FindAsync(id);if(f is null)return NotFound();Apply(f,r);await db.SaveChangesAsync();return Ok(f);}
 [HttpDelete("{id:int}"),Authorize(Roles="Admin")] public async Task<IActionResult> Delete(int id){var f=await db.Fornecedores.FindAsync(id);if(f is null)return NotFound();db.Fornecedores.Remove(f);await db.SaveChangesAsync();return NoContent();}
}
