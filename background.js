// Initialize storage with default prompts if empty
chrome.runtime.onInstalled.addListener(async () => {
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