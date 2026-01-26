# 🎯 Quick Start Guide - AI Document Tool

## ✅ Your Application is Ready!

The server is now running at: **http://localhost:3000**

### What's Working:

✅ **Automatic Document Indexing**
- The `documents` folder is being monitored
- 1 sample document is already indexed
- New files will be indexed automatically

✅ **Real-time File Watching**
- Add/modify/delete files in `documents` folder
- Changes are detected instantly
- No manual re-indexing needed

✅ **All Features Available**
- 🔍 Search across all documents
- 🌐 Translate to 19+ languages
- 📝 Summarize in 3 different lengths

---

## 🚀 Next Steps

### 1. Open the Application
Open your browser and go to: **http://localhost:3000**

### 2. Add Your Documents
Simply copy your documents to the `documents` folder:

```bash
# Example: Copy PDFs from Downloads
cp ~/Downloads/*.pdf ./documents/

# Example: Copy text files
cp ~/Documents/*.txt ./documents/

# Example: Create organized folders
mkdir -p ./documents/work
mkdir -p ./documents/personal
cp ~/work-files/*.pdf ./documents/work/
```

The application will automatically detect and index them!

### 3. Configure Your OpenAI API Key

**IMPORTANT:** To use translation and summarization features, you need an OpenAI API key.

1. Get your API key from: https://platform.openai.com/api-keys
2. Edit the `.env` file:
   ```bash
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```
3. Restart the server (Ctrl+C, then `npm start`)

---

## 📖 How to Use

### Search Documents
1. Go to the **Search** tab
2. Type your search query (e.g., "indexing", "AI", "document")
3. Click **Search**
4. View results with highlighted matches and context

### Translate Documents
1. Go to the **Translate** tab
2. Select a document from the dropdown
3. Choose target language (Spanish, French, German, etc.)
4. Click **Translate**
5. View the translated text

### Summarize Documents
1. Go to the **Summarize** tab
2. Select a document
3. Choose summary length:
   - **Short**: 2-3 sentences
   - **Medium**: 1-2 paragraphs (recommended)
   - **Long**: 3-4 paragraphs
4. Click **Summarize**

---

## 💡 Tips & Tricks

### Adding Documents
- **Just drop files** in the `documents` folder - they're indexed automatically
- **Organize with subfolders** - the app scans recursively
- **Supported formats**: PDF, TXT, DOCX, DOC

### Managing Documents
- **View statistics** at the top (documents count, size, words)
- **Refresh list** with the "↻ Refresh" button
- **Re-index manually** with "🔄 Re-index Documents" if needed

### Search Tips
- Search is **case-insensitive**
- Results show **context** around matches
- Search works across **all indexed documents**

### Performance
- **Large documents** are automatically chunked for AI processing
- **Translation/summarization** may take 10-30 seconds for large files
- **File watching** updates the index in real-time

---

## 🔧 Configuration

Edit `.env` to customize:

```bash
# Your OpenAI API key (required for AI features)
OPENAI_API_KEY=sk-your-key-here

# Documents folder (change to any path)
DOCUMENTS_FOLDER=./documents

# Enable/disable automatic file watching
WATCH_DOCUMENTS=true

# Server port
PORT=3000

# Max upload size (for manual uploads)
MAX_FILE_SIZE=10485760
```

---

## 📁 Folder Structure

```
ai-document-tool/
├── documents/              ← Put your documents here!
│   └── sample-document.txt (already indexed)
├── backend/
│   ├── server.js
│   └── services/
│       ├── indexService.js    (handles indexing)
│       ├── documentService.js (text extraction)
│       └── aiService.js       (AI operations)
├── frontend/
│   ├── index.html
│   ├── css/styles.css
│   └── js/app.js
├── .env                    ← Configure your API key here
└── SETUP_GUIDE.md         ← Detailed documentation
```

---

## 🎯 Try It Now!

1. **Open**: http://localhost:3000
2. **Search**: Try searching for "indexing" or "AI"
3. **Add a document**: Copy a PDF or TXT file to `./documents/`
4. **Watch it appear**: The document list updates automatically!

---

## ❓ Troubleshooting

### Server won't start?
```bash
# Kill any process on port 3000
lsof -ti:3000 | xargs kill -9

# Start again
npm start
```

### Documents not showing?
- Check they're in the `documents` folder
- Click "🔄 Re-index Documents"
- Check server console for errors

### Translation/Summarization not working?
- Verify your OpenAI API key in `.env`
- Check you have API credits
- Restart the server after changing `.env`

### Need to stop the server?
Press `Ctrl+C` in the terminal

---

## 🎉 You're All Set!

The application is running and ready to use. Just add your documents to the `documents` folder and start searching, translating, and summarizing!

**Server Status**: ✅ Running on http://localhost:3000
**Indexed Documents**: 1 (sample-document.txt)
**File Watching**: ✅ Active

Enjoy! 🚀