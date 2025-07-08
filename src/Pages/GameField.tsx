import { useEffect, useReducer, useMemo } from "react";
import * as React from "react";
import Scoreboard from "../Components/Scoreboard";
import { Box, Button, TextField, Typography } from "@mui/material";
import MessageModal from "../Components/MessageModal";
import {
  calculateHandValue,
  determineWinner,
} from "../Services/GameLogic";
import { gameReducer } from "../Services/GameReducer";
import {
  loadUserData,
  placeBet,
  playerHits,
  saveGameResult,
} from "../Services/GameService";
import { Card, GamePhase, GameState } from "../types";
import DeckOfCardsService from "../Services/DeckOfCardsService";

const initialState: GameState = {
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

// ==================================================================================
// UI Components
// ==================================================================================

const CardComponent = React.memo(
  ({
    card,
    isFlipped,
    angle,
    x,
    y,
    isAnimated,
  }: {
    card: Card;
    isFlipped: boolean;
    angle: number;
    x: number;
    y: number;
    isAnimated: boolean;
  }) => {
    const cardStyle = useMemo(
      () => ({
        height: "150px",
        margin: "0.5rem",
        perspective: "1000px",
        position: "absolute" as const,
        transform: `rotate(${angle}deg) translate(${x}px, ${y}px)`,
        transition: isAnimated ? "transform 0.5s" : "none",
      }),
      [angle, x, y, isAnimated]
    );

    const innerStyle = useMemo(
      () => ({
        transformStyle: "preserve-3d" as const,
        transition: "transform 0.6s",
        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        width: "100%",
        height: "100%",
      }),
      [isFlipped]
    );

    const cardFaceStyle = useMemo(
      () => ({
        position: "absolute" as const,
        width: "100%",
        height: "100%",
        backfaceVisibility: "hidden" as const,
      }),
      []
    );

    return (
      <div className={`card ${isFlipped ? "is-flipped" : ""}`} style={cardStyle}>
        <div className="card-inner" style={innerStyle}>
          <div className="card-front" style={cardFaceStyle}>
            <img
              src="https://deckofcardsapi.com/static/img/back.png"
              alt="Card Back"
              style={{ height: "150px" }}
            />
          </div>
          <div
            className="card-back"
            style={{ ...cardFaceStyle, transform: "rotateY(180deg)" }}
          >
            <img src={card.image} alt={card.code} style={{ height: "150px" }} />
          </div>
        </div>
      </div>
    );
  }
);

const Hand = React.memo(
  ({
    cards,
    isDealer,
    dealerCardVisible,
  }: {
    cards: Card[];
    isDealer: boolean;
    dealerCardVisible: boolean;
  }) => {
    const cardAngle = 15;
    const startAngle = -((cards.length - 1) * cardAngle) / 2;

    const renderedCards = useMemo(
      () =>
        cards.map((card, index) => {
          const angle = startAngle + index * cardAngle;
          const x = index * 30;
          const y = Math.abs(index - (cards.length - 1) / 2) * 10;
          const isFlipped = isDealer ? index === 0 || dealerCardVisible : true;

          return (
            <CardComponent
              key={`${card.code}-${index}`}
              card={card}
              isFlipped={isFlipped}
              angle={angle}
              x={x}
              y={y}
              isAnimated={false}
            />
          );
        }),
      [cards, isDealer, dealerCardVisible, startAngle, cardAngle]
    );

    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          height: "200px",
        }}
      >
        {renderedCards}
      </Box>
    );
  }
);

const CardStack = React.memo(
  ({ onCardDrawn, phase }: { onCardDrawn: () => void; phase: GamePhase }) => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        padding: "2rem",
        cursor: phase === "playing" ? "pointer" : "default",
        opacity: phase === "playing" ? 1 : 0.6,
      }}
      onClick={phase === "playing" ? onCardDrawn : undefined}
    >
      <img
        src="https://deckofcardsapi.com/static/img/back.png"
        alt="Card Stack"
        style={{
          height: "150px",
          filter: phase === "playing" ? "none" : "grayscale(50%)",
        }}
      />
    </Box>
  )
);

// ==================================================================================
// Main Game Component
// ==================================================================================

export default function GameField() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const {
    phase,
    playerHand,
    dealerHand,
    betAmount,
    balance,
    wins,
    losses,
    dealerCardVisible,
    modalMessage,
    betInput,
  } = state;

  const cardService = useMemo(() => new DeckOfCardsService(), []);

  const playerValue = useMemo(() => calculateHandValue(playerHand), [playerHand]);
  const dealerValue = useMemo(
    () => calculateHandValue(dealerHand, true, dealerCardVisible),
    [dealerHand, dealerCardVisible]
  );

  useEffect(() => {
    loadUserData(dispatch);
  }, []);

  useEffect(() => {
    if (playerValue > 21 && phase === "playing") {
      const newBalance = balance;
      const newLosses = losses + 1;
      dispatch({
        type: "END_GAME",
        payload: {
          outcome: "loss",
          message: `You Lost ${betAmount}`,
          newBalance,
          newLosses,
          newWins: wins,
        },
      });
    }
  }, [playerValue, balance, losses, betAmount, wins, phase]);

  useEffect(() => {
    if (dealerCardVisible && phase === "playing") {
      const dealerTurn = async () => {
        let currentDealerHand = [...dealerHand];
        let currentDealerValue = calculateHandValue(
          currentDealerHand,
          true,
          true
        );

        while (currentDealerValue < 17) {
          const data = await cardService.drawCards(1);
          currentDealerHand.push(data.cards[0]);
          dispatch({ type: "DEALER_HITS", payload: data.cards[0] });
          currentDealerValue = calculateHandValue(
            currentDealerHand,
            true,
            true
          );
          await new Promise((res) => setTimeout(res, 500));
        }

        const finalPlayerValue = calculateHandValue(playerHand);
        const outcome = determineWinner(
          finalPlayerValue,
          currentDealerValue,
          true
        );

        const outcomeMapping = {
          win: {
            message: `You Won ${betAmount * 2}`,
            newBalance: balance + betAmount * 2,
            newWins: wins + 1,
            newLosses: losses,
          },
          loss: {
            message: `You Lost ${betAmount}`,
            newBalance: balance,
            newWins: wins,
            newLosses: losses + 1,
          },
          tie: {
            message: "It's a Tie!",
            newBalance: balance + betAmount,
            newWins: wins,
            newLosses: losses,
          },
        };

        const result = outcome.isWin
          ? "win"
          : outcome.isLoss
          ? "loss"
          : "tie";

        dispatch({
          type: "END_GAME",
          payload: { ...outcomeMapping[result] },
        });
      };
      dealerTurn();
    }
  }, [
    dealerCardVisible,
    dealerHand,
    playerHand,
    cardService,
    balance,
    betAmount,
    wins,
    losses,
    phase,
  ]);

  useEffect(() => {
    if (phase === "gameOver") {
      saveGameResult(state);
    }
  }, [phase, state]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        backgroundImage: `url(/teppich.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        color: "white",
      }}
    >
      {modalMessage && (
        <MessageModal
          message={modalMessage}
          onClose={() => dispatch({ type: "RESET_GAME" })}
        />
      )}

      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          borderRadius: 2,
          padding: 1,
        }}
      >
        <Scoreboard balance={balance} />
      </Box>

      <Hand
        cards={dealerHand}
        isDealer={true}
        dealerCardVisible={dealerCardVisible}
      />
      <CardStack
        onCardDrawn={() => playerHits(dispatch)}
        phase={phase}
      />
      <Hand cards={playerHand} isDealer={false} dealerCardVisible={false} />

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "end",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        {phase !== "betting" && (
          <Typography sx={{ mt: 2, fontSize: "2rem" }}>
            Bet: {betAmount} | Dealer: {dealerValue} | Player: {playerValue}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          width: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Typography sx={{ mt: 2, fontSize: "2rem" }}>
            Balance: {balance}
          </Typography>

          {phase === "betting" && (
            <>
              <TextField
                variant="outlined"
                size="medium"
                placeholder="Bet"
                type="number"
                value={betInput}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_BET_INPUT",
                    payload: e.target.value,
                  })
                }
                inputProps={{ min: 1, max: balance }}
                sx={{
                  input: { color: "white" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "white",
                    },
                  },
                  width: 100,
                }}
              />
              <Button
                onClick={() => placeBet(dispatch, betInput, balance)}
                disabled={
                  !(Number(betInput) > 0 && Number(betInput) <= balance)
                }
                sx={{
                  width: 130,
                  height: 130,
                  borderRadius: "50%",
                  backgroundImage: "url(/blueChip.png)",
                  backgroundSize: "cover",
                }}
              />
            </>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          {phase === "playing" && (
            <>
              <Button
                onClick={() => playerHits(dispatch)}
                sx={{
                  width: 130,
                  height: 130,
                  borderRadius: "50%",
                  backgroundImage: "url(/greenChip.png)",
                  backgroundSize: "cover",
                }}
              />
              <Button
                onClick={() => dispatch({ type: "DEALER_REVEALS" })}
                sx={{
                  width: 130,
                  height: 130,
                  borderRadius: "50%",
                  backgroundImage: "url(/redChip.png)",
                  backgroundSize: "cover",
                }}
              />
            </>
          )}
          {phase === "gameOver" && (
            <Button
              onClick={() => dispatch({ type: "RESET_GAME" })}
              sx={{
                width: 130,
                height: 130,
                borderRadius: "50%",
                backgroundImage: "url(/blackChip.png)",
                backgroundSize: "cover",
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}