"use strict";
// 进度追踪 - 每日工作进度记录和自动总结
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressTracker = void 0;
class ProgressTracker {
    storage;
    constructor(storage) {
        this.storage = storage;
    }
    /**
     * 获取今日进度
     */
    async getTodayProgress() {
        const today = this.getCurrentDate();
        return this.storage.getProgress(today);
    }
    /**
     * 获取指定日期范围的进度
     */
    async getProgressRange(startDate, endDate) {
        return this.storage.listProgress(startDate, endDate);
    }
    /**
     * 自动生成今日进度总结，基于今天修改的所有文档
     */
    async generateDailySummary(documents) {
        if (documents.length === 0) {
            return 'No work done today.';
        }
        const lines = [];
        lines.push(`# Daily Progress Summary - ${this.getCurrentDate()}\n`);
        lines.push(`## Work Summary\n`);
        lines.push(`Total documents worked on today: **${documents.length}**\n`);
        lines.push(`\n## Documents\n`);
        for (const doc of documents) {
            const wordCount = doc.content.split(/\s+/).length;
            lines.push(`- **${doc.title}** (${wordCount} words)`);
            if (doc.tags.length > 0) {
                lines.push(`  Tags: ${doc.tags.join(', ')}`);
            }
            lines.push('');
        }
        // 添加统计
        const totalWords = documents.reduce((sum, doc) => sum + doc.content.split(/\s+/).length, 0);
        lines.push(`## Statistics\n`);
        lines.push(`- Total words written today: **${totalWords}**`);
        lines.push(`- Average document length: **${Math.round(totalWords / documents.length)}** words`);
        return lines.join('\n');
    }
    /**
     * 保存今日进度
     */
    async saveTodayProgress(content, summary, documentIds) {
        const today = this.getCurrentDate();
        const existing = await this.storage.getProgress(today);
        if (existing) {
            return this.storage.updateProgress(existing.id, {
                content,
                summary,
                documentIds,
            });
        }
        else {
            return this.storage.saveProgress({
                date: today,
                content,
                summary,
                documentIds,
            });
        }
    }
    /**
     * 获取当前日期字符串
     */
    getCurrentDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    /**
     * 导出进度为Markdown
     */
    exportProgressToMarkdown(entries) {
        const lines = ['# Progress Export\n'];
        for (const entry of entries.sort((a, b) => b.date.localeCompare(a.date))) {
            lines.push(`## ${entry.date}`);
            lines.push(entry.summary);
            lines.push('');
            lines.push('---');
            lines.push('');
        }
        return lines.join('\n');
    }
}
exports.ProgressTracker = ProgressTracker;
