/**
 * Utilitário para processar HTML e preservar quebras de linha
 */

/**
 * Processa HTML para preservar quebras de linha e espaçamento
 * @param {string} html - HTML a ser processado
 * @returns {string} - HTML processado com quebras de linha preservadas
 */
export const processHtmlForDisplay = (html) => {
  if (!html) return '';
  
  // Primeiro, preservar quebras de linha múltiplas
  let processedHtml = html
    // Converter quebras de linha duplas em <br><br>
    .replace(/\n\n+/g, (match) => {
      const count = match.length;
      return '<br>'.repeat(count);
    })
    // Converter quebras de linha simples em <br>
    .replace(/\n/g, '<br>')
    // Preservar espaços em branco em parágrafos vazios
    .replace(/<p><\/p>/g, '<p><br></p>')
    // Preservar espaços em parágrafos que contêm apenas espaços
    .replace(/<p>\s+<\/p>/g, '<p><br></p>');
  
  return processedHtml;
};

/**
 * Processa HTML para preservar quebras de linha com CSS
 * @param {string} html - HTML a ser processado
 * @returns {string} - HTML processado com estilos CSS para preservar espaçamento
 */
export const processHtmlWithCss = (html) => {
  if (!html) return '';
  
  // Adicionar estilos CSS inline para preservar espaçamento
  let processedHtml = html
    // Adicionar white-space: pre-wrap aos parágrafos
    .replace(/<p>/g, '<p style="white-space: pre-wrap;">')
    // Adicionar white-space: pre-wrap aos divs
    .replace(/<div>/g, '<div style="white-space: pre-wrap;">')
    // Preservar quebras de linha
    .replace(/\n/g, '<br>');
  
  return processedHtml;
};

/**
 * Processa HTML específico para o banco de dados (converte parágrafos vazios em <br>)
 * @param {string} html - HTML a ser processado
 * @returns {string} - HTML processado com quebras de linha
 */
export const processHtmlForDatabase = (html) => {
  if (!html) return '';
  
  console.log('🔍 HTML para banco (original):', html);
  
  // VERIFICAR SE JÁ FOI PROCESSADO (contém <br> mas não parágrafos vazios)
  const hasBrTags = html.includes('<br>');
  const hasEmptyParagraphs = /<p[^>]*><\/p>/.test(html);
  
  // Se já tem <br> e não tem parágrafos vazios, não processar novamente
  if (hasBrTags && !hasEmptyParagraphs) {
    console.log('🔍 HTML já processado, retornando sem modificações');
    return html;
  }
  
  // CONVERTER PARÁGRAFOS VAZIOS EM <br> PARA O BANCO
  let processedHtml = html
    // Converter parágrafos vazios (com ou sem classes) em quebras de linha
    .replace(/<p[^>]*><\/p>/g, '<br>')
    .replace(/<p[^>]*>\s+<\/p>/g, '<br>')
    .replace(/<p[^>]*>\u00A0<\/p>/g, '<br>')
    .replace(/<p[^>]*>&nbsp;<\/p>/g, '<br>')
    // Converter parágrafos com apenas espaços em branco
    .replace(/<p[^>]*>\s*<\/p>/g, '<br>')
    // Converter quebras de linha em <br>
    .replace(/\n/g, '<br>')
    // EVITAR MULTIPLICAÇÃO: remover <br> duplicados consecutivos
    .replace(/<br>\s*<br>\s*<br>/g, '<br><br>')
    .replace(/<br>\s*<br>/g, '<br>');
  
  console.log('🔍 HTML para banco (processado):', processedHtml);
  
  return processedHtml;
};

/**
 * Combina processamento de HTML e CSS para máxima compatibilidade
 * @param {string} html - HTML a ser processado
 * @returns {string} - HTML processado com quebras de linha e CSS
 */
export const processHtmlComplete = (html) => {
  if (!html) return '';
  
  console.log('🔍 HTML original:', html);
  console.log('🔍 HTML original com quebras:', html.replace(/\n/g, '\\n'));
  
  // CONVERTER TODAS AS LINHAS VAZIAS EM <br>
  let processedHtml = html
    // Converter parágrafos vazios (com ou sem classes) em quebras de linha
    .replace(/<p[^>]*><\/p>/g, '<br>')
    .replace(/<p[^>]*>\s+<\/p>/g, '<br>')
    .replace(/<p[^>]*>\u00A0<\/p>/g, '<br>')
    .replace(/<p[^>]*>&nbsp;<\/p>/g, '<br>')
    // Converter parágrafos com apenas espaços em branco
    .replace(/<p[^>]*>\s*<\/p>/g, '<br>')
    // Preservar quebras de linha múltiplas (espaços em branco)
    .replace(/\n\n+/g, (match) => {
      const count = match.length;
      return '<br>'.repeat(count);
    })
    // Converter quebras de linha simples em <br>
    .replace(/\n/g, '<br>')
    // FORÇAR QUEBRAS DE LINHA ENTRE PARÁGRAFOS
    .replace(/<\/p><p>/g, '</p><br><p>')
    // Adicionar estilos CSS para preservar espaçamento
    .replace(/<p>/g, '<p style="white-space: pre-wrap; margin: 0.5rem 0; min-height: 1.5rem;">')
    .replace(/<div>/g, '<div style="white-space: pre-wrap;">')
    // FORÇAR ESPAÇAMENTO VISUAL - adicionar quebras extras entre elementos
    .replace(/<\/p><br><p>/g, '</p><br><br><p>')
    .replace(/<\/h[1-6]><p>/g, '</h1><br><p>')
    .replace(/<\/h[1-6]><br><p>/g, '</h1><br><br><p>');
  
  console.log('🔍 HTML processado:', processedHtml);
  console.log('🔍 HTML processado com quebras:', processedHtml.replace(/\n/g, '\\n'));
  
  return processedHtml;
};
