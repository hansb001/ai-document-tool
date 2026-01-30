const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');
const documentService = require('./documentService');

/**
 * Document Indexing Service
 * Automatically indexes documents from a specified folder
 */

class IndexService {
  constructor() {
    this.documents = new Map();
    this.watcher = null;
    this.isIndexing = false;
    this.excludePatterns = [];
  }

  /**
   * Initialize and index documents from multiple folders
   */
  async initialize(documentsFolders, watchForChanges = true, excludePatterns = '') {
    // Parse comma-separated folders
    const folders = documentsFolders.split(',').map(f => f.trim());
    
    // Parse exclude patterns
    this.excludePatterns = excludePatterns.split(',').map(p => p.trim()).filter(p => p);
    
    console.log(`📂 Indexing documents from ${folders.length} folder(s):`);
    folders.forEach(folder => console.log(`   - ${folder}`));
    
    if (this.excludePatterns.length > 0) {
      console.log(`🚫 Excluding patterns: ${this.excludePatterns.join(', ')}`);
    }
    
    // Expand folders with wildcards
    const expandedFolders = await this.expandFolderWildcards(folders);
    
    // Index each folder
    for (const folder of expandedFolders) {
      const absolutePath = path.resolve(folder);
      
      try {
        // Check if folder exists
        await fs.access(absolutePath);
        await this.indexFolder(absolutePath);
      } catch (error) {
        console.log(`⚠️  Skipping ${folder}: ${error.message}`);
      }
    }

    // Setup file watcher if enabled
    if (watchForChanges) {
      this.setupWatcher(expandedFolders);
    }

    console.log(`✅ Indexed ${this.documents.size} documents`);
  }

  /**
   * Expand ~ to home directory
   */
  expandPath(folderPath) {
    if (folderPath.startsWith('~/')) {
      return path.join(require('os').homedir(), folderPath.slice(2));
    }
    return folderPath;
  }

  /**
   * Expand folder paths with wildcards (e.g., ~/OneDrive - *)
   */
  async expandFolderWildcards(folders) {
    const expandedFolders = [];
    
    for (const folder of folders) {
      const expandedPath = this.expandPath(folder);
      
      // Check if path contains wildcard
      if (expandedPath.includes('*')) {
        const parentDir = path.dirname(expandedPath);
        const pattern = path.basename(expandedPath);
        
        try {
          // Check if parent directory exists
          await fs.access(parentDir);
          const entries = await fs.readdir(parentDir, { withFileTypes: true });
          
          // Convert glob pattern to regex
          const regexPattern = pattern.replace(/\*/g, '.*');
          const regex = new RegExp(`^${regexPattern}$`);
          
          // Find matching directories
          for (const entry of entries) {
            if (entry.isDirectory() && regex.test(entry.name)) {
              const matchedPath = path.join(parentDir, entry.name);
              expandedFolders.push(matchedPath);
              console.log(`   ✓ Matched wildcard: ${matchedPath}`);
            }
          }
        } catch (error) {
          console.log(`   ⚠️  Could not expand wildcard ${folder}: ${error.message}`);
        }
      } else {
        // No wildcard, add as-is
        expandedFolders.push(expandedPath);
      }
    }
    
    return expandedFolders;
  }

  /**
   * Check if path should be excluded
   */
  shouldExclude(filePath) {
    const basename = path.basename(filePath);
    const relativePath = filePath;
    
    for (const pattern of this.excludePatterns) {
      // Check if pattern matches basename or is in path
      if (pattern.includes('*')) {
        // Wildcard pattern
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        if (regex.test(basename)) return true;
      } else {
        // Exact match or path contains pattern
        if (basename === pattern || relativePath.includes(`/${pattern}/`) || relativePath.includes(`\\${pattern}\\`)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Index all documents in a folder
   */
  async indexFolder(folderPath) {
    this.isIndexing = true;
    
    try {
      // Check if this path should be excluded
      if (this.shouldExclude(folderPath)) {
        return;
      }

      const entries = await fs.readdir(folderPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(folderPath, entry.name);
        
        // Skip excluded paths
        if (this.shouldExclude(fullPath)) {
          continue;
        }
        
        if (entry.isDirectory()) {
          // Recursively index subdirectories
          await this.indexFolder(fullPath);
        } else if (entry.isFile()) {
          await this.indexDocument(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error indexing folder ${folderPath}:`, error.message);
    } finally {
      this.isIndexing = false;
    }
  }

  /**
   * Index a single document
   */
  async indexDocument(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const supportedFormats = ['.pdf', '.txt', '.docx', '.doc'];
    
    if (!supportedFormats.includes(ext)) {
      return; // Skip unsupported files
    }

    try {
      const stats = await fs.stat(filePath);
      const text = await documentService.extractText(filePath);
      
      const docId = this.generateDocId(filePath);
      const relativePath = path.relative(process.cwd(), filePath);
      
      this.documents.set(docId, {
        id: docId,
        filename: path.basename(filePath),
        path: filePath,
        relativePath: relativePath,
        text: text,
        size: stats.size,
        modifiedAt: stats.mtime,
        indexedAt: new Date()
      });
      
      console.log(`  ✓ Indexed: ${path.basename(filePath)}`);
    } catch (error) {
      console.error(`  ✗ Failed to index ${path.basename(filePath)}:`, error.message);
    }
  }

  /**
   * Remove document from index
   */
  removeDocument(filePath) {
    const docId = this.generateDocId(filePath);
    if (this.documents.has(docId)) {
      this.documents.delete(docId);
      console.log(`  ✓ Removed from index: ${path.basename(filePath)}`);
    }
  }

  /**
   * Setup file watcher for automatic re-indexing
   */
  setupWatcher(folderPaths) {
    console.log(`👁️  Watching for document changes...`);
    
    // Expand paths and resolve them
    const expandedPaths = folderPaths.map(p => path.resolve(this.expandPath(p)));
    
    // Create ignore patterns for chokidar
    const ignorePatterns = [
      /(^|[\/\\])\../, // ignore dotfiles
      ...this.excludePatterns.map(pattern => {
        if (pattern.includes('*')) {
          return new RegExp(pattern.replace(/\*/g, '.*'));
        }
        return `**/${pattern}/**`;
      })
    ];
    
    this.watcher = chokidar.watch(expandedPaths, {
      ignored: ignorePatterns,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    this.watcher
      .on('add', async (filePath) => {
        if (!this.shouldExclude(filePath)) {
          console.log(`📄 New document detected: ${path.basename(filePath)}`);
          await this.indexDocument(filePath);
        }
      })
      .on('change', async (filePath) => {
        if (!this.shouldExclude(filePath)) {
          console.log(`📝 Document modified: ${path.basename(filePath)}`);
          await this.indexDocument(filePath);
        }
      })
      .on('unlink', (filePath) => {
        console.log(`🗑️  Document deleted: ${path.basename(filePath)}`);
        this.removeDocument(filePath);
      })
      .on('error', (error) => {
        console.error('Watcher error:', error);
      });
  }

  /**
   * Generate unique document ID from file path
   */
  generateDocId(filePath) {
    // Use relative path as ID to ensure consistency
    const relativePath = path.relative(process.cwd(), filePath);
    return Buffer.from(relativePath).toString('base64').replace(/[/+=]/g, '');
  }

  /**
   * Get all indexed documents
   */
  getAllDocuments() {
    return Array.from(this.documents.values()).map(doc => ({
      id: doc.id,
      filename: doc.filename,
      relativePath: doc.relativePath,
      size: doc.size,
      modifiedAt: doc.modifiedAt,
      indexedAt: doc.indexedAt
    }));
  }

  /**
   * Get document by ID
   */
  getDocument(docId) {
    return this.documents.get(docId);
  }

  /**
   * Search across all indexed documents
   */
  searchDocuments(query) {
    const results = [];
    
    for (const doc of this.documents.values()) {
      const matches = documentService.searchInText(doc.text, query);
      if (matches.length > 0) {
        results.push({
          documentId: doc.id,
          filename: doc.filename,
          relativePath: doc.relativePath,
          matches: matches
        });
      }
    }
    
    return results;
  }

  /**
   * Get indexing statistics
   */
  getStats() {
    const docs = Array.from(this.documents.values());
    const totalSize = docs.reduce((sum, doc) => sum + doc.size, 0);
    const totalWords = docs.reduce((sum, doc) => {
      return sum + doc.text.split(/\s+/).length;
    }, 0);

    return {
      totalDocuments: this.documents.size,
      totalSize: totalSize,
      totalWords: totalWords,
      isIndexing: this.isIndexing,
      isWatching: this.watcher !== null
    };
  }

  /**
   * Re-index all documents
   */
  async reindex(documentsFolders, excludePatterns = '') {
    console.log('🔄 Re-indexing all documents...');
    this.documents.clear();
    
    // Parse folders and exclude patterns
    const folders = documentsFolders.split(',').map(f => f.trim());
    this.excludePatterns = excludePatterns.split(',').map(p => p.trim()).filter(p => p);
    
    // Expand folders with wildcards
    const expandedFolders = await this.expandFolderWildcards(folders);
    
    // Re-index each folder
    for (const folder of expandedFolders) {
      const absolutePath = path.resolve(folder);
      
      try {
        await fs.access(absolutePath);
        await this.indexFolder(absolutePath);
      } catch (error) {
        console.log(`⚠️  Skipping ${folder}: ${error.message}`);
      }
    }
    
    console.log(`✅ Re-indexed ${this.documents.size} documents`);
  }

  /**
   * Find duplicate filenames across different folders
   */
  findDuplicateFilenames() {
    const filenameMap = new Map();
    
    // Group documents by filename
    for (const doc of this.documents.values()) {
      const filename = doc.filename;
      if (!filenameMap.has(filename)) {
        filenameMap.set(filename, []);
      }
      filenameMap.get(filename).push({
        id: doc.id,
        filename: doc.filename,
        path: doc.path,
        relativePath: doc.relativePath,
        size: doc.size,
        modifiedAt: doc.modifiedAt
      });
    }
    
    // Filter to only duplicates (2 or more files with same name)
    const duplicates = [];
    for (const [filename, docs] of filenameMap.entries()) {
      if (docs.length >= 2) {
        duplicates.push({
          filename: filename,
          count: docs.length,
          documents: docs
        });
      }
    }
    
    // Sort by count (most duplicates first) then by filename
    duplicates.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.filename.localeCompare(b.filename);
    });
    
    return duplicates;
  }

  /**
   * Stop watching for changes
   */
  stopWatching() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      console.log('👁️  Stopped watching for changes');
    }
  }
}

// Export singleton instance
module.exports = new IndexService();