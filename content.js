// Constants
const SIDEBAR_ID = 'claude-prompt-sidebar';
const STORAGE_KEY = 'claude_prompts';

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
            <button id="toggle-sidebar"></button>
        </div>
        <div class="prompt-list"></div>
        <div class="sidebar-footer">
            <button id="add-prompt">新增提示詞</button>
        </div>
        <div id="prompt-form" class="prompt-form hidden">
            <div class="form-content">
                <h4>新增提示詞</h4>
                <input type="text" id="prompt-title" placeholder="提示詞名稱" />
                <textarea id="prompt-content" placeholder="提示詞內容"></textarea>
                <div class="form-buttons">
                    <button id="save-prompt">儲存</button>
                    <button id="cancel-prompt">取消</button>
                </div>
            </div>
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

// Save prompts to storage
async function savePrompts(prompts) {
    try {
        await chrome.storage.local.set({ [STORAGE_KEY]: prompts });
        return true;
    } catch (error) {
        console.error('Error saving prompts:', error);
        return false;
    }
}

// Generate unique ID for new prompt
function generateId(prompts) {
    if (prompts.length === 0) return 1;
    return Math.max(...prompts.map(p => p.id)) + 1;
}

// Show/hide prompt form
function togglePromptForm(show = true) {
    const form = document.getElementById('prompt-form');
    if (form) {
        form.classList.toggle('hidden', !show);
        if (show) {
            document.getElementById('prompt-title').focus();
        } else {
            // Clear form
            document.getElementById('prompt-title').value = '';
            document.getElementById('prompt-content').value = '';
        }
    }
}

// Render prompts in sidebar
function renderPrompts(prompts) {
    const promptList = document.querySelector(`#${SIDEBAR_ID} .prompt-list`);
    if (!promptList) return;

    promptList.innerHTML = prompts.map(prompt => `
        <div class="prompt-item" data-id="${prompt.id}">
            <div class="prompt-header" data-id="${prompt.id}">
                <h4>${prompt.title}</h4>
            </div>
            <div class="prompt-content hidden">
                <p>${prompt.content}</p>
                <div class="prompt-actions">
                    <button class="delete-prompt">刪除</button>
                    <button class="insert-prompt">插入提示詞</button>
                </div>
            </div>
        </div>
    `).join('');

    // 添加點擊事件處理
    promptList.querySelectorAll('.prompt-header').forEach(header => {
        header.addEventListener('click', (e) => {
            const promptId = header.dataset.id;
            const content = header.parentElement.querySelector('.prompt-content');
            const allContents = promptList.querySelectorAll('.prompt-content');

            // 收合其他所有已展開的內容
            allContents.forEach(c => {
                if (c !== content) {
                    c.classList.add('hidden');
                }
            });

            // 切換當前內容的顯示狀態
            content.classList.toggle('hidden');
        });
    });
}

// Delete prompt
async function deletePrompt(promptId) {
    try {
        const prompts = await loadPrompts();
        const updatedPrompts = prompts.filter(p => p.id !== promptId);
        if (await savePrompts(updatedPrompts)) {
            renderPrompts(updatedPrompts);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting prompt:', error);
        return false;
    }
}

// Insert prompt into Claude's input
function insertPrompt(promptContent) {
    // 尋找 contenteditable div
    const editorDiv = document.querySelector('div[contenteditable="true"].ProseMirror');
    if (!editorDiv) {
        console.error('找不到 Claude 的輸入框');
        return;
    }

    console.log('找到輸入框');

    // 清除現有內容
    editorDiv.innerHTML = '';

    // 創建新的段落元素
    const p = document.createElement('p');
    p.textContent = promptContent;

    // 插入段落
    editorDiv.appendChild(p);
    console.log('設定提示詞內容：', promptContent);

    // 觸發輸入事件
    editorDiv.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: true,
    }));

    // 聚焦輸入框
    editorDiv.focus();

    // 確認內容是否已更新
    if (editorDiv.textContent.trim() !== promptContent) {
        console.error('提示詞內容設定失敗');
        console.log('預期值：', promptContent);
        console.log('實際值：', editorDiv.textContent);
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
        if (e.target.classList.contains('insert-prompt')) {
            console.log('點擊插入按鈕');
            const promptId = parseInt(e.target.closest('.prompt-item').dataset.id);
            console.log('提示詞 ID:', promptId);
            const prompts = await loadPrompts();
            const prompt = prompts.find(p => p.id === promptId);
            if (prompt) {
                console.log('找到提示詞：', prompt);
                insertPrompt(prompt.content);
            } else {
                console.error('找不到對應的提示詞');
            }
        } else if (e.target.classList.contains('delete-prompt')) {
            const promptId = parseInt(e.target.closest('.prompt-item').dataset.id);
            if (confirm('確定要刪除這個提示詞嗎？')) {
                if (await deletePrompt(promptId)) {
                    console.log('提示詞已刪除');
                } else {
                    alert('刪除失敗，請重試');
                }
            }
        } else if (e.target.id === 'toggle-sidebar') {
            toggleSidebar();
        } else if (e.target.id === 'add-prompt') {
            togglePromptForm(true);
        } else if (e.target.id === 'cancel-prompt') {
            togglePromptForm(false);
        } else if (e.target.id === 'save-prompt') {
            const titleInput = document.getElementById('prompt-title');
            const contentInput = document.getElementById('prompt-content');

            const title = titleInput.value.trim();
            const content = contentInput.value.trim();

            if (!title || !content) {
                alert('請填寫提示詞名稱和內容');
                return;
            }

            const prompts = await loadPrompts();
            const newPrompt = {
                id: generateId(prompts),
                title,
                content
            };

            prompts.push(newPrompt);
            if (await savePrompts(prompts)) {
                renderPrompts(prompts);
                togglePromptForm(false);
            } else {
                alert('儲存失敗，請重試');
            }
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