using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TechPaperAPI.Contracts;
using TechPaperAPI.Data;
using TechPaperAPI.Services;
namespace TechPaperAPI.Controllers;
[ApiController,Route("api/movimentacoes"),Authorize]
public class MovimentacoesController(AppDbContext db,EstoqueService estoque):ControllerBase {
 [HttpGet] public async Task<IActionResult> Get(){var rows=await db.Movimentacoes.AsNoTracking().OrderByDescending(x=>x.DataHora).ThenByDescending(x=>x.Id).ToListAsync();return Ok(rows.Select(ToResponse));}
 [HttpPost] public async Task<IActionResult> Post(MovimentoRequest r){var id=await estoque.Registrar(r,int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!));var row=await db.Movimentacoes.AsNoTracking().SingleAsync(x=>x.Id==id);return Ok(ToResponse(row));}
 private static object ToResponse(TechPaperAPI.Models.Movimentacao m)=>new {m.Id,m.Tipo,m.ProdutoId,m.ProdutoNome,m.Quantidade,m.Motivo,m.Responsavel,m.ResponsavelId,m.ChaveOperacao,DataHora=AsUtc(m.DataHora)};
 private static DateTimeOffset AsUtc(DateTime value)=>new(value.Kind==DateTimeKind.Utc?value:value.Kind==DateTimeKind.Local?value.ToUniversalTime():DateTime.SpecifyKind(value,DateTimeKind.Utc));
}
