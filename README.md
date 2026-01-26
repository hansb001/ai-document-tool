# 🤖 AI Document Tool

A powerful browser-based application for searching, translating, and summarizing local documents using AI.

## ✨ Features

- 📤 **Upload Documents**: Support for PDF, TXT, and DOCX files
- 🔍 **Smart Search**: Search across all uploaded documents with context highlighting
- 🌐 **Translation**: Translate documents to 19+ languages using AI
- 📝 **Summarization**: Generate short, medium, or long summaries of documents
- 💻 **Browser-Based**: Runs entirely in your browser with a local backend
- 🎨 **Modern UI**: Clean, responsive interface with drag-and-drop support

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Navigate to the project directory:**
   ```bash
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
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   PORT=3000
   MAX_FILE_SIZE=10485760
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

## 📖 Usage Guide

### Uploading Documents

1. Click the upload area or drag and drop files
2. Supported formats: PDF, TXT, DOCX (max 10MB)
3. Documents are processed and stored locally

### Searching Documents

1. Go to the **Search** tab
2. Enter your search query
3. View results with highlighted matches and context
4. Search works across all uploaded documents

### Translating Documents

1. Go to the **Translate** tab
2. Select a document from the dropdown
3. Choose your target language
4. Click "Translate" to get the AI-powered translation

### Summarizing Documents

1. Go to the **Summarize** tab
2. Select a document from the dropdown
3. Choose summary length:
   - **Short**: 2-3 sentences
   - **Medium**: 1-2 paragraphs
   - **Long**: 3-4 paragraphs
4. Click "Summarize" to generate the summary

## 🏗️ Project Structure

```
ai-document-tool/
├── backend/
│   ├── server.js              # Express server
│   └── services/
│       ├── documentService.js # Document processing
│       └── aiService.js       # AI operations (OpenAI)
├── frontend/
│   ├── index.html            # Main HTML
│   ├── css/
│   │   └── styles.css        # Styling
│   └── js/
│       └── app.js            # Frontend logic
├── uploads/                  # Uploaded documents (auto-created)
├── package.json
├── .env.example
└── README.md
```

## 🔧 API Endpoints

### Upload Document
```
POST /api/upload
Content-Type: multipart/form-data
Body: { document: File }
```

### List Documents
```
GET /api/documents
```

### Search Documents
```
POST /api/search
Content-Type: application/json
Body: { query: string, documentIds?: string[] }
```

### Translate Document
```
POST /api/translate
Content-Type: application/json
Body: { documentId: string, targetLanguage: string }
```

### Summarize Document
```
POST /api/summarize
Content-Type: application/json
Body: { documentId: string, length: 'short'|'medium'|'long' }
```

### Delete Document
```
DELETE /api/documents/:id
```

## 🌍 Supported Languages

English, Spanish, French, German, Italian, Portuguese, Dutch, Russian, Chinese, Japanese, Korean, Arabic, Hindi, Turkish, Polish, Swedish, Danish, Norwegian, Finnish

## ⚙️ Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `PORT`: Server port (default: 3000)
- `MAX_FILE_SIZE`: Maximum file upload size in bytes (default: 10485760 = 10MB)

### Customization

- **Modify AI Model**: Edit `backend/services/aiService.js` to change the OpenAI model
- **Add File Types**: Update `backend/server.js` multer configuration and `documentService.js`
- **Styling**: Customize `frontend/css/styles.css`

## 🛠️ Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon for automatic server restart on file changes.

### Testing

1. Upload various document types (PDF, TXT, DOCX)
2. Test search with different queries
3. Try translations to different languages
4. Generate summaries of different lengths
5. Test file deletion

## 📝 Notes

- Documents are stored in the `uploads/` directory
- Document text is kept in memory for fast access
- Large documents are automatically chunked for AI processing
- The application uses OpenAI's GPT-3.5-turbo model by default

## 🔒 Security Considerations

- Keep your `.env` file secure and never commit it to version control
- The application is designed for local use
- For production deployment, add authentication and rate limiting
- Consider implementing file size and type validation on the backend

## 🐛 Troubleshooting

### "Invalid OpenAI API key" error
- Check that your API key is correctly set in `.env`
- Ensure the key has sufficient credits

### Upload fails
- Check file size (must be under 10MB by default)
- Verify file format is supported (PDF, TXT, DOCX)

### Server won't start
- Ensure port 3000 is not in use
- Check that all dependencies are installed (`npm install`)

### Translation/Summarization takes long
- Large documents are processed in chunks
- This is normal for documents over 4000 characters

## 📄 License

MIT License - feel free to use and modify as needed.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## 💡 Future Enhancements

- [ ] Support for more file formats (EPUB, RTF, etc.)
- [ ] Batch processing of multiple documents
- [ ] Export results to various formats
- [ ] Document comparison feature
- [ ] Advanced search with regex support
- [ ] User authentication and document management
- [ ] Cloud storage integration
- [ ] Support for other AI providers (Anthropic Claude, etc.)

## 📧 Support

For issues or questions, please open an issue on the project repository.

---

Made with ❤️ using Node.js, Express, and OpenAI