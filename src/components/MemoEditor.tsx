'use client';

import { useState, useEffect } from 'react';

interface MemoEditorProps {
  initialTitle: string;
  initialContent: string;
  onSave: (title: string, content: string) => void;
  isLoading?: boolean;
}

export default function MemoEditor({ 
  initialTitle, 
  initialContent, 
  onSave, 
  isLoading = false 
}: MemoEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [initialTitle, initialContent]);

  const handleSave = () => {
    onSave(title, content);
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        placeholder="タイトルを入力..."
        disabled={isLoading}
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        placeholder="メモを入力..."
        disabled={isLoading}
      />
      <button
        onClick={handleSave}
        disabled={isLoading}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '保存中...' : '保存'}
      </button>
    </div>
  );
}

