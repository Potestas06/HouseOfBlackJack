import { doc, getDoc, setDoc, updateDoc, increment, collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../Firebase";

export const ensureUserDocument = async (user: any) => {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, { balance: 2000, email: user.email, lastBet: 100 });
  }
};

export const updateBalance = async (uid: string, delta: number) => {
  if (!uid) return;
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { balance: increment(delta) });
};

export const getLeaderboard = async () => {
  const q = query(collection(db, "users"), orderBy("balance", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
};

export const getLastBet = async (uid: string): Promise<number> => {
  if (!uid) return 100;
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const data = snap.data() as any;
    return data.lastBet ?? 100;
  }
  return 100;
};

export const setLastBet = async (uid: string, bet: number) => {
  if (!uid) return;
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { lastBet: bet });
};
