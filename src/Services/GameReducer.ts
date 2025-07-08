import { GameState, GameAction } from "../types";

type Handler<K extends GameAction["type"]> = (
  state: GameState,
  action: Extract<GameAction, { type: K }>
) => GameState;

const handlers: { [T in GameAction["type"]]: Handler<T> } = {
  SET_USER_DATA: (s, action) => ({ ...s, ...action.payload }),
  UPDATE_BET_INPUT: (s, action) => ({ ...s, betInput: action.payload }),
  PLACE_BET: (s, action) => ({
    ...s,
    balance: s.balance - action.payload,
    betAmount: action.payload,
  }),
  START_GAME: (s, action) => ({
    ...s,
    phase: "playing",
    playerHand: action.payload.playerHand,
    dealerHand: action.payload.dealerHand,
  }),
  PLAYER_HITS: (s, action) => ({
    ...s,
    playerHand: [...s.playerHand, action.payload],
  }),
  DEALER_REVEALS: (s) => ({ ...s, dealerCardVisible: true }),
  DEALER_HITS: (s, action) => ({
    ...s,
    dealerHand: [...s.dealerHand, action.payload],
  }),
  END_GAME: (s, action) => ({
    ...s,
    phase: "gameOver",
    modalMessage: action.payload.message,
    balance: action.payload.newBalance,
    wins: action.payload.newWins,
    losses: action.payload.newLosses,
  }),
  RESET_GAME: (s) => ({
    ...s,
    phase: "betting",
    playerHand: [],
    dealerHand: [],
    betAmount: 0,
    dealerCardVisible: false,
    modalMessage: null,
    betInput: "",
  }),
};

export const gameReducer = (
  state: GameState,
  action: GameAction
): GameState => {
  const fn = handlers[action.type];
  return fn ? fn(state, action as any) : state;
};
