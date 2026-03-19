"use strict";
// AI文档分类器 - 根据文档内容自动分类到最合适的文件夹
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIClassifier = void 0;
class AIClassifier {
    constructor() { }
    /**
     * 根据文档内容和可用文件夹，自动分类到最合适的文件夹
     */
    async classifyDocument(document, availableFolders) {
        if (availableFolders.length === 0) {
            return [];
        }
        // 如果只有一个文件夹，直接返回
        if (availableFolders.length === 1) {
            return [{
                    folderId: availableFolders[0].id,
                    confidence: 1.0,
                    reason: 'Only one folder available'
                }];
        }
        // 计算每个文件夹描述与文档内容的匹配度
        const results = [];
        const documentContent = document.title + ' ' + document.content;
        const documentWords = this.extractKeywords(documentContent);
        for (const folder of availableFolders) {
            const folderText = folder.name + ' ' + folder.description;
            const folderWords = this.extractKeywords(folderText);
            // 计算重叠度
            let matchScore = 0;
            for (const word of documentWords) {
                if (folderWords.has(word)) {
                    matchScore += 1;
                }
            }
            // 归一化分数
            const confidence = matchScore / Math.max(documentWords.size, 1);
            results.push({
                folderId: folder.id,
                confidence,
                reason: `Matched ${matchScore} keywords`
            });
        }
        // 按置信度排序
        return results.sort((a, b) => b.confidence - a.confidence);
    }
    /**
     * 从文本中提取关键词
     */
    extractKeywords(text) {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3);
        return new Set(words);
    }
    /**
     * 自动提取文档标签
     */
    extractTags(text, maxTags = 10) {
        const words = this.extractKeywords(text);
        const wordCount = new Map();
        // 这里可以用更复杂的TF-IDF，简单版本直接返回频率最高的词
        for (const word of words) {
            wordCount.set(word, (wordCount.get(word) || 0) + 1);
        }
        return Array.from(wordCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxTags)
            .map(entry => entry[0]);
    }
}
exports.AIClassifier = AIClassifier;
