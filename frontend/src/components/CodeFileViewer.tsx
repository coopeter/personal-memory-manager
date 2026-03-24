import * as React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import ReactMarkdown from 'react-markdown'

interface CodeFileViewerProps {
  content: string
  extension: string
}

// Map file extensions to syntax highlighting languages
const languageMap: Record<string, string> = {
  '.js': 'javascript',
  '.ts': 'typescript',
  '.jsx': 'jsx',
  '.tsx': 'tsx',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.json': 'json',
  '.md': 'markdown',
  '.markdown': 'markdown',
  '.py': 'python',
  '.java': 'java',
  '.c': 'c',
  '.cpp': 'cpp',
  '.h': 'cpp',
  '.go': 'go',
  '.rs': 'rust',
  '.rb': 'ruby',
  '.php': 'php',
  '.sh': 'bash',
  '.bash': 'bash',
  '.gitignore': 'bash',
  '.dockerignore': 'bash',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.xml': 'xml',
  '.sql': 'sql',
  '.config': 'ini',
  '.env': 'ini',
}

export default function CodeFileViewer({ content, extension }: CodeFileViewerProps) {
  const lang = languageMap[extension.toLowerCase()] || 'text'

  // Special handling for markdown - render it instead of syntax highlighting
  if (lang === 'markdown') {
    return (
      <div className="prose prose-gray max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    )
  }

  return (
    <SyntaxHighlighter
      language={lang}
      style={tomorrow}
      showLineNumbers={true}
      wrapLongLines={true}
      customStyle={{
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
      }}
    >
      {content}
    </SyntaxHighlighter>
  )
}
