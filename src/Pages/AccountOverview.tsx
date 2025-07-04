import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { auth, db } from "../Firebase";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
} from "firebase/firestore";
import { Link } from "react-router-dom";

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

    const userDocRef = doc(db, "users", uid);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      const data = doc.data();
      if (data) {
        setBalance(data.balance || 0);
        setWins(data.wins || 0);
        setLosses(data.losses || 0);
      }
    });

    const historyCollectionRef = collection(
      db,
      "users",
      uid,
      "gameHistory"
    );
    const q = query(historyCollectionRef, orderBy("timestamp", "asc"));
    const unsubscribeHistory = onSnapshot(q, (querySnapshot) => {
      const list: HistoryEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          ts: new Date(data.timestamp).getTime(),
          balance: data.finalBalance,
        });
      });
      setHistory(list);
    });

    return () => {
      unsubscribeUser();
      unsubscribeHistory();
    };
  }, []);

  const width = 500;
  const height = 250;
  const maxBal = Math.max(...history.map((h) => h.balance), balance);
  const pts = history
    .map((h, i) => {
      const x = (i / Math.max(history.length - 1, 1)) * width;
      const y = height - (h.balance / maxBal) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Box
      sx={{
        p: 4,
        color: "white",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #232526 0%, #414345 100%)",
        position: "relative",
      }}
    >
      <Tooltip title="Back to Game">
        <IconButton
          component={Link}
          to="/"
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            color: "white",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>

      <Typography
        variant="h3"
        gutterBottom
        align="center"
        sx={{ fontWeight: "bold", mb: 4, textShadow: "2px 2px 4px #000000" }}
      >
        Account Overview
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              textAlign: "center",
              backgroundColor: "rgba(0,0,0,0.2)",
              color: "white",
              borderRadius: "12px",
            }}
          >
            <Typography variant="h6">Balance</Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              ${balance}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              textAlign: "center",
              backgroundColor: "rgba(0, 255, 0, 0.1)",
              color: "white",
              borderRadius: "12px",
            }}
          >
            <Typography variant="h6">Wins</Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {wins}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              textAlign: "center",
              backgroundColor: "rgba(255, 0, 0, 0.1)",
              color: "white",
              borderRadius: "12px",
            }}
          >
            <Typography variant="h6">Losses</Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {losses}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper
        elevation={3}
        sx={{
          mt: 4,
          p: 3,
          backgroundColor: "rgba(0,0,0,0.2)",
          borderRadius: "12px",
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ color: "white" }}>
          Balance History
        </Typography>
        <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(0, 255, 255, 0.5)" />
              <stop offset="100%" stopColor="rgba(0, 255, 255, 0)" />
            </linearGradient>
          </defs>
          <polyline
            fill="url(#gradient)"
            stroke="cyan"
            strokeWidth="3"
            points={`0,${height} ${pts} ${width},${height}`}
          />
        </svg>
      </Paper>
    </Box>
  );
}