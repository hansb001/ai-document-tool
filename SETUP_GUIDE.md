# 🚀 AI Document Tool - Setup Guide

## Quick Setup for Local Document Indexing

This application automatically indexes documents from your local machine without requiring manual uploads. Here's how to get started:

### 1. Configure Your API Key

Edit the `.env` file and add your OpenAI API key:

```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

### 2. Add Your Documents

Simply place your documents in the `documents` folder:

```bash
# The documents folder is already created at:
./documents/

# Supported formats:
- PDF files (.pdf)
- Text files (.txt)
- Word documents (.docx, .doc)
```

**Example structure:**
```
documents/
├── report.pdf
├── notes.txt
├── presentation.docx
└── subfolder/
    └── more-docs.pdf
```

### 3. Start the Application

```bash
npm start
```

The application will:
- ✅ Automatically index all documents in the `documents` folder
- 👁️ Watch for new/modified/deleted documents
- 🔄 Update the index in real-time

### 4. Open in Browser

Navigate to: **http://localhost:3000**

You'll see:
- 📊 Statistics showing indexed documents, total size, and word count
- 📚 List of all indexed documents with their paths
- 🔍 Search across all documents instantly
- 🌐 Translate any document to 19+ languages
- 📝 Summarize documents in short/medium/long formats

## Features

### Automatic Indexing
- Documents are indexed on startup
- File watching detects changes automatically
- No manual upload required

### Search
- Search across all indexed documents
- See context around matches
- Instant results

### Translation
- Translate entire documents
- 19+ supported languages
- Maintains document structure

### Summarization
- Short (2-3 sentences)
- Medium (1-2 paragraphs)
- Long (3-4 paragraphs)

## Tips

1. **Add documents anytime**: Just drop files in the `documents` folder - they'll be indexed automatically
2. **Organize with subfolders**: Create subfolders to organize your documents
3. **Re-index manually**: Click the "🔄 Re-index Documents" button if needed
4. **Refresh view**: Click "↻ Refresh" to update the document list

## Configuration

Edit `.env` to customize:

```bash
# Documents folder path (relative or absolute)
DOCUMENTS_FOLDER=./documents

# Enable/disable file watching
WATCH_DOCUMENTS=true

# Server port
PORT=3000
```

## Troubleshooting

### No documents showing?
- Check that documents are in the `documents` folder
- Click "🔄 Re-index Documents"
- Check console for errors: `npm start`

### Search not working?
- Ensure documents are indexed (check statistics)
- Try re-indexing

### Translation/Summarization fails?
- Verify your OpenAI API key is correct
- Check you have API credits
- Large documents may take longer to process

## Example: Adding Your First Documents

```bash
# Copy some PDFs to the documents folder
cp ~/Downloads/*.pdf ./documents/

# Copy text files
cp ~/Documents/*.txt ./documents/

# Create organized structure
mkdir -p ./documents/reports
mkdir -p ./documents/notes
cp ~/work-reports/*.pdf ./documents/reports/
```

The application will automatically detect and index these files!

## Need Help?

- Check the main README.md for API documentation
- View server logs for detailed information
- Ensure all dependencies are installed: `npm install`

---

**Ready to go!** Just add your documents to the `documents` folder and start the server. 🎉