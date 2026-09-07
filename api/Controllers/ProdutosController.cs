using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechPaperAPI.Contracts;
using TechPaperAPI.Data;
using TechPaperAPI.Models;
namespace TechPaperAPI.Controllers;
[ApiController,Route("api/produtos"),Authorize]
public class ProdutosController(AppDbContext db):ControllerBase {
 [HttpGet] public async Task<IActionResult> Get([FromQuery]string? busca)=>Ok(await db.Produtos.AsNoTracking().Where(p=>busca==null||p.Nome.Contains(busca)||p.Sku.Contains(busca)).OrderBy(x=>x.Nome).ToListAsync());
 [HttpGet("{id:int}")] public async Task<IActionResult> GetById(int id) {var p=await db.Produtos.FindAsync(id);return p is null?NotFound():Ok(p);}
 async Task Apply(Produto p,ProdutoRequest r) {
  Fornecedor? f=null;if(r.FornecedorId is not null)f=await db.Fornecedores.FindAsync(r.FornecedorId);
  else if(!string.IsNullOrWhiteSpace(r.Fornecedor))f=await db.Fornecedores.FirstOrDefaultAsync(x=>x.NomeFantasia==r.Fornecedor||x.RazaoSocial==r.Fornecedor);
  if(f is null)throw new ArgumentException("Selecione um fornecedor cadastrado.");
  p.Sku=r.Sku.Trim();p.Nome=r.Nome.Trim();p.Categoria=r.Categoria.Trim();p.FornecedorId=f.Id;p.Fornecedor=f.NomeFantasia;p.PrecoCusto=r.PrecoCusto;p.PrecoVenda=r.PrecoVenda;
 }
 [HttpPost,Authorize(Roles="Admin,Supervisor")] public async Task<IActionResult> Post(ProdutoRequest r) {
  if(r.Estoque!=0)return BadRequest(new {message="Cadastre com saldo zero e registre uma entrada de estoque."});
  var p=new Produto();await Apply(p,r);db.Produtos.Add(p);await db.SaveChangesAsync();return CreatedAtAction(nameof(GetById),new {id=p.Id},p);
 }
 [HttpPut("{id:int}"),Authorize(Roles="Admin,Supervisor")] public async Task<IActionResult> Put(int id,ProdutoRequest r) {
  var p=await db.Produtos.FindAsync(id);if(p is null)return NotFound();
  if(r.Estoque!=p.Estoque)return Conflict(new {message="O saldo mudou ou foi editado. Atualize e utilize Movimentações para alterar o estoque."});
  await Apply(p,r);await db.SaveChangesAsync();return Ok(p);
 }
 [HttpDelete("{id:int}"),Authorize(Roles="Admin")] public async Task<IActionResult> Delete(int id) {
  var p=await db.Produtos.FindAsync(id);if(p is null)return NotFound();db.Produtos.Remove(p);await db.SaveChangesAsync();return NoContent();
 }
}
