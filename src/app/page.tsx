'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getAllMemos, deleteMemo, Memo } from '@/lib/firestore';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loadingMemos, setLoadingMemos] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (e: React.MouseEvent, memo: Memo) => {
    e.stopPropagation(); // クリックイベントの伝播を止める
    
    if (!user) return;
    
    if (!confirm(`「${memo.title}」を削除しますか？`)) {
      return;
    }

    try {
      setDeletingId(memo.id);
      await deleteMemo(user.uid, memo.url);
      // 削除後、メモ一覧を再読み込み
      const allMemos = await getAllMemos(user.uid);
      setMemos(allMemos);
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました。しばらく時間をおいて再度お試しください。');
    } finally {
      setDeletingId(null);
    }
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
          <h1 className="text-3xl font-bold mb-2 text-gray-900">料理メモ</h1>
          <p className="text-gray-600">保存したレシピのメモ一覧</p>
        </div>

        {memos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">まだメモがありません</p>
            <p className="text-sm text-gray-500">
                  レシピページから「共有」ボタンをタップして、このアプリを選択してください
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {memos.map((memo) => (
              <div
                key={memo.id}
                onClick={() => handleMemoClick(memo)}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow relative"
              >
                <button
                  onClick={(e) => handleDelete(e, memo)}
                  disabled={deletingId === memo.id}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  title="削除"
                >
                  {deletingId === memo.id ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
                <h2 className="text-xl font-semibold mb-2 text-gray-900 pr-8">{memo.title}</h2>
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

