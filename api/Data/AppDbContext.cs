using Microsoft.EntityFrameworkCore;
using TechPaperAPI.Models;
namespace TechPaperAPI.Data;
public class AppDbContext(DbContextOptions<AppDbContext> options):DbContext(options) {
 public DbSet<Produto> Produtos=>Set<Produto>(); public DbSet<Fornecedor> Fornecedores=>Set<Fornecedor>();
 public DbSet<Usuario> Usuarios=>Set<Usuario>(); public DbSet<Movimentacao> Movimentacoes=>Set<Movimentacao>();
 public DbSet<Sessao> Sessoes=>Set<Sessao>(); public DbSet<Orcamento> Orcamentos=>Set<Orcamento>();
 public DbSet<RelatoInclusao> RelatosInclusao=>Set<RelatoInclusao>();
 protected override void OnModelCreating(ModelBuilder m) {
  m.Entity<Usuario>().ToTable("usuarios"); m.Entity<Usuario>().HasIndex(x=>x.Login).IsUnique();
  m.Entity<Fornecedor>().ToTable("fornecedores");
  m.Entity<Produto>().ToTable("produtos"); m.Entity<Produto>().HasIndex(x=>x.Sku).IsUnique();
  m.Entity<Produto>().Property(x=>x.PrecoCusto).HasPrecision(18,2);m.Entity<Produto>().Property(x=>x.PrecoVenda).HasPrecision(18,2);
  m.Entity<Produto>().HasOne<Fornecedor>().WithMany().HasForeignKey(x=>x.FornecedorId).OnDelete(DeleteBehavior.Restrict);
  m.Entity<Movimentacao>().ToTable("movimentacoes");m.Entity<Movimentacao>().HasIndex(x=>x.ChaveOperacao).IsUnique();
  m.Entity<Movimentacao>().HasOne<Produto>().WithMany().HasForeignKey(x=>x.ProdutoId).OnDelete(DeleteBehavior.Restrict);
  m.Entity<Movimentacao>().HasOne<Usuario>().WithMany().HasForeignKey(x=>x.ResponsavelId).OnDelete(DeleteBehavior.Restrict);
  m.Entity<Sessao>().ToTable("sessoes").HasKey(x=>x.TokenHash);
  m.Entity<Sessao>().HasOne<Usuario>().WithMany().HasForeignKey(x=>x.UsuarioId).OnDelete(DeleteBehavior.Cascade);
  m.Entity<Orcamento>().ToTable("orcamentos");m.Entity<Orcamento>().Property(x=>x.Total).HasPrecision(18,2);
  m.Entity<Orcamento>().Property(x=>x.Validade).HasColumnType("date");
  m.Entity<Orcamento>().Property(x=>x.Versao).IsConcurrencyToken();
  m.Entity<Orcamento>().HasOne<Usuario>().WithMany().HasForeignKey(x=>x.UsuarioId).OnDelete(DeleteBehavior.Restrict);
  m.Entity<Orcamento>().HasMany(x=>x.Itens).WithOne().HasForeignKey(x=>x.OrcamentoId).OnDelete(DeleteBehavior.Cascade);
  m.Entity<ItemOrcamento>().ToTable("itens_orcamento");m.Entity<ItemOrcamento>().Property(x=>x.PrecoUnitario).HasPrecision(18,2);
  m.Entity<ItemOrcamento>().Property(x=>x.Subtotal).HasPrecision(18,2);
  m.Entity<ItemOrcamento>().HasOne<Produto>().WithMany().HasForeignKey(x=>x.ProdutoId).OnDelete(DeleteBehavior.Restrict);
  m.Entity<RelatoInclusao>().ToTable("relatos_inclusao");
  m.Entity<RelatoInclusao>().HasOne<Usuario>().WithMany().HasForeignKey(x=>x.UsuarioId).OnDelete(DeleteBehavior.Restrict);
 }
}
