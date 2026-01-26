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
                <h4>📄 ${result.filename}</h4>
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