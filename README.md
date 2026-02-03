# 🔍 Intelligent Document Search

**Powered by Novadoc**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green.svg)](https://nodejs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-blue.svg)](https://openai.com/)

A powerful browser-based application for searching, translating, and summarizing local documents using AI. Automatically indexes documents from multiple folders on your machine without requiring manual uploads.

![Intelligent Document Search](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

## ✨ Features

- 📁 **Multi-Folder Indexing**: Automatically index documents from multiple folders (Documents, Desktop, Downloads, custom paths)
- ☁️ **Cloud Storage Integration**:
  - **OneDrive**: Microsoft OneDrive (Personal & Business)
  - **Box**: Box cloud storage with full API integration
- 🔍 **Smart Search**: Instant search across all indexed documents with context highlighting
- 🌐 **AI Translation**: Translate documents to 19+ languages using OpenAI
- 📝 **AI Summarization**: Generate short, medium, or long summaries
- 🔄 **Duplicate Detection & Comparison**: Automatically finds documents with the same filename and compares versions (no AI required - works offline!)
- 👁️ **Real-time Monitoring**: Automatic detection of new, modified, or deleted files
- ⚙️ **Settings Interface**: Easy folder selection and configuration via web UI
- 💻 **Browser-Based**: Clean, responsive interface with modern design
- 🔒 **Privacy-First**: All processing happens locally, documents never leave your machine

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hansb001/ai-document-tool.git
   cd ai-document-tool
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_actual_api_key_here
   DOCUMENTS_FOLDERS=~/Documents,~/Desktop,~/Downloads,./documents
   WATCH_DOCUMENTS=true
   EXCLUDE_PATTERNS=node_modules,*.app,*.dmg,*.pkg,.git,.DS_Store,Library,Applications
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## 📖 Usage

### Configure Folders (Settings Tab)

1. Click the **⚙️ Settings** tab
2. Check/uncheck folders you want to index:
   - 📄 Documents folder
   - 🖥️ Desktop
   - ⬇️ Downloads
   - 📦 Project documents
3. Add custom folders (one per line)
4. Adjust exclude patterns if needed
5. Click **💾 Save & Re-index**

### Search Documents

1. Go to the **🔍 Search** tab
2. Enter your search query
3. View results with highlighted matches and context
4. Search works across all indexed documents instantly

### Translate Documents

1. Go to the **🌐 Translate** tab
2. Select a document from the dropdown
3. Choose your target language (19+ languages supported)
4. Click "Translate" to get AI-powered translation

### Summarize Documents

1. Go to the **📝 Summarize** tab
2. Select a document from the dropdown
3. Choose summary length:
   - **Short**: 2-3 sentences
   - **Medium**: 1-2 paragraphs
   - **Long**: 3-4 paragraphs
4. Click "Summarize" to generate the summary

### Compare Duplicate Documents

1. Go to the **🔄 Compare** tab
2. Click "🔍 Find Duplicate Filenames" to scan for documents with the same name
3. The system will display all duplicate filename groups
4. For each duplicate group:
   - View all versions with their locations and modification dates
   - Click "Compare These Two Versions" (for 2 versions)
   - Or select specific versions to compare (for 3+ versions)
5. View the detailed comparison showing:
   - **Similarity Percentage**: How similar the documents are
   - **Statistics**: Lines added, removed, and unchanged
   - **Key Changes**: Summary of modifications
   - **Detailed Diff**: Line-by-line comparison with color coding
   - **Document Details**: Size and line count for each version

**Use Cases:**
- Compare contract versions across different folders
- Identify changes between draft and final documents
- Verify document consistency across OneDrive and local storage
- Track document evolution over time

## ☁️ OneDrive Integration

Intelligent Document Search includes built-in support for Microsoft OneDrive:

- **Personal OneDrive**: `~/OneDrive`
- **OneDrive for Business**: `~/OneDrive - [Organization]`
- **Automatic Discovery**: Wildcard patterns automatically find OneDrive folders
- **Real-time Sync**: Documents are indexed as OneDrive syncs them locally

### Quick Setup

OneDrive paths are pre-configured in `.env`:
```env
DOCUMENTS_FOLDERS=~/OneDrive,~/OneDrive - *,~/Library/CloudStorage/OneDrive-*
```

The wildcard `*` automatically matches your organization name in OneDrive for Business folders.

### Requirements

- OneDrive must be installed and syncing on your Mac
- Files must be synced locally (not online-only) to be indexed
- Supported file types: PDF, TXT, DOCX, DOC

For detailed OneDrive setup, troubleshooting, and configuration options, see [ONEDRIVE_SETUP.md](ONEDRIVE_SETUP.md).

## 📦 Box Cloud Storage Integration

Intelligent Document Search includes full API integration with Box cloud storage:

- **Cloud-Based Indexing**: Index documents directly from Box
- **API Integration**: Uses Box SDK for seamless access
- **Automatic Sync**: Downloads and indexes Box files on startup
- **Full Feature Support**: Search, translate, summarize, and compare Box documents

### Quick Setup

1. Create a Box app at [Box Developer Console](https://app.box.com/developers/console)
2. Get your credentials (Client ID, Client Secret, Developer Token)
3. Add to `.env`:
   ```env
   BOX_CLIENT_ID=your_client_id
   BOX_CLIENT_SECRET=your_client_secret
   BOX_DEVELOPER_TOKEN=your_developer_token
   BOX_ENABLED=true
   ```
4. Restart the application

### Features

- **Automatic Indexing**: Indexes up to 100 files on startup (configurable)
- **Supported Formats**: PDF, TXT, DOCX, DOC
- **Search Integration**: Box documents appear in search results with "Box:" prefix
- **Full API Access**: Translate, summarize, and compare Box documents
- **Re-indexing**: Manual re-index via API endpoint

For detailed Box setup, API documentation, and troubleshooting, see [BOX_SETUP.md](BOX_SETUP.md).

## 🏗️ Project Structure

```
ai-document-tool/
├── backend/
│   ├── server.js              # Express server
│   └── services/
│       ├── documentService.js # Document processing (PDF, TXT, DOCX)
│       ├── aiService.js       # AI operations (OpenAI)
│       └── indexService.js    # Multi-folder indexing & file watching
├── frontend/
│   ├── index.html            # Main HTML
│   ├── css/
│   │   └── styles.css        # Styling
│   └── js/
│       └── app.js            # Frontend logic
├── documents/                # Local documents folder (gitignored)
├── uploads/                  # Manual uploads (gitignored)
├── .env                      # Environment variables (gitignored)
├── .env.example             # Environment template
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Document Management
- `GET /api/documents` - List all indexed documents
- `GET /api/stats` - Get indexing statistics
- `POST /api/reindex` - Re-index all documents

### Settings
- `GET /api/settings` - Get current folder configuration
- `POST /api/settings` - Update folders and re-index

### Search & AI Operations
- `POST /api/search` - Search across documents
- `POST /api/translate` - Translate document
- `POST /api/summarize` - Summarize document

### File Upload (Optional)
- `POST /api/upload` - Upload document manually

## 🌍 Supported Languages

English, Spanish, French, German, Italian, Portuguese, Dutch, Russian, Chinese, Japanese, Korean, Arabic, Hindi, Turkish, Polish, Swedish, Danish, Norwegian, Finnish

## ⚙️ Configuration

### Environment Variables

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3000

# Documents Configuration
DOCUMENTS_FOLDERS=~/Documents,~/Desktop,~/Downloads,./documents
WATCH_DOCUMENTS=true
EXCLUDE_PATTERNS=node_modules,*.app,*.dmg,*.pkg,.git,.DS_Store,Library,Applications

# File Upload Configuration
MAX_FILE_SIZE=10485760
```

### Customization

- **Modify AI Model**: Edit `backend/services/aiService.js` to change the OpenAI model
- **Add File Types**: Update `backend/services/documentService.js` for new formats
- **Styling**: Customize `frontend/css/styles.css`
- **Exclude Patterns**: Add patterns in Settings tab or `.env` file

## 🛠️ Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon for automatic server restart on file changes.

### Adding New Features

1. Backend: Add routes in `backend/server.js`
2. Services: Extend services in `backend/services/`
3. Frontend: Update `frontend/js/app.js` and `frontend/index.html`

## 📝 Technical Details

### Document Indexing
- Uses `chokidar` for file system watching
- Supports recursive folder scanning
- Automatic text extraction from PDF, TXT, DOCX
- Smart exclusion patterns to skip system files

### Search
- Case-insensitive text search
- Context highlighting around matches
- Results show file path and match location

### AI Processing
- Uses OpenAI GPT-3.5-turbo by default
- Automatic text chunking for large documents
- Streaming support for better performance

## 🔒 Security & Privacy

- ✅ API keys stored in `.env` (gitignored)
- ✅ Documents folder excluded from git
- ✅ All processing happens locally
- ✅ No data sent to external services except OpenAI API
- ✅ Configurable exclude patterns for sensitive files

**For production deployment:**
- Add authentication
- Implement rate limiting
- Use HTTPS
- Set up proper CORS policies

## 🐛 Troubleshooting

### "Invalid OpenAI API key" error
- Check that your API key is correctly set in `.env`
- Ensure the key has sufficient credits
- Verify no extra spaces in the key

### No documents showing
- Check that documents are in indexed folders
- Click "🔄 Re-index Documents" button
- Verify file formats are supported (PDF, TXT, DOCX)

### Server won't start
- Ensure port 3000 is not in use: `lsof -ti:3000 | xargs kill -9`
- Check that all dependencies are installed: `npm install`
- Verify Node.js version: `node --version` (should be 14+)

### Search not working
- Ensure documents are indexed (check statistics)
- Try re-indexing from Settings tab
- Check console for errors

## 📄 License

MIT License - feel free to use and modify as needed.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 💡 Future Enhancements

- [ ] Support for more file formats (EPUB, RTF, HTML, Markdown)
- [ ] Batch processing of multiple documents
- [ ] Export results to various formats (PDF, DOCX, JSON)
- [ ] Document comparison feature
- [ ] Advanced search with regex support
- [ ] User authentication and document management
- [ ] Cloud storage integration (Google Drive, Dropbox)
- [ ] Support for other AI providers (Anthropic Claude, Google Gemini)
- [ ] Vector database integration for semantic search
- [ ] Document versioning and history
- [ ] Collaborative features
- [ ] Mobile app

## 📧 Support

For issues or questions, please open an issue on the [GitHub repository](https://github.com/hansb001/ai-document-tool/issues).

## 🙏 Acknowledgments

- Built with [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/)
- AI powered by [OpenAI](https://openai.com/)
- PDF parsing with [pdf-parse](https://www.npmjs.com/package/pdf-parse)
- DOCX parsing with [mammoth](https://www.npmjs.com/package/mammoth)
- File watching with [chokidar](https://www.npmjs.com/package/chokidar)

---

Made with ❤️ by [Hans Boef](https://github.com/hansb001)

**⭐ Star this repository if you find it useful!**