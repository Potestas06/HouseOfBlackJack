import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../Firebase";

export const ensureUserDocument = async (user: any) => {
  if (!user) return;
  const ref = doc(db, "users", user.uid);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        balance: 2000,
        email: user.email,
        username: user.displayName || user.email?.split("@")[0] || "Anonymous",
        lastBet: 100,
      });
    } else if (!snap.data().username) {
      await updateDoc(ref, {
        username: user.displayName || user.email?.split("@")[0] || "Anonymous",
      });
    }
  } catch (e) {
    console.error("ensureUserDocument", e);
  }
};

export const updateBalance = async (user: any, delta: number) => {
  if (!user) return;
  const ref = doc(db, "users", user.uid);
  try {
    await updateDoc(ref, { balance: increment(delta) });
  } catch (e) {
    await ensureUserDocument(user);
    try {
      await updateDoc(ref, { balance: increment(delta) });
    } catch (err) {
      console.error("updateBalance", err);
    }
  }
};

export const getLeaderboard = async () => {
  try {
    const q = query(collection(db, "users"), orderBy("balance", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  } catch (e) {
    console.error("getLeaderboard", e);
    return [];
  }
};

export const getLastBet = async (uid: string): Promise<number> => {
  if (!uid) return 100;
  const ref = doc(db, "users", uid);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as any;
      return data.lastBet ?? 100;
    }
  } catch (e) {
    console.error("getLastBet", e);
  }
  return 100;
};

export const setLastBet = async (user: any, bet: number) => {
  if (!user) return;
  const ref = doc(db, "users", user.uid);
  try {
    await updateDoc(ref, { lastBet: bet });
  } catch (e) {
    await ensureUserDocument(user);
    try {
      await updateDoc(ref, { lastBet: bet });
    } catch (err) {
      console.error("setLastBet", err);
    }
  }
};
