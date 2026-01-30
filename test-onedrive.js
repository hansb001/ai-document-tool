// Test script to verify OneDrive folder detection
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

async function expandPath(folderPath) {
  if (folderPath.startsWith('~/')) {
    return path.join(os.homedir(), folderPath.slice(2));
  }
  return folderPath;
}

async function expandFolderWildcards(folders) {
  const expandedFolders = [];
  
  for (const folder of folders) {
    const expandedPath = await expandPath(folder);
    
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
            console.log(`✓ Matched wildcard: ${matchedPath}`);
          }
        }
      } catch (error) {
        console.log(`⚠️  Could not expand wildcard ${folder}: ${error.message}`);
      }
    } else {
      // No wildcard, add as-is
      expandedFolders.push(expandedPath);
    }
  }
  
  return expandedFolders;
}

async function testOneDrive() {
  console.log('🧪 Testing OneDrive folder detection...\n');
  
  const testFolders = [
    '~/OneDrive',
    '~/OneDrive - *',
    '~/Library/CloudStorage/OneDrive-*'
  ];
  
  console.log('Input folders:');
  testFolders.forEach(f => console.log(`  - ${f}`));
  console.log();
  
  const expanded = await expandFolderWildcards(testFolders);
  
  console.log(`\n📊 Results: Found ${expanded.length} folder(s)\n`);
  
  // Check if folders exist and count files
  for (const folder of expanded) {
    try {
      await fs.access(folder);
      console.log(`✅ ${folder}`);
      
      // Count supported files
      const { execSync } = require('child_process');
      const count = execSync(
        `find "${folder}" -type f \\( -name "*.pdf" -o -name "*.docx" -o -name "*.doc" -o -name "*.txt" \\) 2>/dev/null | wc -l`
      ).toString().trim();
      
      console.log(`   📄 Contains ~${count} supported document(s)\n`);
    } catch (error) {
      console.log(`❌ ${folder} - ${error.message}\n`);
    }
  }
}

testOneDrive().catch(console.error);