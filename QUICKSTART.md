# 🚀 Quick Start Guide

Get your AI Document Tool up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd ai-document-tool
npm install
```

## Step 2: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy the key (you won't see it again!)

## Step 3: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API key
# Replace 'your_openai_api_key_here' with your actual key
```

Your `.env` file should look like:
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
PORT=3000
MAX_FILE_SIZE=10485760
```

## Step 4: Start the Server

```bash
npm start
```

You should see:
```
🚀 AI Document Tool server running on http://localhost:3000
📁 Upload directory: /path/to/uploads
```

## Step 5: Open in Browser

Open your browser and go to:
```
http://localhost:3000
```

## 🎉 You're Ready!

Now you can:
- 📤 Upload documents (PDF, TXT, DOCX)
- 🔍 Search across all documents
- 🌐 Translate to 19+ languages
- 📝 Generate AI summaries

## 💡 Tips

- **First time?** Try uploading a simple text file to test
- **Search** works across all uploaded documents at once
- **Translation** and **Summarization** work on one document at a time
- **Large files** may take longer to process (they're chunked automatically)

## ⚠️ Troubleshooting

### Port already in use?
Change the PORT in `.env` to something else like 3001

### API key not working?
- Make sure there are no spaces in your `.env` file
- Check that your OpenAI account has credits
- Verify the key starts with `sk-`

### Upload fails?
- Check file size (max 10MB by default)
- Ensure file format is PDF, TXT, or DOCX

## 📚 Next Steps

Check out the full [README.md](README.md) for:
- Detailed feature documentation
- API endpoint reference
- Customization options
- Security considerations

---

Need help? Open an issue or check the README!