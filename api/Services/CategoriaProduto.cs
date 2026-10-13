namespace TechPaperAPI.Services;

// Centraliza a nomenclatura apresentada pelo portal e pelo aplicativo.
// A API grava a forma canônica para impedir diferenças de caixa, acentuação
// ou singular/plural entre clientes que compartilham o mesmo banco.
public static class CategoriaProduto {
 public static string Canonicalizar(string valor) {
  var texto=string.Join(' ',valor.Trim().Split(' ',StringSplitOptions.RemoveEmptyEntries));
  var chave=texto.ToLowerInvariant()
   .Replace("á","a").Replace("à","a").Replace("â","a").Replace("ã","a")
   .Replace("é","e").Replace("ê","e").Replace("í","i")
   .Replace("ó","o").Replace("ô","o").Replace("õ","o").Replace("ú","u").Replace("ç","c");
  return chave switch {
   "caderno" or "cadernos"=>"Cadernos",
   "escrita" or "caneta" or "canetas" or "lapis"=>"Escrita",
   "material escolar" or "materiais escolares"=>"Material escolar",
   "organizacao"=>"Organização",
   "arte" or "artes"=>"Artes",
   "papelaria"=>"Papelaria",
   "outro" or "outros"=>"Outros",
   _=>texto.Length==0?"Outros":char.ToUpperInvariant(texto[0])+texto[1..].ToLowerInvariant()
  };
 }
}
