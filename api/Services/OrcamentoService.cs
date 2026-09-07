using Microsoft.EntityFrameworkCore;
using TechPaperAPI.Contracts;
using TechPaperAPI.Data;
using TechPaperAPI.Models;
namespace TechPaperAPI.Services;
public class OrcamentoService(AppDbContext db) {
 public async Task Preencher(Orcamento o,OrcamentoRequest r) {
  if(r.Validade.Date<DateTime.UtcNow.Date||r.Validade.Date>DateTime.UtcNow.Date.AddYears(1))throw new ArgumentException("Validade deve estar entre hoje e um ano.");
  if(r.Itens.Select(x=>x.ProdutoId).Distinct().Count()!=r.Itens.Count)throw new ArgumentException("Agrupe os itens do mesmo produto.");
  var ids=r.Itens.Select(x=>x.ProdutoId).ToList();var produtos=await db.Produtos.Where(x=>ids.Contains(x.Id)).ToDictionaryAsync(x=>x.Id);
  if(produtos.Count!=ids.Count)throw new ArgumentException("Um produto não existe mais. Atualize a lista.");
  o.Cliente=r.Cliente.Trim();o.Observacoes=r.Observacoes?.Trim()??"";o.Validade=r.Validade.Date;
  o.Itens.Clear();foreach(var i in r.Itens){var p=produtos[i.ProdutoId];o.Itens.Add(new ItemOrcamento {ProdutoId=p.Id,ProdutoNome=p.Nome,Quantidade=i.Quantidade,PrecoUnitario=p.PrecoVenda,Subtotal=decimal.Round(p.PrecoVenda*i.Quantidade,2)});}
  o.Total=o.Itens.Sum(x=>x.Subtotal);
 }
}
