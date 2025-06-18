import { useEffect, useState } from "react";
import * as React from "react";
import DeckOfCardsService from "../Services/DeckOfCardsService";

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
    const [menuOpen, setMenuOpen] = useState(false);

    async function pullCard() {
        return (await cardService.drawCards(1)).cards[0].code;
    }

    async function onHit() {
        let card = await pullCard();
        setPlayerHand([...playerHand, card]);
    }

    async function onStand() {
        setGameState("botRound");
        let botTotal = calculateHandValue(botHand);
        let playerTotal = calculateHandValue(playerHand);
        let tempBotHand = [...botHand];

        while (botTotal < playerTotal && botTotal < 21) {
            let card = await pullCard();
            tempBotHand.push(card);
            botTotal = calculateHandValue(tempBotHand);
        }
        setBotHand(tempBotHand);
    }

    useEffect(() => {
        if (gameState === 'beginning') {
            cardService.createDeck().then(async () => {
                setPlayerHand([await pullCard(), await pullCard()]);
                setBotHand([await pullCard(), await pullCard()]);
                setGameState("playerRound");
            });
        }
    }, [gameState]);

    useEffect(() => {
        const playerValue = calculateHandValue(playerHand);
        const botValue = calculateHandValue(botHand);

        if (botValue > 21) setGameState('win');
        else if (playerValue > 21 || (botValue > playerValue && gameState === 'botRound')) setGameState('lost');
        else if (playerValue === botValue && gameState === 'botRound') setGameState('tie');
    }, [playerHand, botHand, gameState]);



        return (
            <>
                {/* Burger Menu */}
                <div style={{ position: 'absolute', top: 20, right: 20 }}>
                    {/* ... */}
                </div>

                {/* Bot Info oben Mitte */}
                <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                    {/* ... */}
                </div>

                {/* Player Info unten Mitte */}
                <div style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                    {/* ... */}
                </div>

                {/* Buttons unten rechts */}
                {gameState === "playerRound" && (
                    <div style={{ position: 'absolute', bottom: 20, right: 20, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* ... */}
                    </div>
                )}
            </>
        );
    }
