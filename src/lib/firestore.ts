import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy
} from 'firebase/firestore';

export interface Memo {
  id?: string;
  url: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// URLをキーとしてメモを取得
export async function getMemo(userId: string, url: string): Promise<Memo | null> {
  try {
    const memosRef = collection(db, 'memos');
    const q = query(memosRef, where('userId', '==', userId), where('url', '==', url));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const docData = querySnapshot.docs[0].data();
    return {
      id: querySnapshot.docs[0].id,
      url: docData.url,
      title: docData.title,
      content: docData.content,
      createdAt: docData.createdAt.toDate(),
      updatedAt: docData.updatedAt.toDate()
    };
  } catch (error) {
    console.error('メモ取得エラー:', error);
    throw error;
  }
}

// メモを保存
export async function saveMemo(
  userId: string,
  url: string,
  memoData: { title: string; content: string; updatedAt: Date }
): Promise<void> {
  try {
    const memosRef = collection(db, 'memos');
    // URLをエンコードしてドキュメントIDに使用（特殊文字を安全に処理）
    const docId = `${userId}_${btoa(url).replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' }[m] || ''))}`;
    const docRef = doc(memosRef, docId);

    const existingDoc = await getDoc(docRef);
    const now = Timestamp.now();

    if (existingDoc.exists()) {
      // 更新時: updateDocを使用
      await updateDoc(docRef, {
        title: memoData.title,
        content: memoData.content,
        updatedAt: now
      });
    } else {
      // 新規作成時: setDocを使用
      await setDoc(docRef, {
        userId,
        url,
        title: memoData.title,
        content: memoData.content,
        createdAt: now,
        updatedAt: now
      });
    }
  } catch (error) {
    console.error('メモ保存エラー:', error);
    throw error;
  }
}

// ユーザーの全メモを取得
export async function getAllMemos(userId: string): Promise<Memo[]> {
  try {
    const memosRef = collection(db, 'memos');
    const q = query(
      memosRef, 
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        url: data.url,
        title: data.title,
        content: data.content,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      };
    });
  } catch (error) {
    console.error('メモ一覧取得エラー:', error);
    throw error;
  }
}

// メモを削除
export async function deleteMemo(userId: string, url: string): Promise<void> {
  try {
    const memosRef = collection(db, 'memos');
    const docId = `${userId}_${btoa(url).replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' }[m] || ''))}`;
    const docRef = doc(memosRef, docId);
    
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().userId === userId) {
      await deleteDoc(docRef);
    } else {
      throw new Error('メモが見つからないか、削除権限がありません');
    }
  } catch (error) {
    console.error('メモ削除エラー:', error);
    throw error;
  }
}

