import { GameState, GameAction } from "../types";

export const initialState: GameState = {
  phase: "betting",
  playerHand: [],
  dealerHand: [],
  betAmount: 0,
  balance: 2000,
  wins: 0,
  losses: 0,
  dealerCardVisible: false,
  modalMessage: null,
  betInput: "",
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "SET_USER_DATA":
      return { ...state, ...action.payload };
    case "UPDATE_BET_INPUT":
      return { ...state, betInput: action.payload };
    case "PLACE_BET":
      return {
        ...state,
        balance: state.balance - action.payload,
        betAmount: action.payload,
      };
    case "START_GAME":
      return {
        ...state,
        phase: "playing",
        playerHand: action.payload.playerHand,
        dealerHand: action.payload.dealerHand,
      };
    case "PLAYER_HITS":
      return {
        ...state,
        playerHand: [...state.playerHand, action.payload],
      };
    case "DEALER_REVEALS":
      return { ...state, dealerCardVisible: true };
    case "DEALER_HITS":
      return { ...state, dealerHand: [...state.dealerHand, action.payload] };
    case "END_GAME":
      return {
        ...state,
        phase: "gameOver",
        modalMessage: action.payload.message,
        balance: action.payload.newBalance,
        wins: action.payload.newWins,
        losses: action.payload.newLosses,
      };
    case "RESET_GAME":
      return {
        ...state,
        phase: "betting",
        playerHand: [],
        dealerHand: [],
        betAmount: 0,
        dealerCardVisible: false,
        modalMessage: null,
        betInput: "",
      };
    default:
      return state;
  }
};
