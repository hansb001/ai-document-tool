const BoxSDK = require('box-node-sdk');
const documentService = require('./documentService');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

/**
 * Box Cloud Storage Integration Service
 * Allows searching and indexing documents from Box
 */

class BoxService {
  constructor() {
    this.sdk = null;
    this.client = null;
    this.isInitialized = false;
    this.cachedDocuments = new Map();
  }

  /**
   * Initialize Box SDK with credentials
   */
  initialize() {
    try {
      const clientId = process.env.BOX_CLIENT_ID;
      const clientSecret = process.env.BOX_CLIENT_SECRET;
      const developerToken = process.env.BOX_DEVELOPER_TOKEN;

      if (!clientId || !clientSecret) {
        console.log('⚠️  Box credentials not configured. Box integration disabled.');
        return false;
      }

      this.sdk = new BoxSDK({
        clientID: clientId,
        clientSecret: clientSecret
      });

      // Use developer token for simplicity (for production, use OAuth2)
      if (developerToken) {
        this.client = this.sdk.getBasicClient(developerToken);
        this.isInitialized = true;
        console.log('✅ Box integration initialized');
        return true;
      } else {
        console.log('⚠️  Box developer token not found. Box integration disabled.');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize Box:', error.message);
      return false;
    }
  }

  /**
   * Search for files in Box
   */
  async searchFiles(query, limit = 100) {
    if (!this.isInitialized) {
      throw new Error('Box service not initialized');
    }

    try {
      const results = await this.client.search.query(query, {
        type: 'file',
        content_types: 'name,description,file_content',
        limit: limit,
        fields: 'name,size,modified_at,path_collection,extension'
      });

      return results.entries || [];
    } catch (error) {
      console.error('Box search error:', error);
      throw new Error(`Box search failed: ${error.message}`);
    }
  }

  /**
   * List folders in Box (non-recursive)
   */
  async listFolders(folderId = '0') {
    if (!this.isInitialized) {
      throw new Error('Box service not initialized');
    }

    try {
      const items = await this.client.folders.getItems(folderId, {
        fields: 'name,size,modified_at,path_collection,type,item_collection',
        limit: 1000
      });

      const folders = items.entries
        .filter(item => item.type === 'folder')
        .map(folder => ({
          id: folder.id,
          name: folder.name,
          path: this._buildPath(folder.path_collection, folder.name),
          modifiedAt: folder.modified_at
        }));

      return folders;
    } catch (error) {
      console.error('Box list folders error:', error);
      throw new Error(`Failed to list Box folders: ${error.message}`);
    }
  }

  /**
   * Get folder tree structure
   */
  async getFolderTree(folderId = '0', maxDepth = 3, currentDepth = 0) {
    if (!this.isInitialized) {
      throw new Error('Box service not initialized');
    }

    if (currentDepth >= maxDepth) {
      return null;
    }

    try {
      const items = await this.client.folders.getItems(folderId, {
        fields: 'name,size,modified_at,path_collection,type',
        limit: 1000
      });

      const folder = await this.client.folders.get(folderId, {
        fields: 'name,path_collection'
      });

      const tree = {
        id: folder.id,
        name: folder.name,
        path: this._buildPath(folder.path_collection, folder.name),
        children: []
      };

      for (const item of items.entries) {
        if (item.type === 'folder') {
          const subtree = await this.getFolderTree(item.id, maxDepth, currentDepth + 1);
          if (subtree) {
            tree.children.push(subtree);
          }
        }
      }

      return tree;
    } catch (error) {
      console.error(`Error getting folder tree for ${folderId}:`, error.message);
      return null;
    }
  }

  /**
   * Build full path from path_collection
   */
  _buildPath(pathCollection, itemName) {
    const pathParts = pathCollection.entries.map(p => p.name);
    return [...pathParts, itemName].join('/');
  }

  /**
   * Get all files from Box (recursively from specified folder)
   */
  async getAllFiles(folderId = '0', maxFiles = 1000) {
    if (!this.isInitialized) {
      throw new Error('Box service not initialized');
    }

    const files = [];
    
    try {
      await this._getFolderContentsRecursive(folderId, files, maxFiles);
      return files;
    } catch (error) {
      console.error('Box get files error:', error);
      throw new Error(`Failed to get Box files: ${error.message}`);
    }
  }

  /**
   * Recursively get folder contents
   */
  async _getFolderContentsRecursive(folderId, files, maxFiles) {
    if (files.length >= maxFiles) {
      return;
    }

    try {
      const items = await this.client.folders.getItems(folderId, {
        fields: 'name,size,modified_at,path_collection,extension,type',
        limit: 1000
      });

      for (const item of items.entries) {
        if (files.length >= maxFiles) {
          break;
        }

        if (item.type === 'file') {
          // Only index supported file types
          const ext = item.name.split('.').pop().toLowerCase();
          if (['pdf', 'txt', 'docx', 'doc'].includes(ext)) {
            files.push(item);
          }
        } else if (item.type === 'folder') {
          // Recursively get folder contents
          await this._getFolderContentsRecursive(item.id, files, maxFiles);
        }
      }
    } catch (error) {
      console.error(`Error accessing folder ${folderId}:`, error.message);
    }
  }

  /**
   * Download and extract text from a Box file
   */
  async downloadAndExtractText(fileId, fileName) {
    if (!this.isInitialized) {
      throw new Error('Box service not initialized');
    }

    try {
      // Download file to temp directory
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `box_${fileId}_${fileName}`);

      const stream = await this.client.files.getReadStream(fileId);
      const writeStream = require('fs').createWriteStream(tempFilePath);

      await new Promise((resolve, reject) => {
        stream.pipe(writeStream);
        stream.on('error', reject);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      // Extract text using documentService
      const text = await documentService.extractText(tempFilePath);

      // Clean up temp file
      try {
        await fs.unlink(tempFilePath);
      } catch (err) {
        console.error('Failed to delete temp file:', err);
      }

      return text;
    } catch (error) {
      console.error(`Error downloading Box file ${fileId}:`, error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Index Box files for searching
   * @param {Array<string>} folderIds - Array of Box folder IDs to index (default: ['0'] for root)
   * @param {number} maxFiles - Maximum number of files to index
   */
  async indexBoxFiles(folderIds = ['0'], maxFiles = 100) {
    if (!this.isInitialized) {
      console.log('⚠️  Box not initialized, skipping indexing');
      return [];
    }

    console.log(`📦 Indexing Box files from ${folderIds.length} folder(s)...`);
    this.cachedDocuments.clear();

    try {
      const allFiles = [];
      
      // Get files from each specified folder
      for (const folderId of folderIds) {
        const files = await this.getAllFiles(folderId, maxFiles - allFiles.length);
        allFiles.push(...files);
        
        if (allFiles.length >= maxFiles) {
          break;
        }
      }

      console.log(`Found ${allFiles.length} supported files in Box`);

      const indexed = [];

      for (const file of allFiles) {
        try {
          console.log(`  Indexing: ${file.name}`);
          
          // Download and extract text
          const text = await this.downloadAndExtractText(file.id, file.name);

          // Build path from path_collection
          const fullPath = this._buildPath(file.path_collection, file.name);

          const docData = {
            id: `box_${file.id}`,
            filename: file.name,
            path: fullPath,
            relativePath: `Box: ${fullPath}`,
            text: text,
            size: file.size,
            modifiedAt: new Date(file.modified_at),
            indexedAt: new Date(),
            source: 'box',
            boxFileId: file.id
          };

          this.cachedDocuments.set(docData.id, docData);
          indexed.push(docData);

        } catch (error) {
          console.error(`  ✗ Failed to index ${file.name}:`, error.message);
        }
      }

      console.log(`✅ Indexed ${indexed.length} Box documents`);
      return indexed;

    } catch (error) {
      console.error('Box indexing error:', error);
      return [];
    }
  }

  /**
   * Get cached Box documents
   */
  getCachedDocuments() {
    return Array.from(this.cachedDocuments.values());
  }

  /**
   * Get a specific Box document by ID
   */
  getDocument(docId) {
    return this.cachedDocuments.get(docId);
  }

  /**
   * Search in cached Box documents
   */
  searchCachedDocuments(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const doc of this.cachedDocuments.values()) {
      if (doc.text.toLowerCase().includes(lowerQuery) || 
          doc.filename.toLowerCase().includes(lowerQuery)) {
        
        // Find matches in text
        const matches = documentService.searchInText(doc.text, query);
        
        if (matches.length > 0) {
          results.push({
            documentId: doc.id,
            filename: doc.filename,
            relativePath: doc.relativePath,
            matches: matches,
            source: 'box'
          });
        }
      }
    }

    return results;
  }

  /**
   * Get Box file download URL
   */
  async getDownloadUrl(fileId) {
    if (!this.isInitialized) {
      throw new Error('Box service not initialized');
    }

    try {
      const url = await this.client.files.getDownloadURL(fileId);
      return url;
    } catch (error) {
      throw new Error(`Failed to get download URL: ${error.message}`);
    }
  }
}

// Export singleton instance
module.exports = new BoxService();