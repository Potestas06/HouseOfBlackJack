import { useEffect, useState } from "react";
import * as React from "react";
import DeckOfCardsService from "../Services/DeckOfCardsService";
import Scoreboard from "../Components/Scoreboard"; // Stelle sicher, dass dein Scoreboard importiert wird
import { Box, Button, TextField, Typography } from "@mui/material";

type GameState = "beginning" | "playerRound" | "botRound" | "win" | "lost" | "tie";

function calculateHandValue(hand: string[]) {
    let value = 0;
    let aces = 0;

    hand.forEach(card => {
        let firstCardId = card[0];
        if (firstCardId === 'A') {
            aces += 1;
        } else if (['K', 'Q', 'J', '0'].includes(firstCardId)) {
            value += 10;
        } else {
            value += parseInt(firstCardId);
        }
    });

    for (let i = 0; i < aces; i++) {
        if (value + 11 <= 21) {
            value += 11;
        } else {
            value += 1;
        }
    }
    return value;
}

export default function GameField() {
    const [cardService] = useState<DeckOfCardsService>(new DeckOfCardsService());
    const [gameState, setGameState] = useState<GameState>('beginning');
    const [playerHand, setPlayerHand] = useState<string[]>([]);
    const [botHand, setBotHand] = useState<string[]>([]);
    const [betPlaced, setBetPlaced] = useState(false);
    const [betInput, setBetInput] = useState("");
    const [betAmount, setBetAmount] = useState(0);

    async function pullCard() {
        return (await cardService.drawCards(1)).cards[0].code;
    }

    async function onHit() {
        const card = await pullCard();
        setPlayerHand([...playerHand, card]);
    }

    async function onStand() {
        setGameState("botRound");
        let botTotal = calculateHandValue(botHand);
        const playerTotal = calculateHandValue(playerHand);
        let tempBotHand = [...botHand];

        while (botTotal < playerTotal && botTotal < 21) {
            const card = await pullCard();
            tempBotHand.push(card);
            botTotal = calculateHandValue(tempBotHand);
        }
        setBotHand(tempBotHand);
    }

    const startNewGame = async () => {
        setGameState("beginning");
        setBetPlaced(false);
        setBetInput("");
        setBetAmount(0);
    };

    const handleBet = async () => {
        setBetAmount(Number(betInput));
        setBetPlaced(true);
        await cardService.createDeck();
        setPlayerHand([await pullCard(), await pullCard()]);
        setBotHand([await pullCard(), await pullCard()]);
        setGameState("playerRound");
    };

    useEffect(() => {
        const playerValue = calculateHandValue(playerHand);
        const botValue = calculateHandValue(botHand);

        if (botValue > 21) setGameState('win');
        else if (playerValue > 21 || (botValue > playerValue && gameState === 'botRound')) setGameState('lost');
        else if (playerValue === botValue && gameState === 'botRound') setGameState('tie');
    }, [playerHand, botHand, gameState]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                width: '100%',
                backgroundImage: `url(/teppich.png)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                color: 'white',
            }}
        >
            {/* Scoreboard links oben */}
            <Box sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: 2,
                padding: 1,
            }}>
                <Scoreboard />
            </Box>

            {/* Zentrum: Spieltitel + Einsatz */}
            <Box sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Gamefield (Blackjack)</Typography>
                {betPlaced && (
                    <Typography sx={{ mt: 2, fontSize: '1.2rem' }}>
                        Einsatz: {betAmount}
                    </Typography>
                )}
            </Box>

            {/* Unterer Balken */}
            <Box sx={{
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                {/* Links: Eingabe, Bet, Money */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Typography>Money: 100</Typography>

                    {!betPlaced && (
                        <>
                            <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Eingabe"
                                value={betInput}
                                onChange={(e) => setBetInput(e.target.value)}
                                sx={{
                                    input: { color: 'white' },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'white',
                                        },
                                    },
                                    width: 100,
                                }}
                            />
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleBet}
                            >
                                Bet
                            </Button>
                        </>
                    )}
                </Box>

                {/* Mitte: leer oder Einsatz wird oben gezeigt */}

                {/* Rechts: Buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {betPlaced && (gameState === "playerRound") && (
                        <>
                            <Button
                                variant="contained"
                                onClick={onHit}
                                sx={{ borderRadius: '50%' }}
                            >
                                Hit
                            </Button>
                            <Button
                                variant="contained"
                                onClick={onStand}
                                sx={{ borderRadius: '50%' }}
                            >
                                Stand
                            </Button>
                        </>
                    )}
                    {(gameState === "win" || gameState === "lost" || gameState === "tie") && (
                        <Button
                            variant="outlined"
                            onClick={startNewGame}
                            sx={{ ml: 2 }}
                        >
                            New Game
                        </Button>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
