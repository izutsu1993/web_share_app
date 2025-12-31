'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getAllMemos, Memo } from '@/lib/firestore';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loadingMemos, setLoadingMemos] = useState(true);

  useEffect(() => {
    if (loading || !user) return;

    const loadMemos = async () => {
      try {
        setLoadingMemos(true);
        const allMemos = await getAllMemos(user.uid);
        setMemos(allMemos);
      } catch (error) {
        console.error('メモ一覧の読み込みエラー:', error);
      } finally {
        setLoadingMemos(false);
      }
    };

    loadMemos();
  }, [user, loading]);

  const handleMemoClick = (memo: Memo) => {
    router.push(`/share-target?url=${encodeURIComponent(memo.url)}&title=${encodeURIComponent(memo.title)}`);
  };

  if (loading || loadingMemos) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">クラシルメモ</h1>
          <p className="text-gray-600">保存したレシピのメモ一覧</p>
        </div>

        {memos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">まだメモがありません</p>
            <p className="text-sm text-gray-500">
              クラシルのレシピページから「共有」ボタンをタップして、このアプリを選択してください
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {memos.map((memo) => (
              <div
                key={memo.id}
                onClick={() => handleMemoClick(memo)}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold mb-2 text-gray-900">{memo.title}</h2>
                <a
                  href={memo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm text-blue-600 hover:underline mb-3 block break-all"
                >
                  {memo.url}
                </a>
                {memo.content ? (
                  <p className="text-gray-900 line-clamp-2 mb-2">{memo.content}</p>
                ) : (
                  <p className="text-gray-400 italic">メモなし</p>
                )}
                <p className="text-xs text-gray-500">
                  更新: {memo.updatedAt.toLocaleString('ja-JP')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

