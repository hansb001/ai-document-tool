const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const documentService = require('./services/documentService');
const aiService = require('./services/aiService');
const indexService = require('./services/indexService');

const app = express();
const PORT = process.env.PORT || 3000;
const DOCUMENTS_FOLDERS = process.env.DOCUMENTS_FOLDERS || './documents';
const WATCH_DOCUMENTS = process.env.WATCH_DOCUMENTS === 'true';
const EXCLUDE_PATTERNS = process.env.EXCLUDE_PATTERNS || 'node_modules,*.app,*.dmg,*.pkg,.git,.DS_Store';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.txt', '.docx', '.doc'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, and DOCX files are allowed.'));
    }
  }
});

// Initialize document indexing on startup
(async () => {
  try {
    await indexService.initialize(DOCUMENTS_FOLDERS, WATCH_DOCUMENTS, EXCLUDE_PATTERNS);
  } catch (error) {
    console.error('Failed to initialize document indexing:', error);
  }
})();

// Routes

// Upload document
app.post('/api/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const text = await documentService.extractText(filePath);
    
    const docId = req.file.filename;
    documents.set(docId, {
      id: docId,
      filename: req.file.originalname,
      path: filePath,
      text: text,
      uploadedAt: new Date()
    });

    res.json({
      success: true,
      documentId: docId,
      filename: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List all indexed documents
app.get('/api/documents', (req, res) => {
  const docList = indexService.getAllDocuments();
  res.json(docList);
});

// Get indexing statistics
app.get('/api/stats', (req, res) => {
  const stats = indexService.getStats();
  res.json(stats);
});

// Re-index all documents
app.post('/api/reindex', async (req, res) => {
  try {
    await indexService.reindex(DOCUMENTS_FOLDERS, EXCLUDE_PATTERNS);
    res.json({ success: true, message: 'Documents re-indexed successfully' });
  } catch (error) {
    console.error('Re-index error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current settings
app.get('/api/settings', (req, res) => {
  res.json({
    folders: process.env.DOCUMENTS_FOLDERS || './documents',
    excludePatterns: process.env.EXCLUDE_PATTERNS || 'node_modules,*.app,*.dmg,*.pkg,.git,.DS_Store'
  });
});

// Save settings and re-index
app.post('/api/settings', async (req, res) => {
  try {
    const { folders, excludePatterns } = req.body;
    
    if (!folders) {
      return res.status(400).json({ error: 'Folders are required' });
    }
    
    // Update .env file
    const fs = require('fs');
    const envPath = path.join(__dirname, '../.env');
    let envContent = fs.readFileSync(envPath, 'utf-8');
    
    // Update DOCUMENTS_FOLDERS
    if (envContent.includes('DOCUMENTS_FOLDERS=')) {
      envContent = envContent.replace(/DOCUMENTS_FOLDERS=.*/g, `DOCUMENTS_FOLDERS=${folders}`);
    } else {
      envContent += `\nDOCUMENTS_FOLDERS=${folders}`;
    }
    
    // Update EXCLUDE_PATTERNS
    if (excludePatterns) {
      if (envContent.includes('EXCLUDE_PATTERNS=')) {
        envContent = envContent.replace(/EXCLUDE_PATTERNS=.*/g, `EXCLUDE_PATTERNS=${excludePatterns}`);
      } else {
        envContent += `\nEXCLUDE_PATTERNS=${excludePatterns}`;
      }
    }
    
    fs.writeFileSync(envPath, envContent);
    
    // Update environment variables
    process.env.DOCUMENTS_FOLDERS = folders;
    process.env.EXCLUDE_PATTERNS = excludePatterns || '';
    
    // Re-index with new settings
    await indexService.reindex(folders, excludePatterns || '');
    
    res.json({
      success: true,
      message: 'Settings saved and documents re-indexed successfully',
      folders: folders,
      excludePatterns: excludePatterns
    });
  } catch (error) {
    console.error('Settings save error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search in indexed documents
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = indexService.searchDocuments(query);
    res.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Translate document
app.post('/api/translate', async (req, res) => {
  try {
    const { documentId, targetLanguage } = req.body;
    
    if (!documentId || !targetLanguage) {
      return res.status(400).json({ error: 'Document ID and target language are required' });
    }

    const doc = indexService.getDocument(documentId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const translation = await aiService.translate(doc.text, targetLanguage);
    
    res.json({
      success: true,
      documentId: documentId,
      targetLanguage: targetLanguage,
      translation: translation
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Summarize document
app.post('/api/summarize', async (req, res) => {
  try {
    const { documentId, length } = req.body;
    
    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const doc = indexService.getDocument(documentId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const summary = await aiService.summarize(doc.text, length || 'medium');
    
    res.json({
      success: true,
      documentId: documentId,
      summary: summary
    });
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Open document in default application
app.post('/api/open-document', async (req, res) => {
  try {
    const { documentId } = req.body;
    
    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const doc = indexService.getDocument(documentId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Use 'open' command on macOS to open file in default application
    const { exec } = require('child_process');
    const filePath = doc.path;
    
    exec(`open "${filePath}"`, (error) => {
      if (error) {
        console.error('Error opening document:', error);
        return res.status(500).json({ error: 'Failed to open document' });
      }
      
      res.json({
        success: true,
        message: 'Document opened successfully',
        path: filePath
      });
    });
  } catch (error) {
    console.error('Open document error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const stats = indexService.getStats();
  res.json({
    status: 'ok',
    documents: stats.totalDocuments,
    isIndexing: stats.isIndexing,
    isWatching: stats.isWatching
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Document Tool server running on http://localhost:${PORT}`);
  console.log(`👁️  File watching: ${WATCH_DOCUMENTS ? 'enabled' : 'disabled'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  indexService.stopWatching();
  process.exit(0);
});