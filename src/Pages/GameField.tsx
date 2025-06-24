import { useEffect, useState } from "react";
import * as React from "react";
import DeckOfCardsService from "../Services/DeckOfCardsService";
import Scoreboard from "../Components/Scoreboard";

type GameState = "beginning" | "playerRound" | "botRound" | "win" | "lost" | "tie";

function calculateHandValue(hand: string[]) {
    let value = 0;
    let aces = 0;
    hand.forEach(card => {
        let firstCardId = card[0];
        if (firstCardId === 'A') aces += 1;
        else if (['K', 'Q', 'J', '0'].includes(firstCardId)) value += 10;
        else value += parseInt(firstCardId);
    });
    for (let i = 0; i < aces; i++) {
        value += (value + 11 <= 21) ? 11 : 1;
    }
    return value;
}

export default function GameField() {
    const [cardService] = useState<DeckOfCardsService>(new DeckOfCardsService());
    const [gameState, setGameState] = useState<GameState>('beginning');
    const [playerHand, setPlayerHand] = useState<string[]>([]);
    const [botHand, setBotHand] = useState<string[]>([]);

    async function pullCard() {
        return (await cardService.drawCards(1)).cards[0].code;
    }

    async function onHit() {
        const card = await pullCard();
        setPlayerHand(prev => [...prev, card]);
    }

    async function onStand() {
        setGameState("botRound");
        let botTotal = calculateHandValue(botHand);
        const playerTotal = calculateHandValue(playerHand);
        const tempBotHand = [...botHand];
        while (botTotal < playerTotal && botTotal < 21) {
            const card = await pullCard();
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
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
        }}>
            {/* Scoreboard links oben */}
            <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                width: '360px',
                backgroundColor: '#212529',
                color: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                padding: '1rem',
                fontSize: '0.85rem',
                zIndex: 10,
                maxHeight: '90vh',
                overflowY: 'auto',
            }}>
                <Scoreboard />
            </div>

            {/* Spielbereich zentriert */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                color: 'white',
                padding: '1rem'
            }}>
                <h2>Gamefield (Blackjack)</h2>
                {/* Spiel-Logik-UI hier ergänzen */}
            </div>
        </div>
    );
}
