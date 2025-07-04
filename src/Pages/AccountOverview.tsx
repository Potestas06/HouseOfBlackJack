import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { auth, db } from "../Firebase";
import { doc, collection, getDoc, onSnapshot } from "firebase/firestore";

interface HistoryEntry {
  ts: number;
  balance: number;
}

export default function AccountOverview() {
  const [balance, setBalance] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const userRef = ref(db, `users/${uid}`);
    onValue(userRef, snap => {
      const data = snap.val() || {};
      setBalance(data.balance || 0);
      setWins(data.wins || 0);
      setLosses(data.losses || 0);
    });
    const hRef = ref(db, `users/${uid}/history`);
    onValue(hRef, snap => {
      const list: HistoryEntry[] = [];
      snap.forEach(c => list.push(c.val()));
      list.sort((a, b) => a.ts - b.ts);
      setHistory(list);
    });
  }, []);

  const width = 300;
  const height = 150;
  const maxBal = Math.max(...history.map(h => h.balance), balance);
  const pts = history.map((h, i) => {
    const x = (i / Math.max(history.length - 1, 1)) * width;
    const y = height - (h.balance / maxBal) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <Box sx={{ p: 2, color: "white" }}>
      <Typography variant="h5" gutterBottom>Account Overview</Typography>
      <Typography>Balance: {balance}</Typography>
      <Typography>Wins: {wins}</Typography>
      <Typography>Losses: {losses}</Typography>
      <svg width={width} height={height} style={{ marginTop: 16 }}>
        <polyline fill="none" stroke="cyan" strokeWidth="2" points={pts} />
      </svg>
    </Box>
  );
}