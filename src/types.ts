export type GamePhase = "betting" | "playing" | "gameOver";

export type Card = {
  code: string;
  image: string;
};

export type GameState = {
  phase: GamePhase;
  playerHand: Card[];
  dealerHand: Card[];
  betAmount: number;
  balance: number;
  wins: number;
  losses: number;
  dealerCardVisible: boolean;
  modalMessage: string | null;
  betInput: string;
};

export type GameAction =
  | { type: "SET_USER_DATA"; payload: { balance: number; wins: number; losses: number } }
  | { type: "PLACE_BET"; payload: number }
  | { type: "START_GAME"; payload: { playerHand: Card[]; dealerHand: Card[] } }
  | { type: "PLAYER_HITS"; payload: Card }
  | { type: "DEALER_REVEALS" }
  | { type: "DEALER_HITS"; payload: Card }
  | { type: "END_GAME"; payload: { outcome: "win" | "loss" | "tie"; message: string; newBalance: number; newWins: number; newLosses: number } }
  | { type: "RESET_GAME" }
  | { type: "UPDATE_BET_INPUT"; payload: string };
