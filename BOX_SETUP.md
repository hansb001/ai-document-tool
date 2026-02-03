# Box Cloud Storage Integration Guide

## Overview
Intelligent Document Search now supports indexing and searching documents from Box cloud storage. This allows you to search, translate, and summarize documents stored in your Box account alongside local files.

## Prerequisites

- A Box account (free or paid)
- Access to Box Developer Console
- Node.js application running

## Setup Instructions

### Step 1: Create a Box Application

1. Go to [Box Developer Console](https://app.box.com/developers/console)
2. Click "Create New App"
3. Choose "Custom App"
4. Select authentication method:
   - **For Testing**: Choose "OAuth 2.0 with JWT (Server Authentication)" or use Developer Token
   - **For Production**: Choose "OAuth 2.0" for user authentication

### Step 2: Configure Your Box App

1. **Application Name**: Give your app a meaningful name (e.g., "Intelligent Document Search")
2. **Application Scopes**: Enable the following:
   - ✅ Read all files and folders stored in Box
   - ✅ Write all files and folders stored in Box (optional, for future features)
3. **CORS Domains** (if using web-based OAuth): Add your domain
4. **Redirect URI** (if using OAuth): Add your callback URL

### Step 3: Get Your Credentials

#### Option A: Developer Token (Quick Testing - Expires in 60 minutes)

1. In your Box app settings, scroll to "Developer Token"
2. Click "Generate Developer Token"
3. Copy the token (valid for 60 minutes)
4. Use this for quick testing

#### Option B: OAuth 2.0 (Production - Recommended)

1. Note your **Client ID** and **Client Secret** from the Configuration tab
2. Implement OAuth 2.0 flow in your application
3. Get access token and refresh token

#### Option C: JWT Authentication (Server-to-Server)

1. Generate a public/private key pair
2. Download the JSON configuration file
3. Use JWT to get access tokens

### Step 4: Configure Environment Variables

Edit your `.env` file and add:

```env
# Box Cloud Storage Configuration
BOX_CLIENT_ID=your_client_id_here
BOX_CLIENT_SECRET=your_client_secret_here
BOX_DEVELOPER_TOKEN=your_developer_token_here
BOX_ENABLED=true
```

**Important**: 
- Replace `your_client_id_here` with your actual Client ID
- Replace `your_client_secret_here` with your actual Client Secret
- Replace `your_developer_token_here` with your Developer Token
- Set `BOX_ENABLED=true` to enable Box integration

### Step 5: Restart the Application

```bash
npm start
```

The application will:
1. Initialize Box SDK
2. Automatically index up to 100 files from your Box account
3. Make them searchable alongside local documents

## Features

### Automatic Indexing
- Indexes PDF, TXT, DOCX, and DOC files from Box
- Downloads and extracts text content
- Stores metadata (filename, path, size, modified date)
- Caches documents for fast searching

### Search Integration
- Box documents appear in regular search results
- Marked with "Box:" prefix in path
- Searchable by filename and content

### Translation & Summarization
- Translate Box documents to 19+ languages
- Generate summaries (short, medium, long)
- Works exactly like local documents

### Comparison
- Compare Box documents with each other
- Compare Box documents with local files
- Duplicate detection across Box and local storage

## API Endpoints

### Get Box Documents
```http
GET /api/box/documents
```
Returns all indexed Box documents.

### Re-index Box Files
```http
POST /api/box/reindex
Content-Type: application/json

{
  "maxFiles": 100
}
```
Re-indexes Box files (default: 100 files max).

### Search Box Documents
```http
POST /api/box/search
Content-Type: application/json

{
  "query": "search term"
}
```
Searches only Box documents.

## Usage

### Via Web Interface

1. **View Box Documents**: Go to Documents tab - Box files show with "Box:" prefix
2. **Search**: Use the Search tab - results include both local and Box files
3. **Translate**: Select any Box document and translate it
4. **Summarize**: Select any Box document and summarize it
5. **Compare**: Compare Box documents using the Compare tab

### Via API

```javascript
// Search across all documents (local + Box)
fetch('http://localhost:3000/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'contract' })
})

// Get only Box documents
fetch('http://localhost:3000/api/box/documents')

// Re-index Box files
fetch('http://localhost:3000/api/box/reindex', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ maxFiles: 200 })
})
```

## Configuration Options

### Maximum Files to Index

By default, the application indexes up to 100 files from Box. To change this:

1. **Via API**: Send `maxFiles` parameter in re-index request
2. **Via Code**: Modify `boxService.indexBoxFiles(maxFiles)` in `server.js`

### Supported File Types

Currently supported:
- PDF (`.pdf`)
- Text (`.txt`)
- Word Documents (`.docx`, `.doc`)

### Folder Structure

The application recursively indexes all folders in your Box account, starting from the root folder.

## Troubleshooting

### "Box integration is not enabled"

**Problem**: API returns 503 error

**Solution**:
1. Check `.env` file has `BOX_ENABLED=true`
2. Verify credentials are correct
3. Restart the application

### "Box service not initialized"

**Problem**: Box credentials are missing or invalid

**Solutions**:
1. Verify `BOX_CLIENT_ID` and `BOX_CLIENT_SECRET` are set
2. Check `BOX_DEVELOPER_TOKEN` is valid (not expired)
3. Ensure Box app has correct permissions
4. Check console logs for specific error messages

### Developer Token Expired

**Problem**: Token expires after 60 minutes

**Solutions**:
1. Generate a new Developer Token in Box Developer Console
2. Update `.env` with new token
3. Restart application
4. For production, implement OAuth 2.0 or JWT authentication

### No Files Indexed

**Problem**: Box integration works but no files are indexed

**Solutions**:
1. Check if your Box account has supported file types
2. Verify file permissions (app must have read access)
3. Check console logs for download errors
4. Increase `maxFiles` limit if you have many files

### Slow Indexing

**Problem**: Indexing takes a long time

**Solutions**:
1. Box files must be downloaded and processed
2. Reduce `maxFiles` limit for faster startup
3. Consider indexing specific folders only (future feature)
4. Use caching - files are only downloaded once

## Security Best Practices

### Production Deployment

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Implement OAuth 2.0** instead of Developer Tokens
4. **Use JWT authentication** for server-to-server apps
5. **Rotate tokens regularly**
6. **Limit app permissions** to minimum required

### Access Control

1. Box app inherits user permissions
2. Users can only access files they have permission to view
3. Application cannot access files outside user's scope

## Performance Tips

1. **Limit Initial Index**: Start with 50-100 files for testing
2. **Cache Documents**: Indexed documents are cached in memory
3. **Incremental Updates**: Re-index only when needed
4. **Selective Indexing**: Consider indexing specific folders (future feature)

## Limitations

### Current Limitations

1. **File Limit**: Default 100 files (configurable)
2. **File Types**: Only PDF, TXT, DOCX, DOC
3. **Token Expiry**: Developer tokens expire in 60 minutes
4. **No Real-time Sync**: Manual re-index required for new files
5. **Memory Usage**: All indexed documents stored in memory

### Future Enhancements

- [ ] OAuth 2.0 implementation
- [ ] Selective folder indexing
- [ ] Real-time webhook integration
- [ ] Incremental updates
- [ ] Support for more file types
- [ ] Persistent storage for indexed documents

## Support

For Box-specific issues:
- [Box Developer Documentation](https://developer.box.com/)
- [Box Developer Forum](https://community.box.com/t5/Developer-Forum/bd-p/DeveloperForum)
- [Box API Reference](https://developer.box.com/reference/)

For application issues:
- Check console logs for error messages
- Verify `.env` configuration
- Test with Developer Token first
- See main README.md for general troubleshooting

## Example Use Cases

### 1. Search Contracts Across Box and Local Storage
```javascript
// Search for "contract" in all documents
POST /api/search
{ "query": "contract" }
// Returns results from both local files and Box
```

### 2. Translate Box Document
```javascript
// Translate a Box document to Spanish
POST /api/translate
{
  "documentId": "box_123456789",
  "targetLanguage": "Spanish"
}
```

### 3. Compare Two Box Documents
```javascript
// Find duplicates and compare
GET /api/duplicates
// Then compare specific versions
POST /api/compare
{
  "documentId1": "box_123456789",
  "documentId2": "box_987654321"
}
```

## Advanced Configuration

### Custom Box Folder

To index a specific folder instead of root (requires code modification):

```javascript
// In boxService.js, modify getAllFiles call:
await boxService.getAllFiles('folder_id_here', maxFiles);
```

### Webhook Integration (Future)

For real-time updates, you can set up Box webhooks:
1. Configure webhook in Box Developer Console
2. Create endpoint to receive webhook events
3. Trigger re-index on file changes

## Conclusion

Box integration allows you to seamlessly search, translate, and summarize documents stored in Box cloud storage alongside your local files. The integration is designed to be simple to set up for testing and scalable for production use.

For questions or issues, please refer to the main documentation or create an issue in the repository.