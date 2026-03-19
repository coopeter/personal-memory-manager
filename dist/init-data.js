#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var storage_1 = require("../src/core/storage");
var project_1 = require("../src/core/project");
var dotenv_1 = require("dotenv");
var bcrypt_1 = require("bcrypt");
(0, dotenv_1.config)();
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var storage, hashedPassword, pm, project, rootFolder, conversationContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    storage = new storage_1.Storage({
                        basePath: './data',
                        useLanceDB: true,
                        provider: 'local',
                    });
                    return [4 /*yield*/, storage.init()
                        // Create default admin user
                    ];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, bcrypt_1.hash)('password', 10)];
                case 2:
                    hashedPassword = _a.sent();
                    return [4 /*yield*/, storage.createUser({
                            username: 'admin',
                            password: hashedPassword,
                        })
                        // Create first project: "personal-memory-manager"
                    ];
                case 3:
                    _a.sent();
                    pm = new project_1.ProjectManager(storage);
                    return [4 /*yield*/, pm.createProject('Personal Memory Manager', '开发一个通用的个人记忆与文档管理OpenClaw Skill')
                        // Create root folder
                    ];
                case 4:
                    project = _a.sent();
                    return [4 /*yield*/, pm.createFolder(project.id, null, '项目讨论', '记录我们开发这个项目的讨论过程')
                        // Import our conversation content
                    ];
                case 5:
                    rootFolder = _a.sent();
                    conversationContent = "# \u4E2A\u4EBA\u8BB0\u5FC6\u7BA1\u7406\u5668 - \u5F00\u53D1\u8BA8\u8BBA\u8BB0\u5F55\n\n## \u9700\u6C42\u8BA8\u8BBA\n\n\u6211\u4EEC\u8981\u5F00\u53D1\u4E00\u4E2A\u901A\u7528\u7684\u8BB0\u5FC6\u548C\u6587\u6863\u7BA1\u7406\u529F\u80FD\uFF0C\u4F5C\u4E3A OpenClaw Skill \u53D1\u5E03\u3002\u4E3B\u8981\u529F\u80FD\uFF1A\n\n1. **\u5B8C\u6574\u8BB0\u5F55\u6240\u6709\u5BF9\u8BDD**\n   - \u8BB0\u5F55\u6240\u6709\u6C9F\u901A\u5185\u5BB9\uFF0C\u4E0D\u4E22\u5931\u4EFB\u4F55\u4FE1\u606F\n   - \u533A\u5206\u4E09\u79CD\u5185\u5BB9\u7C7B\u578B\uFF1A\u7075\u611F\u7247\u6BB5\u3001\u8BA8\u8BBA\u8FC7\u7A0B\u3001\u6700\u7EC8\u6210\u679C\n\n2. **\u6309\u9879\u76EE\u5206\u7EC4\u7BA1\u7406**\n   - \u7528\u6237\u53EF\u4EE5\u81EA\u5B9A\u4E49\u521B\u5EFA\u591A\u4E2A\u9879\u76EE\n   - \u6BCF\u4E2A\u9879\u76EE\u5185\u7528\u6237\u53EF\u4EE5\u81EA\u5B9A\u4E49\u591A\u7EA7\u6587\u4EF6\u5939\u7ED3\u6784\n   - \u7528\u6237\u5B9A\u4E49\u6587\u4EF6\u5939\u7528\u9014\u540E\uFF0CAI \u81EA\u52A8\u628A\u5BF9\u8BDD\u5185\u5BB9\u5F52\u7C7B\u653E\u5165\u5BF9\u5E94\u6587\u4EF6\u5939\n   - \u652F\u6301\u672A\u5F52\u7C7B\u5230\u4EFB\u4F55\u9879\u76EE\u7684\u5185\u5BB9\uFF0C\u653E\u5728\u516C\u5171\u533A\u57DF\uFF0C\u652F\u6301\u6807\u7B7E\u548C\u641C\u7D22\n\n3. **\u5DE5\u4F5C\u8FDB\u5EA6\u8FFD\u8E2A**\n   - \u8BB0\u5F55\u6BCF\u4E2A\u9879\u76EE\u5F53\u524D\u8FDB\u5EA6\n   - \u6309\u5929\u8BB0\u5F55\u6BCF\u4E2A\u9879\u76EE\u505A\u4E86\u4EC0\u4E48\n   - \u91CD\u542F/\u9694\u5929\u4E4B\u540E\u80FD\u5FEB\u901F\u6062\u590D\u4E0A\u4E0B\u6587\uFF0C\u8BB0\u5F97\u4E4B\u524D\u804A\u5230\u54EA\u4E86\n\n4. **\u5B58\u50A8\u65B9\u6848**\n   - LanceDB \u5411\u91CF\u7D22\u5F15\uFF0C\u7528\u4E8E\u8BED\u4E49\u68C0\u7D22\n   - Markdown \u6587\u4EF6\u5B58\u50A8\u539F\u59CB\u5185\u5BB9\uFF0C\u65B9\u4FBF\u540C\u6B65\u548C\u901A\u7528\u8BBF\u95EE\n   - \u5143\u6570\u636E JSON \u4FDD\u5B58\u7ED3\u6784\u4FE1\u606F\n\n5. **\u53EF\u5206\u53D1\u4E3A Skill**\n   - \u505A\u6210\u4E00\u4E2A\u901A\u7528\u7684 OpenClaw Skill\uFF0C\u4E0D\u4F9D\u8D56\u98DE\u4E66\uFF08\u98DE\u4E66\u4F5C\u4E3A\u53EF\u9009\u9879\uFF09\n   - \u5176\u4ED6 OpenClaw \u5B9E\u4F8B\u90E8\u7F72\u540E\u4E5F\u80FD\u4F7F\u7528\n\n6. **\u524D\u7AEF\u754C\u9762**\n   - \u9700\u8981 Web \u7BA1\u7406\u754C\u9762\uFF0C\u65B9\u4FBF\u6D4F\u89C8\u67E5\u770B\n   - \u5982\u679C\u80FD\u96C6\u6210\u5230\u98DE\u4E66\u66F4\u597D\uFF0C\u98DE\u4E66\u5185\u5FAE\u5E94\u7528\uFF0C\u652F\u6301\u79FB\u52A8\u7AEF\u8BBF\u95EE\n\n7. **\u6587\u4EF6\u7BA1\u7406\u64CD\u4F5C**\n   - \u91CD\u547D\u540D\uFF1A\u652F\u6301\u5BF9\u5DF2\u4FDD\u5B58\u7684\u5BF9\u8BDD/\u6587\u6863\u91CD\u547D\u540D\n   - \u79FB\u52A8\uFF1A\u652F\u6301\u5728\u4E0D\u540C\u9879\u76EE/\u6587\u4EF6\u5939\u4E4B\u95F4\u79FB\u52A8\u6587\u6863\n   - \u56DE\u6536\u7AD9\uFF1A\u5220\u9664\u6587\u4EF6\u5148\u653E\u8FDB\u56DE\u6536\u7AD9\uFF0C\u4E0D\u76F4\u63A5\u5220\u9664\uFF0C\u652F\u6301\u6062\u590D\n\n8. **\u5B8C\u6574\u7684\u6587\u4EF6\u5939\u7BA1\u7406\u5728\u524D\u7AEF**\n   - \u65B0\u5EFA\u6587\u4EF6\u5939/\u5B50\u6587\u4EF6\u5939\uFF1A\u754C\u9762\u4E0A\u76F4\u63A5\u64CD\u4F5C\uFF0C\u652F\u6301\u591A\u7EA7\u76EE\u5F55\n   - \u6587\u4EF6\u5939\u91CD\u547D\u540D\uFF1A\u968F\u65F6\u6539\u540D\u5B57\u548C\u63CF\u8FF0\n   - \u6587\u4EF6\u5939\u79FB\u52A8/\u5220\u9664\uFF1A\u79FB\u52A8\u6574\u68F5\u76EE\u5F55\u6811\uFF0C\u5220\u9664\u653E\u56DE\u6536\u7AD9\n   - \u6587\u4EF6\u5939\u63CF\u8FF0\uFF1A\u6BCF\u4E2A\u6587\u4EF6\u5939\u53EF\u4EE5\u5199\u8BF4\u660E\uFF0C\u544A\u8BC9 AI \u8FD9\u4E2A\u6587\u4EF6\u5939\u653E\u4EC0\u4E48\u7C7B\u578B\u5185\u5BB9\uFF0C\u65B9\u4FBF\u81EA\u52A8\u5206\u7C7B\n   - \u62D6\u62FD\u6392\u5E8F\uFF1A\u53EF\u4EE5\u8C03\u6574\u6587\u4EF6\u5939\u987A\u5E8F\n\n9. **\u641C\u7D22\u68C0\u7D22**\n   - \u5168\u6587\u641C\u7D22\n   - \u8BED\u4E49\u641C\u7D22\uFF08\u627E\u76F8\u5173\u5185\u5BB9\uFF09\n   - \u6309\u9879\u76EE/\u6587\u4EF6\u5939/\u6807\u7B7E/\u65E5\u671F\u7B5B\u9009\n\n10. **\u81EA\u52A8\u603B\u7ED3**\n    - \u6BCF\u5929\u81EA\u52A8\u603B\u7ED3\u6BCF\u4E2A\u9879\u76EE\u7684\u8FDB\u5C55\n    - \u5BF9\u8BDD\u7ED3\u675F\u540E\u81EA\u52A8\u63D0\u70BC\u5173\u952E\u70B9\u653E\u5230\u5BF9\u5E94\u6587\u4EF6\u5939\n    - \u53EF\u4EE5\u4E00\u952E\u751F\u6210\u9879\u76EE\u8FDB\u5EA6\u62A5\u544A\n\n11. **\u6743\u9650\u4E0E\u767B\u5F55**\n    - \u5982\u679C\u96C6\u6210\u5728\u98DE\u4E66\u5185\uFF1A\u590D\u7528\u98DE\u4E66\u8D26\u53F7\u767B\u5F55\uFF0C\u4E0D\u9700\u8981\u989D\u5916\u767B\u5F55\n    - \u5982\u679C\u662F\u72EC\u7ACB Web \u754C\u9762\uFF1A\u9700\u8981\u8D26\u53F7\u5BC6\u7801\u767B\u5F55\u529F\u80FD\uFF0C\u4FDD\u8BC1\u53EA\u6709\u4F60\u80FD\u8BBF\u95EE\n\n## \u5F00\u53D1\u8FDB\u5EA6\n\n\u6240\u6709\u4EE3\u7801\u5DF2\u7ECF\u5F00\u53D1\u5B8C\u6210\uFF0C\u5305\u62EC\uFF1A\n- \u540E\u7AEF\u6838\u5FC3\u903B\u8F91\u5168\u90E8\u5B8C\u6210\n- \u524D\u7AEF\u6784\u5EFA\u6210\u529F\n- \u98DE\u4E66\u96C6\u6210\u5B8C\u6210\n\n\u8FD9\u662F\u7B2C\u4E00\u4E2A\u9879\u76EE\uFF0C\u7528\u6765\u6D4B\u8BD5\u6574\u4E2A\u7CFB\u7EDF\u3002\n";
                    return [4 /*yield*/, storage.createDocument({
                            projectId: project.id,
                            folderId: rootFolder.id,
                            title: '需求讨论与开发记录',
                            content: conversationContent,
                            contentType: 'result',
                            tags: ['project', 'memory-manager', 'requirement'],
                        })];
                case 6:
                    _a.sent();
                    console.log('✅ Initialization complete!');
                    console.log('');
                    console.log('Default admin user created:');
                    console.log('  Username: admin');
                    console.log('  Password: password');
                    console.log('');
                    console.log('First project "Personal Memory Manager" created!');
                    return [4 /*yield*/, storage.close()];
                case 7:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
init().catch(console.error);
