# OneDrive Integration Guide

## Overview
Intelligent Document Search now supports indexing documents from Microsoft OneDrive, including both personal OneDrive and OneDrive for Business accounts.

## OneDrive Folder Locations on macOS

### Personal OneDrive
- **Standard Location**: `~/OneDrive`
- **Alternative Location**: `~/Library/CloudStorage/OneDrive-Personal`

### OneDrive for Business
- **Standard Location**: `~/OneDrive - [Organization Name]`
- **Alternative Location**: `~/Library/CloudStorage/OneDrive-[Organization Name]`

## Configuration

The application is pre-configured to search common OneDrive locations. The `.env` file includes:

```env
DOCUMENTS_FOLDERS=~/Documents,~/Desktop,~/Downloads,./documents,~/OneDrive,~/OneDrive - *,~/Library/CloudStorage/OneDrive-Personal,~/Library/CloudStorage/OneDrive-*,~/Library/Group Containers/UBF8T346G9.Office/Outlook,~/Library/Mail,~/Library/Application Support/Microsoft/Teams
```

### Wildcard Support
The application supports wildcards (`*`) in folder paths, which is particularly useful for OneDrive for Business:
- `~/OneDrive - *` matches any folder starting with "OneDrive - " (e.g., "OneDrive - Contoso", "OneDrive - Acme Corp")
- `~/Library/CloudStorage/OneDrive-*` matches OneDrive folders in the CloudStorage directory

## How It Works

1. **Automatic Discovery**: The application automatically discovers OneDrive folders using wildcard patterns
2. **Real-time Sync**: As OneDrive syncs files to your local machine, they are automatically indexed
3. **File Watching**: Changes to OneDrive files are detected and re-indexed automatically
4. **Supported Formats**: PDF, TXT, DOCX, and DOC files in OneDrive are indexed

## Verifying OneDrive Integration

### Check Your OneDrive Location
1. Open Finder
2. Look for "OneDrive" in the sidebar or navigate to your home folder
3. Note the exact folder name (e.g., "OneDrive - Microsoft" or just "OneDrive")

### Test the Integration
1. Start the application: `npm start`
2. Check the console output for OneDrive folder detection:
   ```
   📂 Indexing documents from X folder(s):
      - ~/OneDrive
      ✓ Matched wildcard: /Users/yourname/OneDrive - YourOrg
   ```
3. Open the web interface at `http://localhost:3000`
4. Check the "Documents" tab to see indexed OneDrive files

## Customizing OneDrive Paths

If your OneDrive is in a non-standard location:

1. Open `.env` file
2. Add your custom OneDrive path to `DOCUMENTS_FOLDERS`:
   ```env
   DOCUMENTS_FOLDERS=~/Documents,/path/to/your/onedrive
   ```
3. Restart the application

## Excluding OneDrive Folders

To exclude specific OneDrive folders or file types:

1. Open `.env` file
2. Add patterns to `EXCLUDE_PATTERNS`:
   ```env
   EXCLUDE_PATTERNS=node_modules,*.app,*.dmg,*.pkg,.git,.DS_Store,*.tmp,*.temp,~$*,Archive,Old Files
   ```

Common exclusions:
- `~$*` - Temporary Office files
- `*.tmp`, `*.temp` - Temporary files
- `Archive` - Archive folders
- `.Trash-*` - Trash folders

## OneDrive Sync Status

**Important**: Only files that are synced to your local machine can be indexed. Files that are "online-only" (cloud-only) cannot be indexed until they are downloaded.

### Checking Sync Status
- **Green checkmark** ✓ - File is synced and available locally
- **Blue cloud** ☁️ - File is online-only (not indexed)
- **Sync icon** 🔄 - File is currently syncing

To make files available for indexing:
1. Right-click the file or folder in Finder
2. Select "Always keep on this device"

## Troubleshooting

### OneDrive Folders Not Found
**Problem**: Console shows "Skipping ~/OneDrive: ENOENT: no such file or directory"

**Solutions**:
1. Verify OneDrive is installed and syncing
2. Check the actual folder name in Finder
3. Update `.env` with the correct path
4. Ensure OneDrive sync is complete

### No OneDrive Documents Indexed
**Problem**: OneDrive folder is found but no documents are indexed

**Solutions**:
1. Check if files are synced locally (not online-only)
2. Verify file formats are supported (PDF, TXT, DOCX, DOC)
3. Check `EXCLUDE_PATTERNS` isn't blocking your files
4. Look for error messages in the console

### Permission Issues
**Problem**: "Permission denied" errors when accessing OneDrive

**Solutions**:
1. Grant Full Disk Access to Terminal/Node.js:
   - System Preferences → Security & Privacy → Privacy → Full Disk Access
   - Add Terminal or your code editor
2. Restart the application

### Slow Indexing
**Problem**: OneDrive indexing takes a long time

**Solutions**:
1. OneDrive folders can be large - be patient during initial indexing
2. Use `EXCLUDE_PATTERNS` to skip unnecessary folders
3. Consider indexing specific OneDrive subfolders instead of the entire OneDrive

## Performance Tips

1. **Selective Indexing**: Instead of indexing entire OneDrive, specify important folders:
   ```env
   DOCUMENTS_FOLDERS=~/OneDrive/Work Documents,~/OneDrive/Projects
   ```

2. **Exclude Large Folders**: Add folders with many files to exclusions:
   ```env
   EXCLUDE_PATTERNS=node_modules,*.app,Photos,Videos,Music
   ```

3. **Monitor Resource Usage**: Large OneDrive folders may require more memory and CPU during indexing

## Integration with Other Microsoft Services

The application also indexes:
- **Outlook**: `~/Library/Group Containers/UBF8T346G9.Office/Outlook`
- **Teams**: `~/Library/Application Support/Microsoft/Teams`
- **Mail**: `~/Library/Mail`

These are pre-configured in the `.env` file.

## Security and Privacy

- All indexing happens locally on your machine
- No data is sent to external servers except for AI operations (translation/summarization)
- OneDrive credentials are not accessed or stored by the application
- The application only reads files that OneDrive has already synced locally

## Support

For issues specific to OneDrive integration, check:
1. OneDrive sync status in the OneDrive menu bar icon
2. Console output when starting the application
3. Application logs for specific error messages

For general application support, see the main README.md file.