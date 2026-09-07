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
 [HttpGet] public async Task<IActionResult> Get()=>Ok(await db.Movimentacoes.AsNoTracking().OrderByDescending(x=>x.DataHora).ThenByDescending(x=>x.Id).ToListAsync());
 [HttpPost] public async Task<IActionResult> Post(MovimentoRequest r){var id=await estoque.Registrar(r,int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!));return Ok(await db.Movimentacoes.AsNoTracking().SingleAsync(x=>x.Id==id));}
}
