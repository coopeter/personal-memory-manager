"use strict";
// Personal Memory Manager - Main Entry
// 通用记忆和文档管理 Skill for OpenClaw
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./api/index"), exports);
const index_1 = require("./api/index");
// 如果直接运行则启动服务
if (require.main === module) {
    (0, index_1.start)().catch(err => {
        console.error('Failed to start Personal Memory Manager:', err);
        process.exit(1);
    });
}
