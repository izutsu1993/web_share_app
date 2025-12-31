'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { saveMemo, getMemo, Memo } from '@/lib/firestore';
import MemoEditor from '@/components/MemoEditor';

function ShareTargetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [memo, setMemo] = useState<Memo | null>(null);
  const [loadingMemo, setLoadingMemo] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // 認証が完了するまで待つ
      return;
    }

    // 共有されたURLを取得
    const sharedUrl = searchParams.get('url') || searchParams.get('text');
    const title = searchParams.get('title') || '無題のメモ';

    if (!sharedUrl) {
      router.push('/');
      return;
    }

    // URLをキーとしてメモを取得または作成
    const loadMemo = async () => {
      try {
        setLoadingMemo(true);
        const existingMemo = await getMemo(user.uid, sharedUrl);
        if (existingMemo) {
          setMemo(existingMemo);
        } else {
          // 新規メモ作成
          setMemo({
            url: sharedUrl,
            title: title,
            content: '',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      } catch (error) {
        console.error('メモの読み込みエラー:', error);
        alert('メモの読み込みに失敗しました');
      } finally {
        setLoadingMemo(false);
      }
    };

    loadMemo();
  }, [searchParams, user, authLoading, router]);

  const handleSave = async (title: string, content: string) => {
    if (!user || !memo) return;

    try {
      setSaving(true);
      await saveMemo(user.uid, memo.url, {
        title: title,
        content: content,
        updatedAt: new Date()
      });
      // 保存後、メモ一覧に戻る
      router.push('/');
    } catch (error) {
      console.error('保存エラー:', error);
      // エラーの詳細を表示（Firebaseエラーに対応）
      let errorMessage = '保存に失敗しました';
      
      // Firebaseエラーの場合
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message: string };
        errorMessage += `\n\nコード: ${firebaseError.code}\nメッセージ: ${firebaseError.message}`;
      } else if (error instanceof Error) {
        errorMessage += `\n\nエラー: ${error.message}`;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage += `\n\nエラー: ${JSON.stringify(error, null, 2)}`;
      } else {
        errorMessage += `\n\nエラー: ${String(error)}`;
      }
      
      // alertは改行を正しく表示しない場合があるため、consoleにも出力
      console.error('詳細エラー:', errorMessage);
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingMemo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!memo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">メモが見つかりません</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <a
            href={memo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline mb-6 block break-all"
          >
            {memo.url}
          </a>
          <MemoEditor
            initialTitle={memo.title}
            initialContent={memo.content}
            onSave={handleSave}
            isLoading={saving}
          />
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← メモ一覧に戻る
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShareTargetPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    }>
      <ShareTargetContent />
    </Suspense>
  );
}

