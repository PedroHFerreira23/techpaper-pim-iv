using System.ComponentModel.DataAnnotations;
namespace TechPaperAPI.Contracts;
public record LoginRequest([Required,StringLength(100)] string Login,[Required,StringLength(128)] string Password);
public record UsuarioRequest([Required,StringLength(100)] string Name,[Required,EmailAddress,StringLength(100)] string Login,
 [StringLength(128,MinimumLength=10)] string? Password,[Required,RegularExpression("^(Admin|Supervisor|Operador)$")] string Role);
public record ProdutoRequest([Required,StringLength(50)] string Sku,[Required,StringLength(100)] string Nome,
 [Required,StringLength(50)] string Categoria,[StringLength(150)] string? Fornecedor,int? FornecedorId,
 [Range(typeof(decimal),"0","999999999.99",ParseLimitsInInvariantCulture=true)] decimal PrecoCusto,[Range(typeof(decimal),"0","999999999.99",ParseLimitsInInvariantCulture=true)] decimal PrecoVenda,int Estoque=0);
public record MovimentoRequest([Range(1,int.MaxValue)] int ProdutoId,[Required] string Tipo,[Range(1,1000000)] int Quantidade,
 [Required,StringLength(100)] string Motivo,[Required,StringLength(36,MinimumLength=36)] string ChaveOperacao);
public record ItemRequest([Range(1,int.MaxValue)] int ProdutoId,[Range(1,1000000)] int Quantidade);
public record OrcamentoRequest([Required,StringLength(150)] string Cliente,[StringLength(1000)] string? Observacoes,DateTime Validade,
 [Required,MinLength(1),MaxLength(100)] List<ItemRequest> Itens,int Versao=1);
public record StatusRequest([Required,RegularExpression("^(Aprovado|Cancelado)$")] string Status,int Versao);
public record FornecedorRequest([Required,StringLength(18)] string Cnpj,[Required,StringLength(150)] string RazaoSocial,
 [Required,StringLength(150)] string NomeFantasia,[Required,StringLength(50)] string Segmento,
 [Required,StringLength(20)] string Telefone,[Required,EmailAddress,StringLength(100)] string Email,[Range(0,365)] int PrazoEntregaDias);
