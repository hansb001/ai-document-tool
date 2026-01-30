const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Translate text to target language using OpenAI
 */
async function translate(text, targetLanguage) {
  try {
    // Split text into chunks if it's too long (max ~4000 tokens per request)
    const maxChunkLength = 3000;
    const chunks = splitTextIntoChunks(text, maxChunkLength);
    
    const translatedChunks = [];
    
    for (const chunk of chunks) {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following text to ${targetLanguage}. Maintain the original formatting and structure. Only provide the translation, no explanations.`
          },
          {
            role: 'user',
            content: chunk
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      });
      
      translatedChunks.push(response.choices[0].message.content);
    }
    
    return translatedChunks.join('\n\n');
  } catch (error) {
    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your .env file.');
    }
    throw new Error(`Translation failed: ${error.message}`);
  }
}

/**
 * Summarize text using OpenAI
 */
async function summarize(text, length = 'medium') {
  try {
    const lengthInstructions = {
      short: 'Provide a brief summary in 2-3 sentences.',
      medium: 'Provide a comprehensive summary in 1-2 paragraphs.',
      long: 'Provide a detailed summary covering all main points in 3-4 paragraphs.'
    };
    
    const instruction = lengthInstructions[length] || lengthInstructions.medium;
    
    // If text is very long, chunk it and summarize each chunk, then create a final summary
    const maxChunkLength = 4000;
    
    if (text.length > maxChunkLength) {
      return await summarizeLongText(text, instruction, maxChunkLength);
    }
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert at summarizing documents. ${instruction} Focus on the key points and main ideas.`
        },
        {
          role: 'user',
          content: `Please summarize the following text:\n\n${text}`
        }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your .env file.');
    }
    throw new Error(`Summarization failed: ${error.message}`);
  }
}

/**
 * Summarize very long text by chunking
 */
async function summarizeLongText(text, instruction, maxChunkLength) {
  const chunks = splitTextIntoChunks(text, maxChunkLength);
  const chunkSummaries = [];
  
  // Summarize each chunk
  for (let i = 0; i < chunks.length; i++) {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are summarizing part ${i + 1} of ${chunks.length} of a longer document. Provide a concise summary of this section.`
        },
        {
          role: 'user',
          content: chunks[i]
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    });
    
    chunkSummaries.push(response.choices[0].message.content);
  }
  
  // Create final summary from chunk summaries
  const combinedSummaries = chunkSummaries.join('\n\n');
  
  const finalResponse = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `You are creating a final summary from multiple section summaries. ${instruction}`
      },
      {
        role: 'user',
        content: `Create a cohesive summary from these section summaries:\n\n${combinedSummaries}`
      }
    ],
    temperature: 0.5,
    max_tokens: 1000
  });
  
  return finalResponse.choices[0].message.content;
}

/**
 * Split text into chunks of approximately equal size
 */
function splitTextIntoChunks(text, maxLength) {
  const chunks = [];
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Get available languages for translation
 */
function getAvailableLanguages() {
  return [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'nl', name: 'Dutch' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'tr', name: 'Turkish' },
    { code: 'pl', name: 'Polish' },
    { code: 'sv', name: 'Swedish' },
    { code: 'da', name: 'Danish' },
    { code: 'no', name: 'Norwegian' },
    { code: 'fi', name: 'Finnish' }
  ];
}

/**
 * Compare two documents and highlight differences, similarities, and changes
 */
async function compareDocuments(text1, text2, doc1Name, doc2Name) {
  try {
    // Truncate texts if they're too long
    const maxLength = 6000;
    const truncatedText1 = text1.length > maxLength ? text1.substring(0, maxLength) + '...' : text1;
    const truncatedText2 = text2.length > maxLength ? text2.substring(0, maxLength) + '...' : text2;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert document analyst. Compare two documents and provide a detailed analysis including:
1. **Key Differences**: Major changes, additions, or removals between the documents
2. **Similarities**: Common themes, topics, or content that appears in both
3. **Content Changes**: Specific modifications in wording, data, or structure
4. **Summary**: Overall assessment of how the documents relate to each other

Format your response in clear sections with markdown formatting.`
        },
        {
          role: 'user',
          content: `Compare these two documents:

**Document 1: ${doc1Name}**
${truncatedText1}

**Document 2: ${doc2Name}**
${truncatedText2}

Please provide a comprehensive comparison analysis.`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your .env file.');
    }
    throw new Error(`Document comparison failed: ${error.message}`);
  }
}

module.exports = {
  translate,
  summarize,
  compareDocuments,
  getAvailableLanguages
};