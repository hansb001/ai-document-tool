const Diff = require('diff');

/**
 * Local Document Comparison Service
 * Compares documents without using AI/OpenAI
 */

/**
 * Compare two documents using local diff algorithm
 */
function compareDocuments(text1, text2, doc1Name, doc2Name) {
  // Get line-by-line diff
  const lineDiff = Diff.diffLines(text1, text2);
  
  // Get word-level diff for summary
  const wordDiff = Diff.diffWords(text1, text2);
  
  // Calculate statistics
  const stats = calculateStats(lineDiff, wordDiff, text1, text2);
  
  // Generate comparison report
  const report = generateComparisonReport(lineDiff, stats, doc1Name, doc2Name);
  
  return report;
}

/**
 * Calculate comparison statistics
 */
function calculateStats(lineDiff, wordDiff, text1, text2) {
  let addedLines = 0;
  let removedLines = 0;
  let unchangedLines = 0;
  let addedWords = 0;
  let removedWords = 0;
  
  // Count line changes
  lineDiff.forEach(part => {
    const lineCount = part.value.split('\n').length - 1;
    if (part.added) {
      addedLines += lineCount;
    } else if (part.removed) {
      removedLines += lineCount;
    } else {
      unchangedLines += lineCount;
    }
  });
  
  // Count word changes
  wordDiff.forEach(part => {
    const wordCount = part.value.split(/\s+/).filter(w => w.length > 0).length;
    if (part.added) {
      addedWords += wordCount;
    } else if (part.removed) {
      removedWords += wordCount;
    }
  });
  
  const totalLines = addedLines + removedLines + unchangedLines;
  const changedLines = addedLines + removedLines;
  const similarityPercent = totalLines > 0 
    ? Math.round(((totalLines - changedLines) / totalLines) * 100) 
    : 100;
  
  return {
    addedLines,
    removedLines,
    unchangedLines,
    totalLines,
    changedLines,
    addedWords,
    removedWords,
    similarityPercent,
    text1Length: text1.length,
    text2Length: text2.length,
    text1Lines: text1.split('\n').length,
    text2Lines: text2.split('\n').length
  };
}

/**
 * Generate HTML comparison report
 */
function generateComparisonReport(lineDiff, stats, doc1Name, doc2Name) {
  let report = `
<div class="comparison-summary">
  <h3>📊 Comparison Summary</h3>
  <div class="stats-grid">
    <div class="stat-item">
      <span class="stat-label">Similarity</span>
      <span class="stat-value">${stats.similarityPercent}%</span>
    </div>
    <div class="stat-item added">
      <span class="stat-label">Added</span>
      <span class="stat-value">+${stats.addedLines} lines</span>
    </div>
    <div class="stat-item removed">
      <span class="stat-label">Removed</span>
      <span class="stat-value">-${stats.removedLines} lines</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Unchanged</span>
      <span class="stat-value">${stats.unchangedLines} lines</span>
    </div>
  </div>
</div>

<div class="comparison-details">
  <h3>📄 Document Details</h3>
  <div class="doc-details-grid">
    <div class="doc-detail">
      <strong>${doc1Name}</strong>
      <p>${stats.text1Lines} lines • ${stats.text1Length} characters</p>
    </div>
    <div class="doc-detail">
      <strong>${doc2Name}</strong>
      <p>${stats.text2Lines} lines • ${stats.text2Length} characters</p>
    </div>
  </div>
</div>
`;

  // Add key changes section if there are significant changes
  if (stats.changedLines > 0) {
    report += `
<div class="comparison-changes">
  <h3>🔄 Key Changes</h3>
  <ul>
    ${stats.addedLines > 0 ? `<li class="change-added">✓ ${stats.addedLines} line(s) added (${stats.addedWords} words)</li>` : ''}
    ${stats.removedLines > 0 ? `<li class="change-removed">✗ ${stats.removedLines} line(s) removed (${stats.removedWords} words)</li>` : ''}
    <li>📝 ${Math.round((stats.changedLines / stats.totalLines) * 100)}% of content changed</li>
  </ul>
</div>
`;
  }

  // Add detailed diff view (limited to first 50 changes for performance)
  const significantChanges = lineDiff.filter(part => part.added || part.removed).slice(0, 50);
  
  if (significantChanges.length > 0) {
    report += `
<div class="comparison-diff">
  <h3>📝 Detailed Changes</h3>
  <div class="diff-container">
`;

    significantChanges.forEach((part, index) => {
      const lines = part.value.split('\n').filter(line => line.trim().length > 0);
      const className = part.added ? 'diff-added' : part.removed ? 'diff-removed' : 'diff-unchanged';
      const symbol = part.added ? '+' : part.removed ? '-' : ' ';
      
      lines.forEach(line => {
        if (line.trim()) {
          const escapedLine = escapeHtml(line.substring(0, 200)); // Limit line length
          report += `<div class="${className}"><span class="diff-symbol">${symbol}</span>${escapedLine}</div>\n`;
        }
      });
    });

    if (lineDiff.filter(part => part.added || part.removed).length > 50) {
      report += `<div class="diff-more">... and ${lineDiff.filter(part => part.added || part.removed).length - 50} more changes</div>`;
    }

    report += `
  </div>
</div>
`;
  } else {
    report += `
<div class="comparison-identical">
  <h3>✅ Documents are Identical</h3>
  <p>No differences found between the two documents.</p>
</div>
`;
  }

  return report;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const map = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

module.exports = {
  compareDocuments
};