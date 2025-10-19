/**
 * processa HTML para preservar quebras de linha e espaçamento
 * @param {string} html 
 * @returns {string} 
 */
export const processHtmlForDisplay = (html) => {
  if (!html) return '';

  let processedHtml = html
    .replace(/\n\n+/g, (match) => {
      const count = match.length;
      return '<br>'.repeat(count);
    })

    .replace(/\n/g, '<br>')
    .replace(/<p><\/p>/g, '<p><br></p>')
    .replace(/<p>\s+<\/p>/g, '<p><br></p>');
  
  return processedHtml;
};

/**
 * processa HTML para preservar quebras de linha com CSS
 * @param {string} html 
 * @returns {string} 
 */
export const processHtmlWithCss = (html) => {
  if (!html) return '';
  
  // adicionar estilos CSS inline para preservar espaçamento
  let processedHtml = html
    .replace(/<p>/g, '<p style="white-space: pre-wrap;">')
    .replace(/<div>/g, '<div style="white-space: pre-wrap;">')
    .replace(/\n/g, '<br>');
  
  return processedHtml;
};

/**
 * processa HTML específico para o banco de dados (converte parágrafos vazios em <br>)
 * @param {string} html 
 * @returns {string} 
 */
export const processHtmlForDatabase = (html) => {
  if (!html) return '';
  
  
  // verificar se já foi processado (contém <br> mas não parágrafos vazios)
  const hasBrTags = html.includes('<br>');
  const hasEmptyParagraphs = /<p[^>]*><\/p>/.test(html);
  
  // se já tem <br> e não tem parágrafos vazios, não processar novamente
  if (hasBrTags && !hasEmptyParagraphs) {
    return html;
  }
  
  // converter parágrafos vazios em <br> para o banco
  let processedHtml = html

    .replace(/<p[^>]*><\/p>/g, '<br>')
    .replace(/<p[^>]*>\s+<\/p>/g, '<br>')
    .replace(/<p[^>]*>\u00A0<\/p>/g, '<br>')
    .replace(/<p[^>]*>&nbsp;<\/p>/g, '<br>')
    .replace(/<p[^>]*>\s*<\/p>/g, '<br>')
    .replace(/\n/g, '<br>')
    .replace(/<br>\s*<br>\s*<br>/g, '<br><br>')
    .replace(/<br>\s*<br>/g, '<br>');
  
  
  return processedHtml;
};

/**
 * combina processamento de HTML e CSS para máxima compatibilidade
 * @param {string} html 
 * @returns {string} 
 */
export const processHtmlComplete = (html) => {
  if (!html) return '';
  
  
  // converter todas as linhas vazias em <br>
  let processedHtml = html

    .replace(/<p[^>]*><\/p>/g, '<br>')
    .replace(/<p[^>]*>\s+<\/p>/g, '<br>')
    .replace(/<p[^>]*>\u00A0<\/p>/g, '<br>')
    .replace(/<p[^>]*>&nbsp;<\/p>/g, '<br>')
    .replace(/<p[^>]*>\s*<\/p>/g, '<br>')
    .replace(/\n\n+/g, (match) => {
      const count = match.length;
      return '<br>'.repeat(count);
    })
    .replace(/\n/g, '<br>')
    .replace(/<\/p><p>/g, '</p><br><p>')
    .replace(/<p>/g, '<p style="white-space: pre-wrap; margin: 0.5rem 0; min-height: 1.5rem;">')
    .replace(/<div>/g, '<div style="white-space: pre-wrap;">')
    .replace(/<\/p><br><p>/g, '</p><br><br><p>')
    .replace(/<\/h[1-6]><p>/g, '</h1><br><p>')
    .replace(/<\/h[1-6]><br><p>/g, '</h1><br><br><p>');
  
  
  return processedHtml;
};
