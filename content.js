// Constants
const SIDEBAR_ID = 'claude-prompt-sidebar';
const STORAGE_KEY = 'claude_prompts';

// Default prompts for testing
const DEFAULT_PROMPTS = [
    {
        id: 1,
        title: 'Linux 驅動開發',
        content: 'You are an embedded Linux expert. Help me with driver development.'
    },
    {
        id: 2,
        title: 'Linux 核心除錯',
        content: 'Help me debug Linux kernel issues. Focus on practical solutions.'
    },
    {
        id: 3,
        title: 'BSP 開發',
        content: 'Assist with BSP development for embedded Linux systems.'
    }
];

// Create and inject sidebar
function createSidebar() {
    const existingSidebar = document.getElementById(SIDEBAR_ID);
    if (existingSidebar) {
        return existingSidebar;
    }

    const sidebar = document.createElement('div');
    sidebar.id = SIDEBAR_ID;
    sidebar.classList.add('collapsed'); // Start collapsed
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <h3>提示詞管理</h3>
            <button id="toggle-sidebar">←</button>
        </div>
        <div class="prompt-list"></div>
        <div class="sidebar-footer">
            <button id="add-prompt">新增提示詞</button>
        </div>
    `;
    document.body.appendChild(sidebar);
    return sidebar;
}

// Load prompts from storage
async function loadPrompts() {
    try {
        const result = await chrome.storage.local.get(STORAGE_KEY);
        return result[STORAGE_KEY] || [];
    } catch (error) {
        console.error('Error loading prompts:', error);
        return [];
    }
}

// Render prompts in sidebar
function renderPrompts(prompts) {
    const promptList = document.querySelector(`#${SIDEBAR_ID} .prompt-list`);
    if (!promptList) return;

    promptList.innerHTML = prompts.map(prompt => `
        <div class="prompt-item" data-id="${prompt.id}">
            <h4>${prompt.title}</h4>
            <button class="use-prompt">使用</button>
        </div>
    `).join('');
}

// Insert prompt into Claude's textarea
function insertPrompt(promptContent) {
    const textarea = document.querySelector('textarea[placeholder*="Message"]');
    if (textarea) {
        textarea.value = promptContent;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

// Toggle sidebar visibility
function toggleSidebar() {
    const sidebar = document.getElementById(SIDEBAR_ID);
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

// Initialize sidebar
async function initSidebar() {
    const sidebar = createSidebar();
    const prompts = await loadPrompts();
    renderPrompts(prompts);

    // Event listeners
    sidebar.addEventListener('click', async (e) => {
        if (e.target.classList.contains('use-prompt')) {
            const promptId = parseInt(e.target.closest('.prompt-item').dataset.id);
            const prompts = await loadPrompts();
            const prompt = prompts.find(p => p.id === promptId);
            if (prompt) {
                insertPrompt(prompt.content);
            }
        } else if (e.target.id === 'toggle-sidebar') {
            toggleSidebar();
        }
    });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleSidebar") {
        toggleSidebar();
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
} else {
    initSidebar();
} 