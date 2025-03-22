// Initialize storage with default prompts if empty
chrome.runtime.onInstalled.addListener(async () => {
    const DEFAULT_PROMPTS = [
        {
            id: 1,
            title: '轉換成台灣繁中',
            content: '請用台灣慣用的繁體中文說明以下內容，使用台灣人習慣的用詞和表達方式。請保留專有名詞的英文原文，例如品牌名稱、技術名詞、縮寫等：'
        },
        {
            id: 2,
            title: '翻譯成簡單英文',
            content: '請將以下內容轉述成簡單清楚的英文，使用常見字詞和簡單句型，避免使用艱深的專業術語：'
        },
        {
            id: 3,
            title: '轉換成淺顯說明',
            content: '請將以下內容用淺顯易懂的方式解釋，就像在跟完全不懂這個領域的人解釋一樣。請使用生活化的比喻和例子，避免專業術語：'
        }
    ];

    const data = await chrome.storage.local.get('claude_prompts');
    if (!data.claude_prompts) {
        await chrome.storage.local.set({ 'claude_prompts': DEFAULT_PROMPTS });
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
    if (tab.url.match(/^https:\/\/claude\.ai\/.*/)) {
        try {
            // 確保腳本已注入
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    // 檢查側邊欄是否存在
                    const sidebar = document.getElementById('claude-prompt-sidebar');
                    if (!sidebar) {
                        // 如果側邊欄不存在，重新初始化
                        if (typeof initSidebar === 'function') {
                            initSidebar();
                        }
                    }
                    // 切換側邊欄顯示狀態
                    if (typeof toggleSidebar === 'function') {
                        toggleSidebar();
                    }
                }
            });
        } catch (error) {
            console.error('Error toggling sidebar:', error);
        }
    }
}); 