// ===================================
// CONFIGURATION
// ===================================
const CONFIG = {
    get owner() {
        return localStorage.getItem('github_username') || '';
    },
    get repo() {
        return localStorage.getItem('github_repo') || '';
    },
    // Token is now managed via localStorage for security
    get token() {
        return localStorage.getItem('github_token');
    }
};

// ===================================
// APPLICATION CODE
// ===================================

// DOM Elements
const languageSelect = document.getElementById('language');
const codeTitleInput = document.getElementById('codeTitle');
const codeTextarea = document.getElementById('codeInput');
const descriptionTextarea = document.getElementById('description');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const loadBtn = document.getElementById('loadBtn');
const statusDiv = document.getElementById('status');
const savedCodesDiv = document.getElementById('savedCodes');
const themeSelect = document.getElementById('themeSelect');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const saveTokenBtn = document.getElementById('saveTokenBtn');
const tokenInput = document.getElementById('tokenInput');
const usernameInput = document.getElementById('usernameInput');
const repoInput = document.getElementById('repoInput');
const createRepoBtn = document.getElementById('createRepoBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const searchInput = document.getElementById('searchInput');
const aiKeyInput = document.getElementById('aiKeyInput');

// AI Elements
const aiGenerateBtn = document.getElementById('aiGenerateBtn');
const aiModal = document.getElementById('aiModal');
const closeAiModalBtn = document.getElementById('closeAiModalBtn');
const aiPromptInput = document.getElementById('aiPromptInput');
const aiSubmitBtn = document.getElementById('aiSubmitBtn');
const aiResultContainer = document.getElementById('aiResultContainer');
const aiCodePreview = document.getElementById('aiCodePreview');
const aiAcceptBtn = document.getElementById('aiAcceptBtn');
const aiRejectBtn = document.getElementById('aiRejectBtn');
const aiLoading = document.getElementById('aiLoading');

// Chat Elements
const chatHistory = document.getElementById('chatHistory');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const chatClearBtn = document.getElementById('chatClearBtn');
const chatExportPdfBtn = document.getElementById('chatExportPdfBtn');
const chatExportTxtBtn = document.getElementById('chatExportTxtBtn');

// File View Modal Elements
const fileViewModal = document.getElementById('fileViewModal');
const closeFileViewBtn = document.getElementById('closeFileViewBtn');
const viewFileName = document.getElementById('viewFileName');
const viewFileDescription = document.getElementById('viewFileDescription');
const viewFileCode = document.getElementById('viewFileCode');
const downloadFileBtn = document.getElementById('downloadFileBtn');

// New Elements for Folders & Encryption
const createFileBtn = document.getElementById('createFileBtn');
const createFolderBtn = document.getElementById('createFolderBtn');
const moveSelectedBtn = document.getElementById('moveSelectedBtn');
const breadcrumbDiv = document.getElementById('breadcrumb');
const filePasswordInput = document.getElementById('filePassword');
const changeFolderPassBtn = document.getElementById('changeFolderPassBtn');
const folderPassInput = document.getElementById('folderPassInput');

// Wallpaper Elements
const wallpaperUrlInput = document.getElementById('wallpaperUrlInput');
const wallpaperFileInput = document.getElementById('wallpaperFileInput');
const wallpaperEffectSelect = document.getElementById('wallpaperEffectSelect');
const wallpaperBlurRange = document.getElementById('wallpaperBlurRange');
const wallpaperBlurValue = document.getElementById('wallpaperBlurValue');
const wallpaperTransparentCheckbox = document.getElementById('wallpaperTransparentCheckbox');
const wallpaperOpacityRange = document.getElementById('wallpaperOpacityRange');
const wallpaperOpacityValue = document.getElementById('wallpaperOpacityValue');
const wallpaperOpacityGroup = document.getElementById('wallpaperOpacityGroup');

// State for editing
let editingFile = null; // { path: string, sha: string }
let currentViewFile = null; // { name: string, content: string }
let allFiles = []; // Store all files for searching
let currentPath = ''; // Current folder path
let selectedFiles = new Set(); // Selected files for moving
let currentViewMode = localStorage.getItem('viewMode') || 'list'; // 'list' or 'grid'

// Folder Security
const DEFAULT_FOLDER_PASS = '0000';
function getFolderPassword() {
    return localStorage.getItem('folder_password') || DEFAULT_FOLDER_PASS;
}
function setFolderPassword(pass) {
    localStorage.setItem('folder_password', pass);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('App Initialized');
    initWallpaper();
    setupEventListeners();
    loadTheme();
    updateViewToggleButtons(); // Set initial state of buttons
    
    // Check for token
    if (CONFIG.token) {
        // If on repository page, fetch files
        if (savedCodesDiv) {
            fetchFromGitHub();
        }
    } else {
        // Only show status if statusDiv exists (it might not on all pages)
        if (statusDiv) showStatus('⚠️ Please configure your GitHub Token', 'info');
    }

    // Check for URL parameters (for redirect from repository page)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'edit') {
        const path = urlParams.get('path');
        const sha = urlParams.get('sha');
        const url = urlParams.get('url');
        
        // Set currentPath based on the file path
        if (path.includes('/')) {
            currentPath = path.substring(0, path.lastIndexOf('/') + 1);
        } else {
            currentPath = '';
        }
        
        if (path && sha) {
            // Remove params from URL without refreshing
            window.history.replaceState({}, document.title, window.location.pathname);
            // Trigger edit
            editFile(url, path, sha);
        }
    }
});

// Setup event listeners
function setupEventListeners() {
    if (saveBtn) saveBtn.addEventListener('click', saveToGitHub);
    if (clearBtn) clearBtn.addEventListener('click', clearForm);
    if (loadBtn) loadBtn.addEventListener('click', fetchFromGitHub);
    if (themeSelect) themeSelect.addEventListener('change', changeTheme);
    
    // Settings Modal
    if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);
    if (saveTokenBtn) saveTokenBtn.addEventListener('click', saveSettings);
    if (createRepoBtn) createRepoBtn.addEventListener('click', createRepository);
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettings();
        }
        if (fileViewModal && e.target === fileViewModal) {
            fileViewModal.style.display = 'none';
        }
        if (aiModal && e.target === aiModal) {
            aiModal.style.display = 'none';
        }
    });

    // AI Modal
    if (aiGenerateBtn) aiGenerateBtn.addEventListener('click', openAiModal);
    if (closeAiModalBtn) closeAiModalBtn.addEventListener('click', () => aiModal.style.display = 'none');
    if (aiSubmitBtn) aiSubmitBtn.addEventListener('click', generateAiCode);
    if (aiAcceptBtn) aiAcceptBtn.addEventListener('click', acceptAiCode);
    if (aiRejectBtn) aiRejectBtn.addEventListener('click', () => {
        aiResultContainer.style.display = 'none';
        aiPromptInput.value = '';
    });

    // File View Modal
    if (closeFileViewBtn) {
        closeFileViewBtn.addEventListener('click', () => {
            fileViewModal.style.display = 'none';
        });
    }
    
    if (downloadFileBtn) downloadFileBtn.addEventListener('click', downloadCurrentFile);

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterFiles(e.target.value);
        });
    }

    // Custom Select Logic
    setupCustomSelect();

    // Font Size Logic
    setupFontSize();

    // Prevent tab key from leaving textarea
    if (codeTextarea) codeTextarea.addEventListener('keydown', handleTabKey);

    // Chat Page Listeners
    if (chatSendBtn) chatSendBtn.addEventListener('click', sendChatMessage);
    if (chatClearBtn) chatClearBtn.addEventListener('click', clearChatHistory);
    if (chatExportPdfBtn) chatExportPdfBtn.addEventListener('click', exportChatToPDF);
    if (chatExportTxtBtn) chatExportTxtBtn.addEventListener('click', exportChatToText);
    if (chatInput) {
        // Auto-resize textarea
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }
    
    // Load chat history if on chat page
    if (chatHistory) loadChatHistory();

    // Folder & Move Listeners
    if (createFileBtn) createFileBtn.addEventListener('click', createNewFile);
    if (createFolderBtn) createFolderBtn.addEventListener('click', createNewFolder);
    if (moveSelectedBtn) moveSelectedBtn.addEventListener('click', moveSelectedFiles);
    if (changeFolderPassBtn) changeFolderPassBtn.addEventListener('click', changeFolderPassword);

    // Wallpaper Listeners
    if (wallpaperUrlInput) wallpaperUrlInput.addEventListener('input', saveWallpaperSettings);
    if (wallpaperEffectSelect) {
        wallpaperEffectSelect.addEventListener('change', () => {
            saveWallpaperSettings();
            if (wallpaperBlurRange && wallpaperBlurRange.parentElement) {
                wallpaperBlurRange.parentElement.style.display = wallpaperEffectSelect.value === 'blur' ? 'flex' : 'none';
            }
        });
    }
    if (wallpaperBlurRange) {
        wallpaperBlurRange.addEventListener('input', () => {
            if (wallpaperBlurValue) wallpaperBlurValue.textContent = wallpaperBlurRange.value + 'px';
            saveWallpaperSettings();
        });
    }

    // View Switcher Listeners
    const listViewBtn = document.getElementById('listViewBtn');
    const gridViewBtn = document.getElementById('gridViewBtn');
    if (listViewBtn) listViewBtn.addEventListener('click', () => setViewMode('list'));
    if (gridViewBtn) gridViewBtn.addEventListener('click', () => setViewMode('grid'));

    // Full Screen Toggle
    const fullScreenBtn = document.getElementById('fullScreenBtn');
    const codeEditorContainer = document.getElementById('codeEditorContainer');
    
    if (fullScreenBtn && codeEditorContainer) {
        fullScreenBtn.addEventListener('click', () => {
            codeEditorContainer.classList.toggle('code-fullscreen');
            const isFullScreen = codeEditorContainer.classList.contains('code-fullscreen');
            
            // Update Icon
            if (isFullScreen) {
                fullScreenBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>';
                fullScreenBtn.title = "Exit Full Screen";
            } else {
                fullScreenBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
                fullScreenBtn.title = "Toggle Full Screen";
            }
        });
        
        // Exit full screen on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && codeEditorContainer.classList.contains('code-fullscreen')) {
                fullScreenBtn.click();
            }
        });
    }
}

function setViewMode(mode) {
    currentViewMode = mode;
    localStorage.setItem('viewMode', mode);
    updateViewToggleButtons();
    renderFileList();
}

function updateViewToggleButtons() {
    const listViewBtn = document.getElementById('listViewBtn');
    const gridViewBtn = document.getElementById('gridViewBtn');
    if (!listViewBtn || !gridViewBtn) return;

    if (currentViewMode === 'list') {
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    } else {
        listViewBtn.classList.remove('active');
        gridViewBtn.classList.add('active');
    }
}

function setupFontSize() {
    const fontSizeDisplay = document.getElementById('fontSizeDisplay');
    const increaseFontBtn = document.getElementById('increaseFontBtn');
    const decreaseFontBtn = document.getElementById('decreaseFontBtn');
    
    let currentFontSize = parseInt(localStorage.getItem('fontSize')) || 14;

    function updateFontSize() {
        document.body.style.fontSize = `${currentFontSize}px`;
        fontSizeDisplay.textContent = `${currentFontSize}px`;
        localStorage.setItem('fontSize', currentFontSize);
    }

    // Initialize
    updateFontSize();

    increaseFontBtn.addEventListener('click', () => {
        if (currentFontSize < 32) {
            currentFontSize += 2;
            updateFontSize();
        }
    });

    decreaseFontBtn.addEventListener('click', () => {
        if (currentFontSize > 10) {
            currentFontSize -= 2;
            updateFontSize();
        }
    });
}

function setupCustomSelect() {
    const customSelect = document.getElementById('customLanguageSelect');
    if (!customSelect) return;

    const trigger = customSelect.querySelector('.custom-select-trigger');
    const options = customSelect.querySelectorAll('.custom-option');
    const hiddenInput = document.getElementById('language');

    // Load saved language
    const savedLanguage = localStorage.getItem('preferred_language');
    if (savedLanguage) {
        const savedOption = Array.from(options).find(opt => opt.getAttribute('data-value') === savedLanguage);
        if (savedOption) {
            trigger.innerHTML = savedOption.innerHTML;
            hiddenInput.value = savedLanguage;
            options.forEach(opt => opt.classList.remove('selected'));
            savedOption.classList.add('selected');
        }
    }

    // Toggle dropdown
    trigger.addEventListener('click', () => {
        customSelect.classList.toggle('open');
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('open');
        }
    });

    // Handle option selection
    options.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            const html = option.innerHTML;
            
            // Update trigger
            trigger.innerHTML = html;
            
            // Update hidden input
            hiddenInput.value = value;
            
            // Save to localStorage
            localStorage.setItem('preferred_language', value);
            
            // Update selected class
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            // Close dropdown
            customSelect.classList.remove('open');
        });
    });
}

function openSettings() {
    tokenInput.value = CONFIG.token || '';
    if (usernameInput) usernameInput.value = CONFIG.owner || '';
    if (repoInput) repoInput.value = CONFIG.repo || '';
    
    // Hide AI Key input if default is present
    if (typeof DEFAULT_AI_KEY !== 'undefined' && DEFAULT_AI_KEY) {
        if (aiKeyInput) {
            aiKeyInput.parentElement.style.display = 'none';
        }
    } else {
        if (aiKeyInput) {
            aiKeyInput.value = localStorage.getItem('ai_api_key') || '';
            aiKeyInput.parentElement.style.display = 'block';
        }
    }
    
    settingsModal.style.display = 'block';
}

function closeSettings() {
    settingsModal.style.display = 'none';
}

function saveSettings() {
    const token = tokenInput.value.trim();
    const username = usernameInput ? usernameInput.value.trim() : '';
    const repo = repoInput ? repoInput.value.trim() : '';
    const aiKey = aiKeyInput ? aiKeyInput.value.trim() : '';

    if (token && username && repo) {
        localStorage.setItem('github_token', token);
        localStorage.setItem('github_username', username);
        localStorage.setItem('github_repo', repo);
        if (aiKey) localStorage.setItem('ai_api_key', aiKey);
        
        showStatus('✅ Configuration saved successfully', 'success');
        closeSettings();
        if (typeof fetchFromGitHub === 'function') {
            fetchFromGitHub();
        }
    } else {
        alert('Please fill in all fields (Token, Username, Repository)');
    }
}

// AI Functions
function openAiModal() {
    // Check for default key first, then local storage
    const key = (typeof DEFAULT_AI_KEY !== 'undefined' && DEFAULT_AI_KEY) ? DEFAULT_AI_KEY : localStorage.getItem('ai_api_key');
    
    if (!key) {
        alert('Please configure your AI API Key in Settings first.');
        openSettings();
        return;
    }
    aiModal.style.display = 'block';
    aiPromptInput.focus();
}

async function generateAiCode() {
    const prompt = aiPromptInput.value.trim();
    const key = (typeof DEFAULT_AI_KEY !== 'undefined' && DEFAULT_AI_KEY) ? DEFAULT_AI_KEY : localStorage.getItem('ai_api_key');
    
    if (!prompt) return;
    
    aiLoading.style.display = 'block';
    aiResultContainer.style.display = 'none';
    aiSubmitBtn.disabled = true;

    try {
        // Use OpenRouter API (Free Models)
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
                'HTTP-Referer': window.location.href, // Required by OpenRouter
                'X-Title': 'Code Syncer'
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.3-70b-instruct:free",
                messages: [
                    {
                        role: "system", 
                        content: "You are an expert coding assistant. Return ONLY the code requested. Do not include markdown backticks (```) or explanations unless asked in comments."
                    },
                    {
                        role: "user", 
                        content: prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'API Error');
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Invalid AI Response:', data);
            throw new Error('Received invalid response from AI provider. Please try again.');
        }

        let code = data.choices[0].message.content;
        
        // Clean up markdown if present
        code = code.replace(/^```\w*\n/, '').replace(/\n```$/, '');

        aiCodePreview.textContent = code;
        aiResultContainer.style.display = 'flex';

    } catch (error) {
        console.error(error);
        alert('AI Generation Failed: ' + error.message);
    } finally {
        aiLoading.style.display = 'none';
        aiSubmitBtn.disabled = false;
    }
}

function acceptAiCode() {
    const code = aiCodePreview.textContent;
    if (codeTextarea) {
        // Insert at cursor or append
        const start = codeTextarea.selectionStart;
        const end = codeTextarea.selectionEnd;
        const text = codeTextarea.value;
        
        if (start || start === 0) {
            codeTextarea.value = text.substring(0, start) + code + text.substring(end);
        } else {
            codeTextarea.value += code;
        }
        
        // Trigger input event to resize if needed
        codeTextarea.dispatchEvent(new Event('input'));
    }
    aiModal.style.display = 'none';
    aiPromptInput.value = '';
    aiResultContainer.style.display = 'none';
    showStatus('✨ Code inserted!', 'success');
}

async function createRepository() {
    const token = tokenInput.value.trim();
    const repoName = repoInput.value.trim();

    if (!token) {
        alert('Please enter your GitHub Token first');
        return;
    }
    if (!repoName) {
        alert('Please enter a Repository Name');
        return;
    }

    createRepoBtn.disabled = true;
    createRepoBtn.textContent = 'Creating...';

    try {
        const response = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                name: repoName,
                private: false, // Default to public, user can change later
                auto_init: true, // Create README so we have a main branch
                description: 'Created via Code Syncer'
            })
        });

        if (response.status === 201) {
            alert(`✅ Repository "${repoName}" created successfully!`);
            // Auto-fill username if empty (we can get it from the response owner.login)
            const data = await response.json();
            if (usernameInput && !usernameInput.value) {
                usernameInput.value = data.owner.login;
            }
            saveSettings(); // Save the new config
        } else if (response.status === 422) {
            alert('❌ Repository already exists or name is invalid.');
        } else {
            const error = await response.json();
            alert(`❌ Error: ${error.message}`);
        }
    } catch (error) {
        console.error(error);
        alert('❌ Network Error');
    } finally {
        createRepoBtn.disabled = false;
        createRepoBtn.textContent = 'Create Repo';
    }
}


// Theme Handling
function changeTheme() {
    document.documentElement.className = themeSelect.value;
    localStorage.setItem('theme', themeSelect.value);
    // Re-apply wallpaper transparency if active, as theme change resets variables
    if (typeof loadAndApplyWallpaper === 'function') {
        loadAndApplyWallpaper();
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.className = savedTheme;
        themeSelect.value = savedTheme;
    }
}

// Handle tab key in textarea
function handleTabKey(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const value = this.value;
        this.value = value.substring(0, start) + '\t' + value.substring(end);
        this.selectionStart = this.selectionEnd = start + 1;
    }
}

// Clear form
function clearForm() {
    if (confirm('Clear all fields?')) {
        resetForm();
        showStatus('Form cleared', 'info');
    }
}

function resetForm() {
    codeTitleInput.value = '';
    codeTextarea.value = '';
    descriptionTextarea.value = '';
    editingFile = null;
    saveBtn.textContent = 'Save to GitHub';
    codeTitleInput.disabled = false;
    
    // Hide delete button (only shown during edit)
    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn) {
        deleteBtn.style.display = 'none';
    }
    
    // Re-enable language selector
    if (document.getElementById('customLanguageSelect')) {
        document.getElementById('customLanguageSelect').style.pointerEvents = 'auto';
        document.getElementById('customLanguageSelect').style.opacity = '1';
    }
    
    // Reset language to saved preference or default to python
    const savedLanguage = localStorage.getItem('preferred_language') || 'python';
    document.getElementById('language').value = savedLanguage;
    const customSelect = document.getElementById('customLanguageSelect');
    const trigger = customSelect.querySelector('.custom-select-trigger');
    const defaultOption = customSelect.querySelector(`[data-value="${savedLanguage}"]`);
    if (defaultOption) {
        trigger.innerHTML = defaultOption.innerHTML;
        customSelect.querySelectorAll('.custom-option').forEach(o => o.classList.remove('selected'));
        defaultOption.classList.add('selected');
    }
}

// Save code to GitHub
async function saveToGitHub() {
    const token = CONFIG.token;
    const code = codeTextarea.value;
    let title = codeTitleInput.value.trim() || 'untitled';
    const language = languageSelect.value;
    const description = descriptionTextarea.value.trim();

    if (!token) {
        showStatus('❌ GitHub Token is missing in configuration', 'error');
        return;
    }
    if (!code) {
        showStatus('❌ Please enter some code', 'error');
        return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Processing...';

    try {
        let path, message, sha;

        if (editingFile) {
            // Updating existing file - keep it in the same folder
            path = editingFile.path;
            sha = editingFile.sha;
            message = `Update ${path}`;
            
            // Extract the original filename from path for metadata
            title = path.split('/').pop();
        } else {
            // Creating new file
            const ext = getExtension(language);
            // If title doesn't have extension, add it
            if (!title.endsWith(ext)) {
                // If user didn't provide extension, we might want to add timestamp to avoid collisions
                // But for "Hacker" feel, let's trust the user's filename or add one if missing
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const safeTitle = title.replace(/[^a-zA-Z0-9-_]/g, '_');
                title = `${safeTitle}_${timestamp}${ext}`;
            }
            
            // If we are inside a folder (currentPath is set), save the file there
            // Otherwise, save it in the language folder as before
            if (currentPath) {
                path = `${currentPath}${title}`;
            } else {
                path = `${language}/${title}`;
            }
            
            message = `Add ${language} snippet: ${title}`;
        }
        
        // Create file content with metadata header
        let fileContent = `/*
Title: ${title}
Description: ${description}
Date: ${new Date().toLocaleString()}
*/

${code}`;

        // Handle Encryption
        const password = filePasswordInput ? filePasswordInput.value : '';
        if (password) {
            try {
                const encrypted = CryptoJS.AES.encrypt(fileContent, password).toString();
                fileContent = `/* ENCRYPTED */\n${encrypted}`;
                message += ' (Encrypted)';
            } catch (e) {
                console.error('Encryption failed', e);
                throw new Error('Encryption failed');
            }
        }

        // Base64 encode content (required by GitHub API)
        const contentEncoded = btoa(unescape(encodeURIComponent(fileContent)));

        const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`;
        
        const body = {
            message: message,
            content: contentEncoded
        };

        if (sha) {
            body.sha = sha;
        }

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        showStatus(`✅ Saved to ${path}`, 'success');
        resetForm();
        fetchFromGitHub(); // Refresh list

    } catch (error) {
        console.error(error);
        showStatus('❌ Error: ' + error.message, 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save to GitHub';
    }
}

// Fetch files from GitHub
async function fetchFromGitHub() {
    if (!savedCodesDiv) return;

    const token = CONFIG.token;
    if (!token) {
        showStatus('❌ GitHub Token is missing in configuration', 'error');
        return;
    }

    loadBtn.disabled = true;
    loadBtn.textContent = '...';
    savedCodesDiv.innerHTML = '<div class="loading-spinner">Scanning repository...</div>';

    try {
        // 1. Get all files recursively using the Git Tree API (more efficient)
        const repoUrl = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}`;
        const repoResponse = await fetch(repoUrl, {
            headers: { 'Authorization': `token ${token}` }
        });
        const repoData = await repoResponse.json();
        const defaultBranch = repoData.default_branch;

        const treeUrl = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/git/trees/${defaultBranch}?recursive=1`;
        const treeResponse = await fetch(treeUrl, {
            headers: { 'Authorization': `token ${token}` }
        });
        
        if (treeResponse.status === 404) {
            // Repository is empty or branch doesn't exist yet
            savedCodesDiv.innerHTML = '<p class="empty-message">Repository is empty (No commits yet)</p>';
            showStatus('✅ System Online: Repository ready', 'success');
            return;
        }

        if (!treeResponse.ok) throw new Error('Failed to fetch repository tree');
        
        const treeData = await treeResponse.json();
        
        const files = treeData.tree.filter(item => item.type === 'blob');
        
        // Sort files: folders first (if we were getting tree objects), then files
        // But here we only have blobs. We need to process them into a structure.
        files.sort((a, b) => a.path.localeCompare(b.path)); 

        allFiles = files; // Save for searching
        renderFileList(); // Use new render function
        showStatus(`✅ System Online: ${files.length} files loaded`, 'success');

    } catch (error) {
        console.error(error);
        savedCodesDiv.innerHTML = '<p class="empty-message">Connection Failed</p>';
        showStatus('❌ Error: ' + error.message, 'error');
    } finally {
        loadBtn.disabled = false;
        loadBtn.textContent = 'Refresh';
    }
}

// Render File List (Supports Folders & Views)
function renderFileList() {
    if (!savedCodesDiv) return;
    savedCodesDiv.innerHTML = '';
    selectedFiles.clear();
    updateMoveButton();

    // Update Breadcrumb
    updateBreadcrumb();

    // Set View Mode Class
    if (currentViewMode === 'grid') {
        savedCodesDiv.classList.add('grid-view');
    } else {
        savedCodesDiv.classList.remove('grid-view');
    }

    // Filter files by current path
    const items = new Map(); // Use Map to deduplicate folders

    allFiles.forEach(file => {
        if (file.path.startsWith(currentPath)) {
            const relativePath = file.path.slice(currentPath.length);
            const parts = relativePath.split('/');
            
            if (parts.length > 0 && parts[0] !== '') {
                const name = parts[0];
                const isFolder = parts.length > 1;
                
                if (!items.has(name)) {
                    items.set(name, {
                        name: name,
                        path: currentPath + name + (isFolder ? '/' : ''),
                        type: isFolder ? 'folder' : 'file',
                        fileData: isFolder ? null : file
                    });
                } else if (isFolder) {
                    items.get(name).type = 'folder';
                    items.get(name).path = currentPath + name + '/';
                }
            }
        }
    });

    const sortedItems = Array.from(items.values()).sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
    });

    if (sortedItems.length === 0) {
        savedCodesDiv.innerHTML = '<p class="empty-message">Folder is empty</p>';
        return;
    }

    sortedItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'code-item';
        const menuId = `menu-${Math.random().toString(36).substr(2, 9)}`;
        
        if (item.type === 'folder') {
            if (currentViewMode === 'grid') {
                div.innerHTML = `
                    <div class="grid-item-content">
                        <div class="grid-icon" onclick="enterFolder('${item.name}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <div class="grid-title" onclick="enterFolder('${item.name}')">${item.name}</div>
                        <div class="grid-actions">
                            <div class="menu-container">
                                <button class="menu-btn" onclick="toggleMenu('${menuId}', event)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                </button>
                                <div id="${menuId}" class="menu-dropdown">
                                    <button class="menu-item" onclick="renameItem('${item.name}', 'folder')">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        Rename
                                    </button>
                                    <button class="menu-item danger" onclick="deleteFolder('${item.name}')">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                div.innerHTML = `
                    <div class="code-item-header">
                        <div class="code-item-title" style="display: flex; align-items: center; gap: 10px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                            <h3 onclick="enterFolder('${item.name}')" class="clickable-title">${item.name}</h3>
                        </div>
                        <div class="code-item-actions-right">
                            <div class="menu-container">
                                <button class="menu-btn" onclick="toggleMenu('${menuId}', event)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                </button>
                                <div id="${menuId}" class="menu-dropdown">
                                    <button class="menu-item" onclick="renameItem('${item.name}', 'folder')">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        Rename
                                    </button>
                                    <button class="menu-item danger" onclick="deleteFolder('${item.name}')">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        } else {
            const file = item.fileData;
            const safePath = file.path.replace(/'/g, "\\'");
            
            if (currentViewMode === 'grid') {
                const ext = '.' + file.path.split('.').pop();
                let iconClass = 'devicon-python-plain'; // Default
                // Simple mapping
                const map = {
                    '.js': 'devicon-javascript-plain',
                    '.html': 'devicon-html5-plain',
                    '.css': 'devicon-css3-plain',
                    '.java': 'devicon-java-plain',
                    '.py': 'devicon-python-plain',
                    '.cpp': 'devicon-cplusplus-plain',
                    '.c': 'devicon-c-plain',
                    '.cs': 'devicon-csharp-plain',
                    '.go': 'devicon-go-plain',
                    '.rs': 'devicon-rust-plain',
                    '.php': 'devicon-php-plain',
                    '.rb': 'devicon-ruby-plain',
                    '.ts': 'devicon-typescript-plain',
                    '.sql': 'devicon-mysql-plain',
                    '.json': 'devicon-json-plain',
                    '.md': 'devicon-markdown-original'
                };
                if (map[ext]) iconClass = map[ext];

                div.innerHTML = `
                    <div class="grid-item-content">
                        <div class="grid-checkbox">
                             <input type="checkbox" class="file-select-checkbox" data-path="${safePath}" onchange="toggleFileSelection('${safePath}')">
                        </div>
                        <div class="grid-icon" onclick="viewFile('${file.url}', '${file.sha}')">
                            <i class="${iconClass}" style="font-size: 3rem;"></i>
                        </div>
                        <div class="grid-title" onclick="viewFile('${file.url}', '${file.sha}')">${item.name}</div>
                        <div class="grid-actions">
                            <div class="menu-container">
                                <button class="menu-btn" onclick="toggleMenu('${menuId}', event)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                </button>
                                <div id="${menuId}" class="menu-dropdown">
                                    <button class="menu-item" onclick="editFile('${file.url}', '${safePath}', '${file.sha}')">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        Edit Content
                                    </button>
                                    <button class="menu-item" onclick="renameItem('${item.name}', 'file')">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        Rename
                                    </button>
                                    <button class="menu-item danger" onclick="deleteFile('${safePath}', '${file.sha}', true)">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                div.innerHTML = `
                    <div class="code-item-header">
                        <div class="code-item-actions-left" style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" class="file-select-checkbox" data-path="${safePath}" onchange="toggleFileSelection('${safePath}')">
                        </div>
                        <div class="code-item-title">
                            <h3 onclick="viewFile('${file.url}', '${file.sha}')" class="clickable-title">${item.name}</h3>
                        </div>
                        <div class="code-item-actions-right">
                            <div class="menu-container">
                                <button class="menu-btn" onclick="toggleMenu('${menuId}', event)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                </button>
                                <div id="${menuId}" class="menu-dropdown">
                                    <button class="menu-item" onclick="editFile('${file.url}', '${safePath}', '${file.sha}')">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        Edit Content
                                    </button>
                                    <button class="menu-item" onclick="renameItem('${item.name}', 'file')">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        Rename
                                    </button>
                                    <button class="menu-item danger" onclick="deleteFile('${safePath}', '${file.sha}', true)">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        savedCodesDiv.appendChild(div);
    });
}

function enterFolder(folderName) {
    currentPath += folderName + '/';
    renderFileList();
}

function updateBreadcrumb() {
    if (!breadcrumbDiv) return;
    
    const parts = currentPath.split('/').filter(p => p);
    let html = '<span class="breadcrumb-item" onclick="navigateToRoot()" style="cursor: pointer;">root</span>';
    
    let buildPath = '';
    parts.forEach((part, index) => {
        buildPath += part + '/';
        html += ` <span class="separator">/</span> <span class="breadcrumb-item" onclick="navigateToPath('${buildPath}')" style="cursor: pointer;">${part}</span>`;
    });
    
    breadcrumbDiv.innerHTML = html;
}

function navigateToRoot() {
    currentPath = '';
    renderFileList();
}

function navigateToPath(path) {
    currentPath = path;
    renderFileList();
}

function toggleFileSelection(path) {
    if (selectedFiles.has(path)) {
        selectedFiles.delete(path);
    } else {
        selectedFiles.add(path);
    }
    updateMoveButton();
}

function updateMoveButton() {
    if (moveSelectedBtn) {
        moveSelectedBtn.style.display = selectedFiles.size > 0 ? 'inline-block' : 'none';
        moveSelectedBtn.textContent = `Move Selected (${selectedFiles.size})`;
    }
}

async function createNewFile() {
    const fileName = prompt("Enter file name (with extension):");
    if (!fileName) return;
    
    const fileContent = prompt("Enter initial content (optional):") || '';
    
    const path = currentPath + fileName;
    const content = btoa(fileContent);
    
    try {
        const encodedPath = encodePath(path);
        const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${encodedPath}`;
        
        showStatus(`Creating file ${fileName}...`, 'info');
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${CONFIG.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Create ${fileName}`,
                content: content
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to create file');
        }

        showStatus(`✅ File created successfully!`, 'success');
        setTimeout(fetchFromGitHub, 500);
    } catch (error) {
        showStatus('❌ Failed to create file: ' + error.message, 'error');
        console.error(error);
    }
}

async function createNewFolder() {
    // Security Check
    const code = prompt("Enter folder security code:");
    if (code !== getFolderPassword()) {
        alert("Incorrect security code!");
        return;
    }

    const folderName = prompt("Enter new folder name:");
    if (!folderName) return;
    
    // Create a .gitkeep file to establish the folder
    const path = currentPath + folderName + '/.gitkeep';
    const content = btoa('Folder created');
    
    try {
        // Use encodePath to handle spaces and special characters
        const encodedPath = encodePath(path);
        const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${encodedPath}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${CONFIG.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Create folder ${folderName}`,
                content: content
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to create folder');
        }
        
        showStatus('✅ Folder created', 'success');
        setTimeout(fetchFromGitHub, 500); // Small delay for API consistency
    } catch (error) {
        console.error(error);
        showStatus(`❌ Error creating folder: ${error.message}`, 'error');
    }
}

async function moveSelectedFiles() {
    const targetFolder = prompt("Enter destination folder path (e.g., 'myfolder/' or leave empty for root):");
    if (targetFolder === null) return;
    
    const destPath = targetFolder.trim();
    // Ensure trailing slash if not empty
    const finalDest = (destPath && !destPath.endsWith('/')) ? destPath + '/' : destPath;
    
    showStatus(`Moving ${selectedFiles.size} files...`, 'info');
    
    for (const filePath of selectedFiles) {
        try {
            // 1. Get file content
            const file = allFiles.find(f => f.path === filePath);
            if (!file) continue;
            
            const contentsUrl = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${encodePath(filePath)}`;
            const getRes = await fetch(contentsUrl, {
                headers: { 'Authorization': `token ${CONFIG.token}` }
            });
            const getData = await getRes.json();
            
            // 2. Create new file
            const fileName = filePath.split('/').pop();
            const newPath = finalDest + fileName;
            
            // Don't move if path is same
            if (newPath === filePath) continue;

            const putUrl = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${encodePath(newPath)}`;
            await fetch(putUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${CONFIG.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Move ${fileName} to ${finalDest}`,
                    content: getData.content,
                    sha: undefined // New file
                })
            });
            
            // 3. Delete old file
            const delUrl = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${encodePath(filePath)}`;
            await fetch(delUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${CONFIG.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Moved to ${newPath}`,
                    sha: file.sha
                })
            });
            
        } catch (error) {
            console.error(`Failed to move ${filePath}`, error);
        }
    }
    
    showStatus('✅ Move completed', 'success');
    selectedFiles.clear();
    fetchFromGitHub();
}

function encodePath(path) {
    return path.split('/').map(encodeURIComponent).join('/');
}

// Filter files based on search
function filterFiles(searchTerm) {
    if (!searchTerm) {
        renderFileList(); // Reset to current folder view
        return;
    }
    
    const term = searchTerm.toLowerCase();
    // When searching, show flat list of matches
    const filtered = allFiles.filter(file => 
        file.path.toLowerCase().includes(term)
    );
    
    // Simple render for search results
    savedCodesDiv.innerHTML = '';
    filtered.forEach(file => {
        const div = document.createElement('div');
        div.className = 'code-item';
        const safePath = file.path.replace(/'/g, "\\'");
        div.innerHTML = `
            <div class="code-item-header">
                <div class="code-item-title">
                    <h3 onclick="viewFile('${file.url}', '${file.sha}')" class="clickable-title">${file.path}</h3>
                </div>
                <div class="code-item-actions-right">
                     <button class="btn-small" title="Edit" onclick="editFile('${file.url}', '${safePath}', '${file.sha}')">Edit</button>
                </div>
            </div>
        `;
        savedCodesDiv.appendChild(div);
    });
}

// Display files list (Deprecated, replaced by renderFileList)
function displayFiles(files) {
    // Kept for compatibility if called elsewhere, but redirects to renderFileList
    allFiles = files;
    renderFileList();
}

// Edit File
async function editFile(url, path, sha) {
    // Check if we are on the editor page
    if (!codeTextarea) {
        // We are likely on repository.html, redirect to index.html with params
        const params = new URLSearchParams({
            action: 'edit',
            path: path,
            sha: sha,
            url: url // Pass the blob url too just in case, though we construct contents url from path now
        });
        window.location.href = `index.html?${params.toString()}`;
        return;
    }

    try {
        showStatus('Loading file for editing...', 'info');
        
        // Construct URL properly handling spaces and special characters
        // We use the contents API which is the standard way to read files
        const encodedPath = path.split('/').map(encodeURIComponent).join('/');
        const contentsUrl = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${encodedPath}`;
        
        console.log('Fetching file from:', contentsUrl);

        const response = await fetch(contentsUrl, {
            headers: { 
                'Authorization': `token ${CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(`GitHub API Error: ${response.status} ${errData.message || ''}`);
        }

        const data = await response.json();
        
        if (Array.isArray(data)) {
            throw new Error('This path is a folder, not a file. Cannot edit.');
        }
        
        // If the file is larger than 1MB, GitHub API returns a different structure without 'content'
        // We might need to fetch the blob using the SHA if content is missing but sha is present
        if (data.content === undefined && data.sha) {
             const blobUrl = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/git/blobs/${data.sha}`;
             const blobResponse = await fetch(blobUrl, {
                headers: { 'Authorization': `token ${CONFIG.token}` }
             });
             if (blobResponse.ok) {
                 const blobData = await blobResponse.json();
                 data.content = blobData.content;
             }
        }

        if (data.content === undefined || data.content === null) {
            throw new Error('File content is empty or not found in response');
        }

        // Clean base64 string (remove newlines) and decode
        const cleanContent = data.content.replace(/\n/g, '');
        let content;
        try {
            content = decodeURIComponent(escape(atob(cleanContent)));
        } catch (e) {
            console.warn('UTF-8 decoding failed, falling back to raw decode', e);
            content = atob(cleanContent);
        }

        // Check for encryption
        if (content.startsWith('/* ENCRYPTED */')) {
            if (typeof CryptoJS === 'undefined') {
                throw new Error('Encryption library not loaded. Please refresh the page.');
            }

            const password = prompt('This file is encrypted. Enter password to decrypt:');
            if (!password) {
                throw new Error('Password required to edit encrypted file');
            }
            
            try {
                // Remove marker and trim whitespace
                const encryptedData = content.replace('/* ENCRYPTED */', '').trim();
                const bytes = CryptoJS.AES.decrypt(encryptedData, password);
                const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                
                if (!decrypted) throw new Error('Wrong password or corrupted data');
                
                content = decrypted;
                // Pre-fill password field so they don't have to re-enter on save
                if (document.getElementById('filePassword')) {
                    document.getElementById('filePassword').value = password;
                }
            } catch (e) {
                console.error('Decryption error:', e);
                throw new Error('Decryption failed. Wrong password?');
            }
        }
        
        // Parse content to separate metadata if possible
        // Our format is /* ... */ \n code
        let code = content;
        let description = '';
        let title = path.split('/').pop(); // Default to filename
        
        // Simple parsing of our metadata format
        const metadataMatch = content.match(/^\/\*([\s\S]*?)\*\/\s*([\s\S]*)/);
        if (metadataMatch) {
            const metadata = metadataMatch[1];
            code = metadataMatch[2];
            
            const titleMatch = metadata.match(/Title: (.*)/);
            if (titleMatch) title = titleMatch[1].trim();
            
            const descMatch = metadata.match(/Description: (.*)/);
            if (descMatch) description = descMatch[1].trim();
        }

        // Populate form
        codeTextarea.value = code;
        codeTitleInput.value = title;
        descriptionTextarea.value = description;
        
        // Try to set language from path
        const ext = '.' + path.split('.').pop();
        for (const [lang, extension] of Object.entries(getExtensionMap())) {
            if (extension === ext) {
                // Update hidden input
                document.getElementById('language').value = lang;
                
                // Update custom select UI
                const customSelect = document.getElementById('customLanguageSelect');
                const options = customSelect.querySelectorAll('.custom-option');
                const trigger = customSelect.querySelector('.custom-select-trigger');
                
                options.forEach(opt => {
                    if (opt.getAttribute('data-value') === lang) {
                        opt.classList.add('selected');
                        trigger.innerHTML = opt.innerHTML;
                    } else {
                        opt.classList.remove('selected');
                    }
                });
                break;
            }
        }

        // Set editing state
        editingFile = { path, sha };
        
        // Update currentPath to match the file's location
        if (path.includes('/')) {
            currentPath = path.substring(0, path.lastIndexOf('/') + 1);
        } else {
            currentPath = '';
        }
        
        saveBtn.textContent = 'Update File';
        
        // Show delete button in editor
        const deleteBtn = document.getElementById('deleteBtn');
        if (deleteBtn) {
            deleteBtn.style.display = 'inline-block';
            deleteBtn.onclick = () => deleteFile(path, sha);
        }
        
        // Disable title and language fields during edit to prevent confusion
        // The file must be updated in its current location
        codeTitleInput.disabled = true;
        if (document.getElementById('customLanguageSelect')) {
            document.getElementById('customLanguageSelect').style.pointerEvents = 'none';
            document.getElementById('customLanguageSelect').style.opacity = '0.6';
        }

        showStatus(`Editing: ${path}`, 'success');
        
    } catch (error) {
        console.error(error);
        showStatus(`❌ Error loading file: ${error.message}`, 'error');
    }
}

// Delete File
async function deleteFile(path, sha, checkEncryption = false) {
    if (checkEncryption) {
        try {
            // Fetch file content to check for encryption
            const encodedPath = path.split('/').map(encodeURIComponent).join('/');
            const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${encodedPath}`;
            const response = await fetch(url, {
                headers: { 'Authorization': `token ${CONFIG.token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.content) {
                    const cleanContent = data.content.replace(/\n/g, '');
                    let content;
                    try {
                        content = decodeURIComponent(escape(atob(cleanContent)));
                    } catch (e) {
                        content = atob(cleanContent);
                    }
                    
                    if (content.startsWith('/* ENCRYPTED */')) {
                        alert('This file is encrypted. Please open the file to delete it.');
                        return;
                    }
                }
            }
        } catch (e) {
            console.error('Error checking encryption status', e);
            // If check fails, we might want to be safe and block, or allow. 
            // Let's allow but warn.
        }
    }

    if (!confirm(`Are you sure you want to DELETE ${path}? This cannot be undone.`)) {
        return;
    }

    try {
        const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${CONFIG.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Delete ${path}`,
                sha: sha
            })
        });

        if (!response.ok) {
            throw new Error('Failed to delete file');
        }

        showStatus(`🗑️ Deleted ${path}`, 'success');
        
        // If we are in editor or modal, redirect or close
        if (editingFile && editingFile.path === path) {
            resetForm();
            // If on index.html, maybe clear URL params?
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        if (document.getElementById('fileViewModal')) {
            document.getElementById('fileViewModal').style.display = 'none';
        }

        fetchFromGitHub(); // Refresh list

    } catch (error) {
        console.error(error);
        showStatus('❌ Error deleting file', 'error');
    }
}

// View file content
async function viewFile(url, sha) {
    try {
        showStatus('Loading file...', 'info');
        
        // Use the path to construct the contents URL (same as editFile)
        // Note: url param here is actually the path because we changed the call in displayFiles
        // But let's be safe and assume it might be the blob url or path. 
        // Actually, in displayFiles we pass file.url (blob) and file.path.
        // Let's assume 'url' passed here is the PATH if it doesn't look like a URL.
        
        let contentsUrl = url;
        if (!url.startsWith('http')) {
             // It's a path
             const encodedPath = url.split('/').map(encodeURIComponent).join('/');
             contentsUrl = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${encodedPath}`;
        } else {
            // It's a blob URL, but we prefer contents API for metadata
            // We can't easily derive path from blob URL without context
            // So we should rely on the caller passing the path.
            // In the previous fix, we changed the onclick to pass file.url (blob)
            // Let's revert to using the path for viewFile too.
        }

        // Wait, in displayFiles we have: onclick="viewFile('${file.url}', '${file.sha}')"
        // file.url is the BLOB url.
        // We should change displayFiles to pass the PATH.
        
        // For now, let's try to fetch whatever URL is passed. 
        // If it's a blob URL, it returns { content, encoding, ... }
        
        const response = await fetch(contentsUrl, {
            headers: { 'Authorization': `token ${CONFIG.token}` }
        });

        if (!response.ok) {
             const errData = await response.json().catch(() => ({}));
             throw new Error(`GitHub API Error: ${response.status} ${errData.message || ''}`);
        }

        const data = await response.json();
        
        if (!data.content) {
            throw new Error('File content is empty or too large');
        }
        
        // Decode content
        const cleanContent = data.content.replace(/\n/g, '');
        let content;
        try {
            content = decodeURIComponent(escape(atob(cleanContent)));
        } catch (e) {
            content = atob(cleanContent);
        }

        // Check for encryption
        if (content.startsWith('/* ENCRYPTED */')) {
            if (typeof CryptoJS === 'undefined') {
                throw new Error('Encryption library not loaded. Please refresh the page.');
            }

            const password = prompt('This file is encrypted. Enter password to view:');
            if (!password) {
                throw new Error('Password required to view encrypted file');
            }
            
            try {
                // Remove marker and trim whitespace
                const encryptedData = content.replace('/* ENCRYPTED */', '').trim();
                const bytes = CryptoJS.AES.decrypt(encryptedData, password);
                const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                
                if (!decrypted) throw new Error('Wrong password or corrupted data');
                
                content = decrypted;
            } catch (e) {
                console.error('Decryption error:', e);
                throw new Error('Decryption failed. Wrong password?');
            }
        }
        
        // Parse metadata
        let code = content;
        let description = '';
        let title = data.name;
        
        const metadataMatch = content.match(/^\/\*([\s\S]*?)\*\/\s*([\s\S]*)/);
        if (metadataMatch) {
            const metadata = metadataMatch[1];
            code = metadataMatch[2];
            
            const titleMatch = metadata.match(/Title: (.*)/);
            if (titleMatch) title = titleMatch[1].trim();
            
            const descMatch = metadata.match(/Description: (.*)/);
            if (descMatch) description = descMatch[1].trim();
        }

        // Populate Modal
        viewFileName.textContent = title;
        viewFileCode.textContent = code;
        
        if (description) {
            viewFileDescription.textContent = description;
            viewFileDescription.style.display = 'block';
        } else {
            viewFileDescription.style.display = 'none';
        }

        // Setup Delete Button in Modal
        const deleteViewFileBtn = document.getElementById('deleteViewFileBtn');
        if (deleteViewFileBtn) {
            // We need the path. 'url' param might be path or blob url.
            // In viewFile we tried to determine contentsUrl.
            // Let's try to extract path from contentsUrl or use title if it matches
            // Best way is to pass path to viewFile, but for now let's rely on what we have.
            // Actually, we can use 'data.path' from the API response!
            const filePath = data.path;
            const fileSha = data.sha;
            
            deleteViewFileBtn.onclick = () => deleteFile(filePath, fileSha);
            deleteViewFileBtn.style.display = 'inline-block';
        }

        // Store for download
        currentViewFile = {
            name: title,
            content: content // Download the full content including metadata
        };

        // Show Modal
        fileViewModal.style.display = 'block';
        showStatus('✅ File loaded', 'success');
        
    } catch (error) {
        console.error(error);
        showStatus(`❌ Error loading file content: ${error.message}`, 'error');
    }
}

function downloadCurrentFile() {
    if (!currentViewFile) return;
    
    const blob = new Blob([currentViewFile.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentViewFile.name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showStatus('⬇️ Download started', 'success');
}

function copyToClipboard(btn) {
    const text = btn.previousElementSibling.textContent;
    navigator.clipboard.writeText(text);
    const original = btn.textContent;
    btn.textContent = '✅ Copied';
    setTimeout(() => btn.textContent = original, 2000);
}

// Helper: Get file extension
function getExtension(lang) {
    return getExtensionMap()[lang] || '.txt';
}

function getExtensionMap() {
    return {
        'python': '.py', 'java': '.java', 'javascript': '.js', 'cpp': '.cpp',
        'csharp': '.cs', 'go': '.go', 'rust': '.rs', 'php': '.php',
        'ruby': '.rb', 'swift': '.swift', 'kotlin': '.kt', 'typescript': '.ts',
        'sql': '.sql', 'html': '.html', 'css': '.css'
    };
}

// Helper: Show status
function showStatus(msg, type) {
    if (!statusDiv) return;
    statusDiv.textContent = msg;
    statusDiv.className = `status-message ${type}`;
    statusDiv.style.display = 'block';
    setTimeout(() => statusDiv.style.display = 'none', 5000);
}

// Helper: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Chat Functionality
function loadChatHistory() {
    const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
    chatHistory.innerHTML = ''; // Clear current
    
    // Add welcome message if empty
    if (history.length === 0) {
        chatHistory.innerHTML = `
            <div class="chat-welcome" style="text-align: center; opacity: 0.7; margin-top: 50px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/></svg>
                <p>Start a conversation with the AI...</p>
            </div>
        `;
        return;
    }

    history.forEach(msg => appendMessageToUI(msg.role, msg.content));
    scrollToBottom();
}

function appendMessageToUI(role, content) {
    // Remove welcome message if it exists
    const welcome = chatHistory.querySelector('.chat-welcome');
    if (welcome) welcome.remove();

    // Map 'assistant' to 'ai' for styling
    const styleRole = role === 'assistant' ? 'ai' : role;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${styleRole}`;
    
    const sender = role === 'user' ? 'You' : 'AI';
    
    // Format content (simple markdown support)
    let formattedContent = content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/```(\w*)([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');

    msgDiv.innerHTML = `
        <div class="chat-sender">${sender}</div>
        <div class="chat-bubble">${formattedContent}</div>
    `;
    
    chatHistory.appendChild(msgDiv);
}

function scrollToBottom() {
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

async function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    // Add user message
    appendMessageToUI('user', text);
    chatInput.value = '';
    chatInput.style.height = 'auto'; // Reset height
    scrollToBottom();
    
    // Save to history
    const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
    history.push({ role: 'user', content: text });
    localStorage.setItem('chat_history', JSON.stringify(history));

    await processAIResponse(history);
}

async function processAIResponse(history) {
    const key = (typeof DEFAULT_AI_KEY !== 'undefined' && DEFAULT_AI_KEY) ? DEFAULT_AI_KEY : localStorage.getItem('ai_api_key');

    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message ai loading-msg';
    loadingDiv.innerHTML = `
        <div class="chat-sender">AI</div>
        <div class="chat-bubble">Thinking...</div>
    `;
    chatHistory.appendChild(loadingDiv);
    scrollToBottom();

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'Code Syncer'
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.3-70b-instruct:free",
                messages: [
                    {
                        role: "system", 
                        content: "You are a helpful coding assistant. Answer questions and provide code snippets."
                    },
                    ...history
                ]
            })
        });

        if (!response.ok) {
            throw new Error('API Error: ' + response.status);
        }

        const data = await response.json();
        const aiText = data.choices[0].message.content;
        
        // Remove loading
        loadingDiv.remove();
        
        // Add AI message
        appendMessageToUI('assistant', aiText); // OpenRouter returns 'assistant'
        scrollToBottom();
        
        // Save to history
        history.push({ role: 'assistant', content: aiText });
        localStorage.setItem('chat_history', JSON.stringify(history));

    } catch (error) {
        loadingDiv.remove();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'chat-message system error-msg';
        errorDiv.innerHTML = `
            <div class="chat-sender">System</div>
            <div class="chat-bubble" style="color: var(--danger-color); border-color: var(--danger-color);">
                Error: ${error.message}
                <div style="margin-top: 5px;">
                    <button class="btn btn-small" onclick="retryLastMessage()" style="background: var(--danger-color); color: white; border: none;">Retry</button>
                </div>
            </div>
        `;
        chatHistory.appendChild(errorDiv);
        scrollToBottom();
    }
}

async function retryLastMessage() {
    // Remove error message
    const errorMsg = document.querySelector('.chat-message.system.error-msg');
    if (errorMsg) errorMsg.remove();
    
    const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
    await processAIResponse(history);
}

function clearChatHistory() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        localStorage.removeItem('chat_history');
        loadChatHistory();
    }
}

function exportChatToText() {
    const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
    if (history.length === 0) {
        alert('No chat history to export.');
        return;
    }

    let textContent = "Code Syncer - AI Chat History\n";
    textContent += "================================\n\n";

    history.forEach(msg => {
        const role = msg.role === 'user' ? 'You' : 'AI';
        textContent += `[${role}]:\n${msg.content}\n\n--------------------------------\n\n`;
    });

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportChatToPDF() {
    const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
    if (history.length === 0) {
        alert('No chat history to export.');
        return;
    }

    // Check if html2pdf is loaded
    if (typeof html2pdf === 'undefined') {
        alert('PDF export library not loaded. Please check your internet connection.');
        return;
    }

    // Create a temporary container for PDF generation
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.color = '#000';
    element.style.background = '#fff';

    const title = document.createElement('h1');
    title.textContent = 'Code Syncer - AI Chat History';
    title.style.borderBottom = '2px solid #333';
    title.style.paddingBottom = '10px';
    element.appendChild(title);

    const date = document.createElement('p');
    date.textContent = `Date: ${new Date().toLocaleDateString()}`;
    date.style.marginBottom = '20px';
    date.style.color = '#666';
    element.appendChild(date);

    history.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.style.marginBottom = '15px';
        msgDiv.style.padding = '10px';
        msgDiv.style.borderRadius = '5px';
        msgDiv.style.backgroundColor = msg.role === 'user' ? '#f0f7ff' : '#f0f0f0';
        msgDiv.style.borderLeft = msg.role === 'user' ? '4px solid #007bff' : '4px solid #6c757d';

        const role = document.createElement('strong');
        role.textContent = msg.role === 'user' ? 'You:' : 'AI:';
        role.style.display = 'block';
        role.style.marginBottom = '5px';
        role.style.color = '#333';
        msgDiv.appendChild(role);

        const content = document.createElement('div');
        // Simple formatting for code blocks in PDF
        let formattedContent = msg.content
            .replace(/```(\w*)([\s\S]*?)```/g, '<pre style="background:#333; color:#fff; padding:10px; border-radius:4px; overflow-x:hidden; white-space:pre-wrap;">$2</pre>')
            .replace(/\n/g, '<br>');
        
        content.innerHTML = formattedContent;
        content.style.color = '#444';
        msgDiv.appendChild(content);

        element.appendChild(msgDiv);
    });

    const opt = {
        margin: 10,
        filename: `chat-history-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generate PDF
    html2pdf().set(opt).from(element).save();
}

// Folder Security Functions
function changeFolderPassword() {
    const currentPass = prompt('Enter current folder security code:');
    if (currentPass !== getFolderPassword()) {
        alert('Incorrect current code!');
        return;
    }
    
    const newPass = folderPassInput.value;
    if (!newPass) {
        alert('Please enter a new password in the input field.');
        return;
    }
    
    setFolderPassword(newPass);
    alert('Folder security code updated successfully!');
    folderPassInput.value = '';
}

async function deleteFolder(folderName) {
    // Security Check
    const code = prompt('Enter folder security code to DELETE this folder:');
    if (code !== getFolderPassword()) {
        alert('Incorrect security code!');
        return;
    }

    if (!confirm(`Are you sure you want to DELETE folder '${folderName}' and ALL its contents? This cannot be undone.`)) {
        return;
    }
    
    const folderPath = currentPath + folderName + '/';
    showStatus(`Deleting folder ${folderName}...`, 'info');
    
    // Find all files in this folder
    const filesToDelete = allFiles.filter(f => f.path.startsWith(folderPath));
    
    if (filesToDelete.length === 0) {
        showStatus('Folder appears empty or already deleted', 'info');
        renderFileList();
        return;
    }
    
    let deletedCount = 0;
    for (const file of filesToDelete) {
        try {
            const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${encodePath(file.path)}`;
            await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${CONFIG.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Delete folder ${folderName}`,
                    sha: file.sha
                })
            });
            deletedCount++;
        } catch (e) {
            console.error(`Failed to delete ${file.path}`, e);
        }
    }
    
    showStatus(`Deleted ${deletedCount} files in ${folderName}`, 'success');
    setTimeout(fetchFromGitHub, 1000);
}


// Menu Functions
function toggleMenu(id, event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById(id);
    // Close all other menus
    document.querySelectorAll('.menu-dropdown').forEach(m => {
        if (m.id !== id) m.classList.remove('show');
    });
    if (menu) menu.classList.toggle('show');
}

// Close menus when clicking outside
window.addEventListener('click', () => {
    document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.remove('show'));
});

async function moveFile(oldPath, newPath, sha) {
    try {
        // 1. Get file content
        const contentsUrl = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${encodePath(oldPath)}`;
        const getRes = await fetch(contentsUrl, {
            headers: { 'Authorization': `token ${CONFIG.token}` }
        });
        const getData = await getRes.json();
        
        // 2. Create new file
        const putUrl = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${encodePath(newPath)}`;
        await fetch(putUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${CONFIG.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Rename ${oldPath} to ${newPath}`,
                content: getData.content,
                sha: undefined // New file
            })
        });
        
        // 3. Delete old file
        const delUrl = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${encodePath(oldPath)}`;
        await fetch(delUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${CONFIG.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Moved to ${newPath}`,
                sha: sha
            })
        });
        return true;
    } catch (error) {
        console.error(`Failed to move ${oldPath}`, error);
        return false;
    }
}

async function renameItem(name, type) {
    const newName = prompt(`Enter new name for ${type} '${name}':`, name);
    if (!newName || newName === name) return;

    if (type === 'folder') {
        const oldFolderPath = currentPath + name + '/';
        const newFolderPath = currentPath + newName + '/';
        
        // Security Check
        const code = prompt('Enter folder security code to RENAME this folder:');
        if (code !== getFolderPassword()) {
            alert('Incorrect security code!');
            return;
        }

        const filesToMove = allFiles.filter(f => f.path.startsWith(oldFolderPath));
        showStatus(`Renaming folder... (${filesToMove.length} files)`, 'info');
        
        let successCount = 0;
        for (const file of filesToMove) {
            const relativePath = file.path.substring(oldFolderPath.length);
            const newFilePath = newFolderPath + relativePath;
            if (await moveFile(file.path, newFilePath, file.sha)) {
                successCount++;
            }
        }
        showStatus(`Renamed ${successCount} files`, 'success');
        setTimeout(fetchFromGitHub, 1000);
    } else {
        const oldPath = currentPath + name;
        const newPath = currentPath + newName;
        const file = allFiles.find(f => f.path === oldPath);
        
        if (file) {
            showStatus(`Renaming ${name}...`, 'info');
            if (await moveFile(oldPath, newPath, file.sha)) {
                showStatus('File renamed successfully', 'success');
                setTimeout(fetchFromGitHub, 1000);
            } else {
                showStatus('Failed to rename file', 'error');
            }
        }
    }
}

// ===================================
// WALLPAPER LOGIC
// ===================================

function initWallpaper() {
    // Create wallpaper element if it doesn't exist
    let wallpaperDiv = document.getElementById('wallpaper-background');
    if (!wallpaperDiv) {
        wallpaperDiv = document.createElement('div');
        wallpaperDiv.id = 'wallpaper-background';
        document.body.prepend(wallpaperDiv);
    }

    // Listeners
    if (wallpaperUrlInput) wallpaperUrlInput.addEventListener('input', saveWallpaperSettings);
    if (wallpaperEffectSelect) wallpaperEffectSelect.addEventListener('change', () => {
        toggleBlurControl();
        saveWallpaperSettings();
    });
    if (wallpaperBlurRange) wallpaperBlurRange.addEventListener('input', () => {
        if (wallpaperBlurValue) wallpaperBlurValue.textContent = wallpaperBlurRange.value + 'px';
        saveWallpaperSettings();
    });
    
    // New Listeners
    if (wallpaperFileInput) wallpaperFileInput.addEventListener('change', handleWallpaperUpload);
    if (wallpaperTransparentCheckbox) wallpaperTransparentCheckbox.addEventListener('change', () => {
        toggleOpacityControl();
        saveWallpaperSettings();
    });
    if (wallpaperOpacityRange) wallpaperOpacityRange.addEventListener('input', () => {
        if (wallpaperOpacityValue) wallpaperOpacityValue.textContent = (wallpaperOpacityRange.value / 100).toFixed(2);
        saveWallpaperSettings();
    });

    loadAndApplyWallpaper();
}

function toggleBlurControl() {
    if (wallpaperBlurRange && wallpaperBlurRange.parentElement) {
        wallpaperBlurRange.parentElement.style.display = wallpaperEffectSelect.value === 'blur' ? 'flex' : 'none';
    }
}

function toggleOpacityControl() {
    if (wallpaperOpacityGroup) {
        wallpaperOpacityGroup.style.display = wallpaperTransparentCheckbox.checked ? 'flex' : 'none';
    }
}

function handleWallpaperUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        alert('Image is too large (max 5MB). Please choose a smaller image.');
        wallpaperFileInput.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const base64 = event.target.result;
        try {
            localStorage.setItem('wallpaper_image_data', base64);
            localStorage.setItem('wallpaper_url', ''); // Clear URL if file is uploaded
            if (wallpaperUrlInput) wallpaperUrlInput.value = '';
            loadAndApplyWallpaper();
        } catch (err) {
            alert('Failed to save image. It might be too large for local storage.');
            console.error(err);
        }
    };
    reader.readAsDataURL(file);
}

function loadAndApplyWallpaper() {
    const url = localStorage.getItem('wallpaper_url') || '';
    const imageData = localStorage.getItem('wallpaper_image_data') || '';
    const effect = localStorage.getItem('wallpaper_effect') || 'normal';
    const blur = localStorage.getItem('wallpaper_blur') || '5';
    const transparent = localStorage.getItem('wallpaper_transparent') === 'true';
    const opacity = localStorage.getItem('wallpaper_opacity') || '80';

    // Update UI
    if (wallpaperUrlInput && wallpaperUrlInput.value !== url && !imageData) wallpaperUrlInput.value = url;
    if (wallpaperEffectSelect) wallpaperEffectSelect.value = effect;
    if (wallpaperBlurRange) wallpaperBlurRange.value = blur;
    if (wallpaperBlurValue) wallpaperBlurValue.textContent = blur + 'px';
    if (wallpaperTransparentCheckbox) wallpaperTransparentCheckbox.checked = transparent;
    if (wallpaperOpacityRange) wallpaperOpacityRange.value = opacity;
    if (wallpaperOpacityValue) wallpaperOpacityValue.textContent = (opacity / 100).toFixed(2);

    toggleBlurControl();
    toggleOpacityControl();

    applyWallpaper(url, imageData, effect, blur, transparent, opacity);
}

function applyWallpaper(url, imageData, effect, blur, transparent, opacity) {
    const wallpaperDiv = document.getElementById('wallpaper-background');
    if (!wallpaperDiv) return;

    const hasImage = url || imageData;

    if (hasImage) {
        wallpaperDiv.style.backgroundImage = `url('${imageData || url}')`;
        wallpaperDiv.style.opacity = '1';
        // Make body background transparent so wallpaper shows
        document.body.style.backgroundColor = 'transparent';
    } else {
        wallpaperDiv.style.backgroundImage = 'none';
        wallpaperDiv.style.opacity = '0';
        document.body.style.backgroundColor = '';
    }

    if (effect === 'blur') {
        wallpaperDiv.style.filter = `blur(${blur}px)`;
    } else {
        wallpaperDiv.style.filter = 'none';
    }

    // Container Transparency
    if (transparent && hasImage) {
        const opacityVal = parseInt(opacity) / 100;
        
        // Get original theme colors from HTML element (computed style)
        const computedStyle = getComputedStyle(document.documentElement);
        const cardBg = computedStyle.getPropertyValue('--card-bg').trim();
        const inputBg = computedStyle.getPropertyValue('--input-bg').trim();
        
        // Helper to convert hex to rgba
        const hexToRgba = (hex, alpha) => {
            let r = 0, g = 0, b = 0;
            if (!hex) return `rgba(22, 27, 34, ${alpha})`; // Default fallback

            if (hex.startsWith('#')) {
                if (hex.length === 4) {
                    r = parseInt(hex[1] + hex[1], 16);
                    g = parseInt(hex[2] + hex[2], 16);
                    b = parseInt(hex[3] + hex[3], 16);
                } else if (hex.length === 7) {
                    r = parseInt(hex[1] + hex[2], 16);
                    g = parseInt(hex[3] + hex[4], 16);
                    b = parseInt(hex[5] + hex[6], 16);
                }
            } else if (hex.startsWith('rgb')) {
                // Already rgb, just change alpha? Too complex to parse all formats, assume hex for themes
                return hex; 
            }
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        document.body.style.setProperty('--card-bg', hexToRgba(cardBg, opacityVal));
        document.body.style.setProperty('--input-bg', hexToRgba(inputBg, opacityVal));
    } else {
        document.body.style.removeProperty('--card-bg');
        document.body.style.removeProperty('--input-bg');
    }
}

function saveWallpaperSettings() {
    const newUrl = wallpaperUrlInput ? wallpaperUrlInput.value.trim() : '';
    const oldUrl = localStorage.getItem('wallpaper_url');
    
    if (newUrl && newUrl !== oldUrl) {
        localStorage.removeItem('wallpaper_image_data'); // Clear uploaded image if URL changes
    }

    if (wallpaperUrlInput) localStorage.setItem('wallpaper_url', newUrl);
    if (wallpaperEffectSelect) localStorage.setItem('wallpaper_effect', wallpaperEffectSelect.value);
    if (wallpaperBlurRange) localStorage.setItem('wallpaper_blur', wallpaperBlurRange.value);
    if (wallpaperTransparentCheckbox) localStorage.setItem('wallpaper_transparent', wallpaperTransparentCheckbox.checked);
    if (wallpaperOpacityRange) localStorage.setItem('wallpaper_opacity', wallpaperOpacityRange.value);
    
    loadAndApplyWallpaper();
}
