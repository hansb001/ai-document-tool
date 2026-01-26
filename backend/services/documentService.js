const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text from various document formats
 */
async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  try {
    switch (ext) {
      case '.pdf':
        return await extractFromPDF(filePath);
      case '.txt':
        return await extractFromTXT(filePath);
      case '.docx':
      case '.doc':
        return await extractFromDOCX(filePath);
      default:
        throw new Error(`Unsupported file format: ${ext}`);
    }
  } catch (error) {
    throw new Error(`Failed to extract text from ${path.basename(filePath)}: ${error.message}`);
  }
}

/**
 * Extract text from PDF files
 */
async function extractFromPDF(filePath) {
  const dataBuffer = await fs.readFile(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

/**
 * Extract text from TXT files
 */
async function extractFromTXT(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return content;
}

/**
 * Extract text from DOCX files
 */
async function extractFromDOCX(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

/**
 * Search for a query in text and return matches with context
 */
function searchInText(text, query, contextLength = 100) {
  const matches = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  let index = 0;
  while ((index = lowerText.indexOf(lowerQuery, index)) !== -1) {
    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + query.length + contextLength);
    
    let context = text.substring(start, end);
    
    // Add ellipsis if not at start/end
    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';
    
    matches.push({
      position: index,
      context: context,
      matchText: text.substring(index, index + query.length)
    });
    
    index += query.length;
  }
  
  return matches;
}

/**
 * Get document statistics
 */
function getDocumentStats(text) {
  const words = text.trim().split(/\s+/).length;
  const characters = text.length;
  const lines = text.split('\n').length;
  const paragraphs = text.split(/\n\s*\n/).length;
  
  return {
    words,
    characters,
    lines,
    paragraphs
  };
}

module.exports = {
  extractText,
  searchInText,
  getDocumentStats
};