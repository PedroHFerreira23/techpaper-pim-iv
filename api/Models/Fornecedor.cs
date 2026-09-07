namespace TechPaperAPI.Models {
    public class Fornecedor {
        public int Id { get; set; }
        public string Cnpj { get; set; } = string.Empty;
        public string RazaoSocial { get; set; } = string.Empty;
        public string NomeFantasia { get; set; } = string.Empty;
        public string Segmento { get; set; } = string.Empty;
        public string Telefone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int PrazoEntregaDias { get; set; }
        public DateTime DataCriacao { get; set; } // Nova coluna adicionada
    }
}