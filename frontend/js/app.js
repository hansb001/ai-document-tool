// API Base URL
const API_BASE = 'http://localhost:3000/api';

// State
let documents = [];

// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const uploadStatus = document.getElementById('uploadStatus');
const documentsList = document.getElementById('documentsList');
const loadingOverlay = document.getElementById('loadingOverlay');

// Tab elements
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Search elements
const searchQuery = document.getElementById('searchQuery');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');

// Translate elements
const documentSelect = document.getElementById('documentSelect');
const targetLanguage = document.getElementById('targetLanguage');
const translateBtn = document.getElementById('translateBtn');
const translateResults = document.getElementById('translateResults');

// Summarize elements
const documentSelectSummarize = document.getElementById('documentSelectSummarize');
const summarizeBtn = document.getElementById('summarizeBtn');
const summarizeResults = document.getElementById('summarizeResults');

// Compare elements
const findDuplicatesBtn = document.getElementById('findDuplicatesBtn');
const duplicatesList = document.getElementById('duplicatesList');
const duplicateCount = document.getElementById('duplicateCount');
const compareResults = document.getElementById('compareResults');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadDocuments();
    loadStats();
    // Refresh stats every 30 seconds
    setInterval(loadStats, 30000);
    // Load settings when settings tab is first opened
    loadSettings();
});

// Event Listeners
function setupEventListeners() {
    // Tabs
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
    
    // Search
    searchBtn.addEventListener('click', performSearch);
    searchQuery.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Translate
    translateBtn.addEventListener('click', performTranslation);
    
    // Summarize
    summarizeBtn.addEventListener('click', performSummarization);
    
    // Find duplicates
    findDuplicatesBtn.addEventListener('click', findDuplicates);
    
    // Re-index button
    const reindexBtn = document.getElementById('reindexBtn');
    if (reindexBtn) {
        reindexBtn.addEventListener('click', performReindex);
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadDocuments();
            loadStats();
        });
    }
    
    // Settings buttons
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const loadSettingsBtn = document.getElementById('loadSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }
    if (loadSettingsBtn) {
        loadSettingsBtn.addEventListener('click', loadSettings);
    }
}

// File Upload Handlers
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) uploadFile(file);
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
}

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('document', file);
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showStatus('success', `✓ ${file.name} uploaded successfully!`);
            await loadDocuments();
            fileInput.value = '';
        } else {
            showStatus('error', `✗ Upload failed: ${data.error}`);
        }
    } catch (error) {
        showStatus('error', `✗ Upload failed: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Load Documents
async function loadDocuments() {
    try {
        const response = await fetch(`${API_BASE}/documents`);
        documents = await response.json();
        renderDocuments();
        updateDocumentSelects();
    } catch (error) {
        console.error('Failed to load documents:', error);
    }
}

function renderDocuments() {
    if (documents.length === 0) {
        documentsList.innerHTML = '<p class="empty-state">No documents uploaded yet</p>';
        return;
    }
    
    documentsList.innerHTML = documents.map(doc => `
        <div class="document-item" data-id="${doc.id}">
            <div class="document-info">
                <span class="document-icon">📄</span>
                <div class="document-details">
                    <h4>${doc.filename}</h4>
                    <p class="document-meta">
                        ${doc.relativePath ? `Path: ${doc.relativePath}<br>` : ''}
                        ${doc.indexedAt ? `Indexed: ${new Date(doc.indexedAt).toLocaleString()}` :
                          doc.uploadedAt ? `Uploaded: ${new Date(doc.uploadedAt).toLocaleString()}` : ''}
                        ${doc.size ? ` • ${formatFileSize(doc.size)}` : ''}
                    </p>
                </div>
            </div>
            <div class="document-actions">
                <button class="btn-icon open" onclick="openDocument('${doc.id}')" title="Open Document">
                    📂
                </button>
                <button class="btn-icon delete" onclick="deleteDocument('${doc.id}')" title="Delete">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}

function updateDocumentSelects() {
    const options = documents.map(doc =>
        `<option value="${doc.id}">${doc.filename}</option>`
    ).join('');
    
    documentSelect.innerHTML = '<option value="">Select a document...</option>' + options;
    documentSelectSummarize.innerHTML = '<option value="">Select a document...</option>' + options;
}

async function openDocument(docId) {
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE}/open-document`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentId: docId })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showStatus('success', `✓ Document opened: ${data.path}`);
        } else {
            showStatus('error', `✗ Failed to open document: ${data.error}`);
        }
    } catch (error) {
        showStatus('error', `✗ Failed to open document: ${error.message}`);
    } finally {
        hideLoading();
    }
}

async function deleteDocument(docId) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE}/documents/${docId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadDocuments();
            showStatus('success', '✓ Document deleted successfully!');
        } else {
            const data = await response.json();
            showStatus('error', `✗ Delete failed: ${data.error}`);
        }
    } catch (error) {
        showStatus('error', `✗ Delete failed: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Tab Switching
function switchTab(tabName) {
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}Tab`);
    });
    
    // Clear results when switching tabs
    searchResults.innerHTML = '';
    translateResults.innerHTML = '';
    summarizeResults.innerHTML = '';
}

// Search Functionality
async function performSearch() {
    const query = searchQuery.value.trim();
    
    if (!query) {
        alert('Please enter a search query');
        return;
    }
    
    if (documents.length === 0) {
        alert('Please upload documents first');
        return;
    }
    
    showLoading();
    searchResults.innerHTML = '';
    
    try {
        const response = await fetch(`${API_BASE}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displaySearchResults(data.results, query);
        } else {
            searchResults.innerHTML = `<p class="error">Search failed: ${data.error}</p>`;
        }
    } catch (error) {
        searchResults.innerHTML = `<p class="error">Search failed: ${error.message}</p>`;
    } finally {
        hideLoading();
    }
}

function displaySearchResults(results, query) {
    if (results.length === 0) {
        searchResults.innerHTML = '<p class="empty-state">No matches found</p>';
        return;
    }
    
    const totalMatches = results.reduce((sum, r) => sum + r.matches.length, 0);
    
    searchResults.innerHTML = `
        <p style="margin-bottom: 1rem; font-weight: 600;">
            Found ${totalMatches} match${totalMatches !== 1 ? 'es' : ''} in ${results.length} document${results.length !== 1 ? 's' : ''}
        </p>
        ${results.map(result => `
            <div class="search-result">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="margin: 0;">📄 ${result.filename}</h4>
                    <button class="btn btn-sm" onclick="openDocument('${result.documentId}')" style="padding: 0.25rem 0.75rem;">
                        📂 Open
                    </button>
                </div>
                <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">${result.relativePath || ''}</p>
                ${result.matches.slice(0, 5).map(match => `
                    <p style="margin: 0.5rem 0; color: #4b5563;">
                        ${highlightMatch(match.context, query)}
                    </p>
                `).join('')}
                ${result.matches.length > 5 ? `<p style="color: #6b7280; font-size: 0.875rem;">...and ${result.matches.length - 5} more matches</p>` : ''}
            </div>
        `).join('')}
    `;
}

function highlightMatch(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<span class="search-match">$1</span>');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Translation Functionality
async function performTranslation() {
    const docId = documentSelect.value;
    const language = targetLanguage.value;
    
    if (!docId) {
        alert('Please select a document');
        return;
    }
    
    if (!language) {
        alert('Please select a target language');
        return;
    }
    
    showLoading();
    translateResults.innerHTML = '';
    
    try {
        const response = await fetch(`${API_BASE}/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentId: docId, targetLanguage: language })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            translateResults.innerHTML = `
                <h4 style="margin-bottom: 1rem;">Translation to ${language}:</h4>
                <div class="result-text">${data.translation}</div>
            `;
        } else {
            translateResults.innerHTML = `<p class="error">Translation failed: ${data.error}</p>`;
        }
    } catch (error) {
        translateResults.innerHTML = `<p class="error">Translation failed: ${error.message}</p>`;
    } finally {
        hideLoading();
    }
}

// Summarization Functionality
async function performSummarization() {
    const docId = documentSelectSummarize.value;
    const length = document.querySelector('input[name="summaryLength"]:checked').value;
    
    if (!docId) {
        alert('Please select a document');
        return;
    }
    
    showLoading();
    summarizeResults.innerHTML = '';
    
    try {
        const response = await fetch(`${API_BASE}/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentId: docId, length })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            summarizeResults.innerHTML = `
                <h4 style="margin-bottom: 1rem;">Summary (${length}):</h4>
                <div class="result-text">${data.summary}</div>
            `;
        } else {
            summarizeResults.innerHTML = `<p class="error">Summarization failed: ${data.error}</p>`;
        }
    } catch (error) {
        summarizeResults.innerHTML = `<p class="error">Summarization failed: ${error.message}</p>`;
    } finally {
        hideLoading();
    }
}

// Duplicate Detection and Comparison Functionality
async function findDuplicates() {
    showLoading();
    duplicatesList.innerHTML = '';
    compareResults.innerHTML = '';
    duplicateCount.textContent = '';
    
    try {
        const response = await fetch(`${API_BASE}/duplicates`);
        const data = await response.json();
        
        if (response.ok && data.duplicates.length > 0) {
            duplicateCount.textContent = `Found ${data.totalDuplicateGroups} duplicate filename(s)`;
            displayDuplicates(data.duplicates);
        } else if (data.duplicates.length === 0) {
            duplicatesList.innerHTML = '<p style="color: #6b7280; padding: 1rem; text-align: center;">✓ No duplicate filenames found. All documents have unique names.</p>';
        } else {
            duplicatesList.innerHTML = `<p class="error">Failed to find duplicates: ${data.error}</p>`;
        }
    } catch (error) {
        duplicatesList.innerHTML = `<p class="error">Failed to find duplicates: ${error.message}</p>`;
    } finally {
        hideLoading();
    }
}

function displayDuplicates(duplicates) {
    duplicatesList.innerHTML = duplicates.map(dup => `
        <div class="duplicate-group">
            <div class="duplicate-header">
                <h4 style="margin: 0; color: #1f2937;">📄 ${dup.filename}</h4>
                <span class="duplicate-badge">${dup.count} versions</span>
            </div>
            <div class="duplicate-documents">
                ${dup.documents.map((doc, index) => `
                    <div class="duplicate-doc-item">
                        <div class="duplicate-doc-info">
                            <span class="duplicate-doc-number">#${index + 1}</span>
                            <div>
                                <p style="margin: 0; font-size: 0.875rem; color: #4b5563;">${doc.relativePath}</p>
                                <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #9ca3af;">
                                    ${formatFileSize(doc.size)} • Modified: ${new Date(doc.modifiedAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${dup.count === 2 ? `
                <button class="btn btn-primary" onclick="compareDuplicates('${dup.documents[0].id}', '${dup.documents[1].id}', '${escapeHtml(dup.filename)}')" style="margin-top: 0.75rem; width: 100%;">
                    🔄 Compare These Two Versions
                </button>
            ` : dup.count > 2 ? `
                <div style="margin-top: 0.75rem;">
                    <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">Select two versions to compare:</p>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <select id="compare-select-1-${dup.filename.replace(/[^a-zA-Z0-9]/g, '')}" class="select-field" style="flex: 1;">
                            ${dup.documents.map((doc, idx) => `<option value="${doc.id}">Version #${idx + 1}</option>`).join('')}
                        </select>
                        <span>vs</span>
                        <select id="compare-select-2-${dup.filename.replace(/[^a-zA-Z0-9]/g, '')}" class="select-field" style="flex: 1;">
                            ${dup.documents.map((doc, idx) => `<option value="${doc.id}" ${idx === 1 ? 'selected' : ''}>Version #${idx + 1}</option>`).join('')}
                        </select>
                        <button class="btn btn-primary" onclick="compareSelected('${dup.filename.replace(/[^a-zA-Z0-9]/g, '')}', '${escapeHtml(dup.filename)}')">
                            Compare
                        </button>
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

async function compareDuplicates(docId1, docId2, filename) {
    showLoading();
    compareResults.innerHTML = '';
    
    try {
        const response = await fetch(`${API_BASE}/compare`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentId1: docId1, documentId2: docId2 })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Local comparison returns HTML directly, no need to format
            compareResults.innerHTML = `
                <div class="comparison-header">
                    <h4 style="margin: 0 0 0.5rem 0; color: white;">📊 Comparing: ${filename}</h4>
                    <p style="margin: 0; opacity: 0.95;">
                        <strong>Version 1:</strong> ${data.document1.filename}<br>
                        <strong>Version 2:</strong> ${data.document2.filename}
                    </p>
                </div>
                ${data.comparison}
            `;
            
            // Scroll to results
            compareResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            compareResults.innerHTML = `<p class="error">Comparison failed: ${data.error}</p>`;
        }
    } catch (error) {
        compareResults.innerHTML = `<p class="error">Comparison failed: ${error.message}</p>`;
    } finally {
        hideLoading();
    }
}

function compareSelected(safeFilename, originalFilename) {
    const select1 = document.getElementById(`compare-select-1-${safeFilename}`);
    const select2 = document.getElementById(`compare-select-2-${safeFilename}`);
    
    const docId1 = select1.value;
    const docId2 = select2.value;
    
    if (docId1 === docId2) {
        alert('Please select two different versions to compare');
        return;
    }
    
    compareDuplicates(docId1, docId2, originalFilename);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatComparisonResult(text) {
    // Convert markdown-style formatting to HTML
    let formatted = text
        // Bold text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Headers
        .replace(/^### (.+)$/gm, '<h4 style="margin-top: 1.5rem; margin-bottom: 0.5rem; color: #1f2937;">$1</h4>')
        .replace(/^## (.+)$/gm, '<h3 style="margin-top: 1.5rem; margin-bottom: 0.5rem; color: #1f2937;">$1</h3>')
        .replace(/^# (.+)$/gm, '<h2 style="margin-top: 1.5rem; margin-bottom: 0.5rem; color: #1f2937;">$1</h2>')
        // Bullet points
        .replace(/^- (.+)$/gm, '<li style="margin-left: 1.5rem;">$1</li>')
        .replace(/^• (.+)$/gm, '<li style="margin-left: 1.5rem;">$1</li>')
        // Numbered lists
        .replace(/^\d+\. (.+)$/gm, '<li style="margin-left: 1.5rem;">$1</li>')
        // Paragraphs
        .replace(/\n\n/g, '</p><p style="margin: 1rem 0;">')
        // Line breaks
        .replace(/\n/g, '<br>');
    
    // Wrap in paragraph tags
    formatted = '<p style="margin: 1rem 0;">' + formatted + '</p>';
    
    // Wrap consecutive list items in ul tags
    formatted = formatted.replace(/(<li[^>]*>.*?<\/li>)(?:\s*<br>\s*<li[^>]*>.*?<\/li>)*/g, function(match) {
        return '<ul style="margin: 0.5rem 0;">' + match.replace(/<br>/g, '') + '</ul>';
    });
    
    return formatted;
}

// UI Helpers
function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

function showStatus(type, message) {
    uploadStatus.className = `status-message ${type}`;
    uploadStatus.textContent = message;
    uploadStatus.style.display = 'block';
    
    setTimeout(() => {
        uploadStatus.style.display = 'none';
    }, 5000);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Load Statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        const stats = await response.json();
        
        document.getElementById('statDocuments').textContent = stats.totalDocuments || 0;
        document.getElementById('statSize').textContent = formatFileSize(stats.totalSize || 0);
        document.getElementById('statWords').textContent = (stats.totalWords || 0).toLocaleString();
        
        const statusEl = document.getElementById('statStatus');
        const watchIcon = document.getElementById('watchIcon');
        if (stats.isIndexing) {
            statusEl.textContent = 'Indexing...';
            watchIcon.textContent = '⏳';
        } else if (stats.isWatching) {
            statusEl.textContent = 'Watching';
            watchIcon.textContent = '👁️';
        } else {
            statusEl.textContent = 'Ready';
            watchIcon.textContent = '✓';
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Re-index Documents
async function performReindex() {
    if (!confirm('Re-index all documents? This will scan the documents folder again.')) {
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE}/reindex`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('✓ Documents re-indexed successfully!');
            await loadDocuments();
            await loadStats();
        } else {
            alert(`✗ Re-index failed: ${data.error}`);
        }
    } catch (error) {
        alert(`✗ Re-index failed: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Settings Functions
async function loadSettings() {
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE}/settings`);
        const settings = await response.json();
        
        if (response.ok) {
            // Parse folders
            const folders = settings.folders.split(',').map(f => f.trim());
            
            // Update checkboxes
            document.getElementById('folder-documents').checked = folders.includes('~/Documents');
            document.getElementById('folder-desktop').checked = folders.includes('~/Desktop');
            document.getElementById('folder-downloads').checked = folders.includes('~/Downloads');
            document.getElementById('folder-project').checked = folders.includes('./documents');
            
            // Get custom folders (those not in the checkboxes)
            const standardFolders = ['~/Documents', '~/Desktop', '~/Downloads', './documents'];
            const customFolders = folders.filter(f => !standardFolders.includes(f));
            document.getElementById('customFolders').value = customFolders.join('\n');
            
            // Update exclude patterns
            document.getElementById('excludePatterns').value = settings.excludePatterns;
            
            showSettingsStatus('success', '✓ Settings loaded successfully!');
        } else {
            showSettingsStatus('error', `✗ Failed to load settings: ${settings.error}`);
        }
    } catch (error) {
        showSettingsStatus('error', `✗ Failed to load settings: ${error.message}`);
    } finally {
        hideLoading();
    }
}

async function saveSettings() {
    const folders = [];
    
    // Get checked standard folders
    if (document.getElementById('folder-documents').checked) folders.push('~/Documents');
    if (document.getElementById('folder-desktop').checked) folders.push('~/Desktop');
    if (document.getElementById('folder-downloads').checked) folders.push('~/Downloads');
    if (document.getElementById('folder-project').checked) folders.push('./documents');
    
    // Get custom folders
    const customFolders = document.getElementById('customFolders').value
        .split('\n')
        .map(f => f.trim())
        .filter(f => f);
    folders.push(...customFolders);
    
    // Get exclude patterns
    const excludePatterns = document.getElementById('excludePatterns').value.trim();
    
    if (folders.length === 0) {
        showSettingsStatus('error', '✗ Please select at least one folder to index!');
        return;
    }
    
    if (!confirm(`Save settings and re-index ${folders.length} folder(s)?\n\nFolders:\n${folders.join('\n')}`)) {
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                folders: folders.join(','),
                excludePatterns: excludePatterns
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSettingsStatus('success', `✓ Settings saved! Re-indexing ${folders.length} folder(s)...`);
            
            // Wait a bit then reload stats and documents
            setTimeout(async () => {
                await loadDocuments();
                await loadStats();
                showSettingsStatus('success', '✓ Settings saved and documents re-indexed successfully!');
            }, 2000);
        } else {
            showSettingsStatus('error', `✗ Failed to save settings: ${data.error}`);
        }
    } catch (error) {
        showSettingsStatus('error', `✗ Failed to save settings: ${error.message}`);
    } finally {
        hideLoading();
    }
}

function showSettingsStatus(type, message) {
    const statusEl = document.getElementById('settingsStatus');
    statusEl.className = `status-message ${type}`;
    statusEl.textContent = message;
    statusEl.style.display = 'block';
    
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 5000);
}