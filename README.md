# Claude Prompt Sidebar

Chrome 擴充功能，為 Claude.ai 聊天介面添加提示詞管理側邊欄。

## 功能特點

- 可收合的側邊欄界面
- 預設提示詞範例（嵌入式 Linux 相關）
- 提示詞的使用與管理
- 本地儲存提示詞資料

## 安裝方式

1. 下載或克隆此專案
2. 開啟 Chrome 擴充功能頁面 (chrome://extensions/)
3. 啟用「開發人員模式」
4. 點擊「載入未封裝項目」
5. 選擇此專案資料夾

## 使用方式

1. 前往 Claude.ai 網站
2. 點擊瀏覽器右上角的擴充功能圖示查看使用說明
3. 在頁面右側可以看到側邊欄，點擊箭頭按鈕可以收合
4. 點擊提示詞旁的「使用」按鈕可將提示詞插入對話框

## 技術說明

- 使用 Chrome Extension Manifest V3
- 純 JavaScript 實現，無框架依賴
- 使用 Chrome Storage API 儲存資料
- 支援 Claude.ai 網頁介面

## 開發計劃

- [ ] 提示詞編輯功能
- [ ] 提示詞分類管理
- [ ] 匯入/匯出功能
- [ ] 更多自訂選項

## 授權條款

MIT License 