import { useEffect, useState } from "react";
import * as React from "react";
import DeckOfCardsService from "../Services/DeckOfCardsService";
import Scoreboard from "../Components/Scoreboard";
import { Box, Button, TextField, Typography } from "@mui/material";
import { auth, db } from "../Firebase";
import { ref, get, set, update, push } from "firebase/database";

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

    const addSingleAce = (value: number) => {
        const isOver21 = value + 11 <= 21;
        return isOver21 ? 11 : 1;
    }

    // handle aces
    if (aces > 0) {
        value += aces - 1;
        value += addSingleAce(value);
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
    const [amount, setAmount] = useState(100);
    const [wins, setWins] = useState(0);
    const [losses, setLosses] = useState(0);

    function finishGame(amount: number, wins: number, losses: number) {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        setAmount(amount)
        setWins(wins)
        setLosses(losses)

        const userRef = ref(db, `users/${uid}`);
        update(userRef, { balance: amount, wins: wins, losses: losses });
        push(ref(db, `users/${uid}/history`), { ts: Date.now(), balance: amount });
    }

    function handleLoss() {
        setGameState('lost');
        finishGame(amount, wins, losses + 1);
    }

    function handleTie() {
        setGameState('tie');
        finishGame(amount + betAmount, wins, losses);
    }

    function handleWin() {
        setGameState('win');
        finishGame(amount + (betAmount * 2), wins, losses);
    }

    function checkGameStatus(playerHand: string[], botHand: string[]) {
        const playerValue = calculateHandValue(playerHand);
        const botValue = calculateHandValue(botHand);

        const rules: [() => boolean, () => void][] = [
            [() => botValue > 21, handleWin],
            [() => playerValue > 21 || (gameState === 'botRound' && botValue > playerValue), handleLoss],
            [() => gameState === 'botRound' && botValue === playerValue, handleTie],
        ];

        rules.find(([condition]) => condition())?.[1]();
    }

    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const userRef = ref(db, `users/${uid}`);
        get(userRef).then(s => {
            if (s.exists()) {
                const data = s.val();
                setAmount(data.balance ?? 100);
                setWins(data.wins ?? 0);
                setLosses(data.losses ?? 0);
            } else {
                set(userRef, { balance: 100, wins: 0, losses: 0, name: auth.currentUser?.email || uid });
            }
        });
    }, []);

    async function pullCard() {
        return (await cardService.drawCards(1)).cards[0].code;
    }

    async function onHit() {
        const card = await pullCard();
        const tempPlayerHand = [...playerHand, card];
        setPlayerHand(tempPlayerHand);
        checkGameStatus(tempPlayerHand, botHand)
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
        checkGameStatus(playerHand, tempBotHand)
    }

    const startNewGame = async () => {
        setGameState("beginning");
        setBetPlaced(false);
        setBetInput("");
        setBetAmount(0);
        if (amount === 0) {
            setAmount(100);
        }
    };

    const handleBet = async () => {
        const parsedBet = Number(betInput);
        if (parsedBet > 0 && parsedBet <= amount) {
            setAmount(prev => prev - parsedBet);
            setBetAmount(parsedBet);
            setBetPlaced(true);
            await cardService.createDeck();
            setPlayerHand([await pullCard(), await pullCard()]);
            setBotHand([await pullCard(), await pullCard()]);
            setGameState("playerRound");
        } else {
            alert("Ungültiger Einsatz.");
        }
    };

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
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: 2,
                padding: 1,
            }}>
                <Scoreboard />
            </Box>

            {/* Zentrum: Einsatzanzeige */}
            <Box sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'end',
                alignItems: 'center',
                marginBottom: "1rem"
            }}>
                {betPlaced && (
                    <Typography sx={{ mt: 2, fontSize: '2rem' }}>
                        Einsatz: {betAmount}
                        bot: {calculateHandValue(botHand)}
                        player: {calculateHandValue(playerHand)}
                    </Typography>
                )}
            </Box>

            {/* Unterer Balken */}
            <Box sx={{
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                {/* Links: Eingabe, Bet, Money */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Typography sx={{ mt: 2, fontSize: '2rem' }}>Money: {amount}</Typography>

                    {!betPlaced && (
                        <>
                            <TextField
                                variant="outlined"
                                size="medium"
                                placeholder="Eingabe"
                                type="number"
                                value={betInput}
                                onChange={(e) => setBetInput(e.target.value)}
                                inputProps={{ min: 1, max: amount }}
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
                                onClick={handleBet}
                                disabled={Number(betInput) <= 0 || Number(betInput) > amount}
                                sx={{
                                    opacity: Number(betInput) > amount ? 0.4 : 1,
                                    width: 130,
                                    height: 130,
                                    borderRadius: '50%',
                                    minWidth: 0,
                                    padding: 0,
                                    backgroundImage: 'url(/blueChip.png)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            />
                        </>
                    )}
                </Box>

                {/* Rechts: Buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {betPlaced && (gameState === "playerRound") && (
                        <>
                            <Button
                                onClick={onHit}
                                sx={{
                                    width: 130,
                                    height: 130,
                                    borderRadius: '50%',
                                    minWidth: 0,
                                    padding: 0,
                                    backgroundImage: 'url(/greenChip.png)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            />
                            <Button
                                onClick={onStand}
                                sx={{
                                    width: 130,
                                    height: 130,
                                    borderRadius: '50%',
                                    minWidth: 0,
                                    padding: 0,
                                    backgroundImage: 'url(/redChip.png)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            />
                        </>
                    )}
                    {(gameState === "win" || gameState === "lost" || gameState === "tie") && (
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: '8rem', // 3rem Padding + Button-Höhe + Abstand
                                right: '1rem',
                            }}
                        >
                            <Button
                                onClick={startNewGame}
                                sx={{
                                    width: 130,
                                    height: 130,
                                    borderRadius: '50%',
                                    minWidth: 0,
                                    padding: 0,
                                    backgroundImage: 'url(/blackChip.png)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                }}
                            />
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
