import { useEffect, useState, useCallback, useMemo } from "react";
import * as React from "react";
import DeckOfCardsService from "../Services/DeckOfCardsService";
import Scoreboard from "../Components/Scoreboard";
import { Box, Button, TextField, Typography } from "@mui/material";
import { auth, db } from "../Firebase";
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import MessageModal from "../Components/MessageModal";

type GameState = "beginning" | "ongoing" | "win" | "lost" | "tie";
type Card = {
    code: string;
    image: string;
};

// Functional utilities
const when = (condition: boolean) => (fn: Function) => condition ? fn() : undefined;
const unless = (condition: boolean) => (fn: Function) => !condition ? fn() : undefined;
const either = (condition: boolean) => (trueFn: Function) => (falseFn: Function) => condition ? trueFn() : falseFn();
const pipe = (...fns: Function[]) => (value: any) => fns.reduce((acc, fn) => fn(acc), value);

// Pure functions for card calculation
const getCardValue = (cardCode: string): { value: number; isAce: boolean } => {
    const firstChar = cardCode[0];
    return firstChar === 'A' 
        ? { value: 0, isAce: true }
        : ['K', 'Q', 'J', '0'].includes(firstChar)
        ? { value: 10, isAce: false }
        : { value: parseInt(firstChar), isAce: false };
};

const calculateAceValue = (currentValue: number): number => 
    currentValue + 11 <= 21 ? 11 : 1;

const calculateHandValue = (hand: Card[], isDealer: boolean = false, dealerCardVisible: boolean = false): number => {
    const visibleCards = hand.filter((_, index) => 
        !isDealer || index === 0 || dealerCardVisible
    );
    
    const { totalValue, aceCount } = visibleCards.reduce(
        (acc, card) => {
            const { value, isAce } = getCardValue(card.code);
            return isAce 
                ? { ...acc, aceCount: acc.aceCount + 1 }
                : { ...acc, totalValue: acc.totalValue + value };
        },
        { totalValue: 0, aceCount: 0 }
    );

    return aceCount === 0
        ? totalValue
        : totalValue + (aceCount - 1) + calculateAceValue(totalValue);
};

// Game outcome determination
const determineWinner = (playerValue: number, botValue: number, gameEnd: boolean = false) => ({
    isWin: botValue > 21 || (gameEnd && playerValue > botValue && playerValue <= 21),
    isLoss: playerValue > 21 || (gameEnd && botValue > playerValue && botValue <= 21),
    isTie: gameEnd && botValue === playerValue && playerValue <= 21
});

// Card Components
const CardComponent = React.memo(({ card, isFlipped, angle, x, y, isAnimated }: { 
    card: Card; 
    isFlipped: boolean; 
    angle: number; 
    x: number; 
    y: number; 
    isAnimated: boolean 
}) => {
    const cardStyle = useMemo(() => ({
        height: '150px',
        margin: '0.5rem',
        perspective: '1000px',
        position: 'absolute' as const,
        transform: `rotate(${angle}deg) translate(${x}px, ${y}px)`,
        transition: isAnimated ? 'transform 0.5s' : 'none'
    }), [angle, x, y, isAnimated]);

    const innerStyle = useMemo(() => ({
        transformStyle: 'preserve-3d' as const,
        transition: 'transform 0.6s',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        width: '100%',
        height: '100%'
    }), [isFlipped]);

    const cardFaceStyle = useMemo(() => ({
        position: 'absolute' as const,
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden' as const
    }), []);

    return (
        <div className={`card ${isFlipped ? 'is-flipped' : ''}`} style={cardStyle}>
            <div className="card-inner" style={innerStyle}>
                <div className="card-front" style={cardFaceStyle}>
                    <img src="https://deckofcardsapi.com/static/img/back.png" alt="Card Back" style={{ height: '150px' }} />
                </div>
                <div className="card-back" style={{ ...cardFaceStyle, transform: 'rotateY(180deg)' }}>
                    <img src={card.image} alt={card.code} style={{ height: '150px' }} />
                </div>
            </div>
        </div>
    );
});

const Hand = React.memo(({ cards, isDealer, dealerCardVisible }: { 
    cards: Card[]; 
    isDealer: boolean; 
    dealerCardVisible: boolean 
}) => {
    const cardAngle = 15;
    const startAngle = -((cards.length - 1) * cardAngle) / 2;
    
    const renderedCards = useMemo(() => 
        cards.map((card, index) => {
            const angle = startAngle + index * cardAngle;
            const x = index * 30;
            const y = Math.abs(index - (cards.length - 1) / 2) * 10;
            const isFlipped = either(isDealer)(
                () => index === 0 || dealerCardVisible
            )(() => true);
            
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
        }), [cards, isDealer, dealerCardVisible, startAngle, cardAngle]
    );

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: '200px' }}>
            {renderedCards}
        </Box>
    );
});

const CardStack = React.memo(({ onCardDrawn, gameState }: { onCardDrawn: () => void; gameState: GameState }) => (
    <Box 
        sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            padding: '2rem',
            cursor: gameState === "ongoing" ? 'pointer' : 'default',
            opacity: gameState === "ongoing" ? 1 : 0.6
        }} 
        onClick={gameState === "ongoing" ? onCardDrawn : undefined}
    >
        <img 
            src="https://deckofcardsapi.com/static/img/back.png" 
            alt="Card Stack" 
            style={{ 
                height: '150px',
                filter: gameState === "ongoing" ? 'none' : 'grayscale(50%)'
            }} 
        />
    </Box>
));

export default function GameField() {
    const [cardService] = useState<DeckOfCardsService>(() => new DeckOfCardsService());
    const [gameState, setGameState] = useState<GameState>('beginning');
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [botHand, setBotHand] = useState<Card[]>([]);
    const [betPlaced, setBetPlaced] = useState(false);
    const [betInput, setBetInput] = useState("");
    const [betAmount, setBetAmount] = useState(0);
    const [amount, setAmount] = useState(2000);
    const [wins, setWins] = useState(0);
    const [losses, setLosses] = useState(0);
    const [dealerCardVisible, setDealerCardVisible] = useState(false);
    const [drawnCard, setDrawnCard] = useState<Card | null>(null);
    const [modalMessage, setModalMessage] = useState<string | null>(null);

    const playerValue = useMemo(() => calculateHandValue(playerHand), [playerHand]);
    const botValue = useMemo(() => calculateHandValue(botHand, true, dealerCardVisible), [botHand, dealerCardVisible]);

    // Fetch user data once on site load (Firestore)
    useEffect(() => {
        const loadUserData = async () => {
            const user = auth.currentUser;
            if (!user) {
                console.log("No user authenticated, using defaults");
                setAmount(2000);
                setWins(0);
                setLosses(0);
                return;
            }

            console.log("🔥 Loading user data from Firestore for:", user.uid);
            
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    console.log("✅ User data found:", data);
                    
                    // Replace local state with Firestore data
                    setAmount(data.balance ?? 2000);
                    setWins(data.wins ?? 0);
                    setLosses(data.losses ?? 0);
                } else {
                    console.log("➕ Creating new user in Firestore");
                    
                    // Create new user document
                    const initialData = {
                        balance: 2000,
                        wins: 0,
                        losses: 0,
                        name: user.email || user.displayName || `User_${user.uid.slice(0, 6)}`,
                        createdAt: new Date().toISOString(),
                        lastPlayed: new Date().toISOString()
                    };
                    
                    await setDoc(userDocRef, initialData);
                    console.log("✅ New user created successfully");
                    
                    // Set local state to initial values
                    setAmount(2000);
                    setWins(0);
                    setLosses(0);
                }
            } catch (error) {
                console.error("❌ Error with Firestore:", error);
                // Use defaults if Firestore fails
                setAmount(2000);
                setWins(0);
                setLosses(0);
                alert("Could not connect to database. Playing with default balance.");
            }
        };

        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                loadUserData();
            } else {
                // Reset to defaults when not authenticated
                setAmount(2000);
                setWins(0);
                setLosses(0);
            }
        });

        return () => unsubscribe();
    }, []);

    // Pure function for game finishing
    const createGameResult = useCallback((newAmount: number, newWins: number, newLosses: number, message: string) => ({
        amount: newAmount,
        wins: newWins,
        losses: newLosses,
        message
    }), []);

    const finishGame = useCallback(async (gameResult: any) => {
        const user = auth.currentUser;
        if (!user) {
            console.error("❌ No user authenticated when finishing game");
            return;
        }

        console.log("🎯 Game finished with result:", gameResult);
        
        // Update local state immediately (for instant UI response)
        setAmount(gameResult.amount);
        setWins(gameResult.wins);
        setLosses(gameResult.losses);
        setModalMessage(gameResult.message);

        // Write back to Firestore when modal appears
        try {
            console.log("💾 Saving to Firestore...", gameResult);
            
            const userDocRef = doc(db, "users", user.uid);
            
            // Update user stats in Firestore
            await updateDoc(userDocRef, { 
                balance: gameResult.amount, 
                wins: gameResult.wins, 
                losses: gameResult.losses,
                lastPlayed: new Date().toISOString()
            });
            
            // Add detailed game history
            const historyRef = collection(db, "users", user.uid, "gameHistory");
            await addDoc(historyRef, { 
                timestamp: new Date().toISOString(),
                finalBalance: gameResult.amount,
                betAmount: betAmount,
                result: gameResult.message,
                playerValue: playerValue,
                botValue: botValue,
                playerHand: playerHand.map(card => card.code),
                botHand: botHand.map(card => card.code)
            });
            
            console.log("✅ Game result saved to Firestore successfully!");
        } catch (error) {
            console.error("❌ Failed to save to Firestore:", error);
            console.log("🔄 Game continues with local state - will retry next time");
        }
    }, [betAmount, playerValue, botValue, playerHand, botHand]);

    const gameActions = useMemo(() => ({
        win: () => pipe(
            () => createGameResult(amount + (betAmount * 2), wins + 1, losses, `You Won ${betAmount * 2}`),
            (result: any) => { setGameState('win'); return result; },
            finishGame
        )(),
        loss: () => pipe(
            () => createGameResult(amount, wins, losses + 1, `You Lost ${betAmount}`),
            (result: any) => { setGameState('lost'); return result; },
            finishGame
        )(),
        tie: () => pipe(
            () => createGameResult(amount + betAmount, wins, losses, "It's a Tie!"),
            (result: any) => { setGameState('tie'); return result; },
            finishGame
        )()
    }), [amount, betAmount, wins, losses, createGameResult, finishGame]);

    const checkGameStatus = useCallback((playerHand: Card[], botHand: Card[], gameEnd: boolean = false) => {
        const playerValue = calculateHandValue(playerHand);
        const botValue = calculateHandValue(botHand, true, true);
        const outcome = determineWinner(playerValue, botValue, gameEnd);

        when(outcome.isWin)(gameActions.win);
        when(outcome.isLoss)(gameActions.loss);
        when(outcome.isTie)(gameActions.tie);
    }, [gameActions]);

    const pullCard = useCallback(async (): Promise<Card> => {
        try {
            const data = await cardService.drawCards(1);
            return either(data.cards && data.cards.length > 0)(
                () => data.cards[0]
            )(
                () => { throw new Error("Failed to draw a card from the API."); }
            );
        } catch (error) {
            console.error("Error drawing card:", error);
            throw error;
        }
    }, [cardService]);

    const drawMultipleCards = useCallback(async (count: number): Promise<Card[]> => {
        const promises = Array.from({ length: count }, () => pullCard());
        return Promise.all(promises);
    }, [pullCard]);

    const onHit = useCallback(async () => {
        unless(gameState === "ongoing")(() => { return; });

        try {
            const card = await pullCard();
            setDrawnCard(card);
            
            setTimeout(() => {
                setPlayerHand(prevHand => {
                    const newHand = [...prevHand, card];
                    checkGameStatus(newHand, botHand);
                    return newHand;
                });
                setDrawnCard(null);
            }, 500);
        } catch (error) {
            console.error("Error hitting:", error);
            alert("There was an error drawing a card. Please try again.");
        }
    }, [pullCard, checkGameStatus, botHand, gameState]);

    const onStand = useCallback(async () => {
        unless(gameState === "ongoing")(() => { return; });

        setDealerCardVisible(true);
        let botTotal = calculateHandValue(botHand, true, true);
        let tempBotHand = [...botHand];

        const drawDealerCard = async (): Promise<void> => {
            try {
                return either(botTotal < 16)(
                    async () => {
                        const card = await pullCard();
                        tempBotHand = [...tempBotHand, card];
                        setBotHand(tempBotHand);
                        botTotal = calculateHandValue(tempBotHand, true, true);
                        setTimeout(drawDealerCard, 500);
                    }
                )(
                    () => checkGameStatus(playerHand, tempBotHand, true)
                );
            } catch (error) {
                console.error("Error during dealer's turn:", error);
                alert("An error occurred during the dealer's turn. The game will reset.");
                startNewGame();
            }
        };

        setTimeout(drawDealerCard, 500);
    }, [botHand, playerHand, pullCard, checkGameStatus, gameState]);

    const resetGame = useCallback(() => {
        const resetActions = [
            () => setGameState("beginning"),
            () => setBetPlaced(false),
            () => setBetInput(""),
            () => setBetAmount(0),
            () => setDealerCardVisible(false),
            () => setPlayerHand([]),
            () => setBotHand([]),
            () => setModalMessage(null),
            () => setDrawnCard(null)
        ];
        
        resetActions.forEach(action => action());
    }, []);

    const startNewGame = useCallback(() => {
        resetGame();
    }, [resetGame]);

    const validateBet = useCallback((betValue: string, balance: number) => {
        const parsedBet = Number(betValue);
        return {
            isValid: parsedBet > 0 && parsedBet <= balance && !isNaN(parsedBet),
            amount: parsedBet
        };
    }, []);

    const handleBet = useCallback(async () => {
        console.log("handleBet called");
        
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to place a bet.");
            return;
        }

        const betValidation = validateBet(betInput, amount);
        console.log("Bet validation:", betValidation);
        
        if (!betValidation.isValid) {
            alert("Invalid bet amount.");
            return;
        }

        try {
            console.log("Starting bet process...");
            console.log("Current amount:", amount, "Bet amount:", betValidation.amount);
            
            // Update local state only - no Firebase during gameplay
            setAmount(amount - betValidation.amount);
            setBetAmount(betValidation.amount);
            setBetPlaced(true);
            
            // Create deck and draw cards
            console.log("Creating deck...");
            await cardService.createDeck();
            console.log("Deck created successfully");
            
            console.log("Drawing cards...");
            const [playerCards, botCards] = await Promise.all([
                drawMultipleCards(2),
                drawMultipleCards(2)
            ]);
            
            console.log("Cards drawn:", { playerCards, botCards });
            
            setPlayerHand(playerCards);
            setBotHand(botCards);
            setGameState("ongoing");
            
            console.log("Game started successfully!");
            
        } catch (error) {
            console.error("Game setup failed:", error);
            
            // Revert local state on error
            setAmount(amount);
            setBetAmount(0);
            setBetPlaced(false);
            setGameState("beginning");
            
            alert("Failed to start the game. Please try again.");
        }
    }, [betInput, amount, cardService, drawMultipleCards, validateBet]);

    const isBetValid = useMemo(() => 
        validateBet(betInput, amount).isValid, 
        [betInput, amount, validateBet]
    );

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
            {modalMessage && <MessageModal message={modalMessage} onClose={() => setModalMessage(null)} />}
            
            <Box sx={{ position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 2, padding: 1 }}>
                <Scoreboard balance={amount} />
            </Box>
            
            <Hand cards={botHand} isDealer={true} dealerCardVisible={dealerCardVisible} />
            <CardStack onCardDrawn={onHit} gameState={gameState} />
            
            {drawnCard && (
                <CardComponent 
                    card={drawnCard} 
                    isFlipped={true} 
                    angle={0} 
                    x={0} 
                    y={0} 
                    isAnimated={true} 
                />
            )}
            
            <Hand cards={playerHand} isDealer={false} dealerCardVisible={false} />

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
                        Einsatz: {betAmount} | Bot: {botValue} | Player: {playerValue}
                    </Typography>
                )}
            </Box>

            <Box sx={{
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
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
                                disabled={!isBetValid}
                                sx={{
                                    opacity: !isBetValid ? 0.4 : 1,
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

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {betPlaced && gameState === "ongoing" && (
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
                    {["win", "lost", "tie"].includes(gameState) && (
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: '8rem',
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