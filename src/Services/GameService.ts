import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { auth, db } from "../Firebase";
import DeckOfCardsService from "./DeckOfCardsService";
import { GameState } from "../types";

const cardService = new DeckOfCardsService();

export const loadUserData = async (dispatch: React.Dispatch<any>) => {
  const user = auth.currentUser;
  if (user) {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      dispatch({
        type: "SET_USER_DATA",
        payload: {
          balance: data.balance ?? 2000,
          wins: data.wins ?? 0,
          losses: data.losses ?? 0,
        },
      });
    } else {
      const initialData = {
        balance: 2000,
        wins: 0,
        losses: 0,
        name: user.email || user.displayName || `User_${user.uid.slice(0, 6)}`,
        createdAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, initialData);
      dispatch({
        type: "SET_USER_DATA",
        payload: { balance: 2000, wins: 0, losses: 0 },
      });
    }
  } else {
    dispatch({
      type: "SET_USER_DATA",
      payload: { balance: 2000, wins: 0, losses: 0 },
    });
  }
};

export const placeBet = async (
  dispatch: React.Dispatch<any>,
  betInput: string,
  balance: number
) => {
  const parsedBet = Number(betInput);
  if (parsedBet > 0 && parsedBet <= balance) {
    dispatch({ type: "PLACE_BET", payload: parsedBet });
    await cardService.createDeck();
    const [player, dealer] = await Promise.all([
      cardService.drawCards(2),
      cardService.drawCards(2),
    ]);
    dispatch({
      type: "START_GAME",
      payload: { playerHand: player.cards, dealerHand: dealer.cards },
    });
  } else {
    alert("Invalid bet amount.");
  }
};

export const playerHits = async (dispatch: React.Dispatch<any>) => {
  const data = await cardService.drawCards(1);
  dispatch({ type: "PLAYER_HITS", payload: data.cards[0] });
};

export const saveGameResult = async (state: GameState) => {
  const user = auth.currentUser;
  if (user) {
    const { balance, wins, losses, betAmount, modalMessage, playerHand, dealerHand } = state;
    const playerValue = 0; // Replace with actual calculation if needed
    const dealerValue = 0; // Replace with actual calculation if needed

    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      balance,
      wins,
      losses,
      lastPlayed: new Date().toISOString(),
    });
    const historyRef = collection(db, "users", user.uid, "gameHistory");
    await addDoc(historyRef, {
      timestamp: new Date().toISOString(),
      finalBalance: balance,
      betAmount,
      result: modalMessage,
      playerValue,
      dealerValue,
      playerHand: playerHand.map((c) => c.code),
      dealerHand: dealerHand.map((c) => c.code),
    });
  }
};
