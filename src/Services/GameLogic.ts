import { Card } from "./types";

// ==================================================================================
// Pure Functions for Game Logic
// ==================================================================================

export const getCardValue = (cardCode: string): { value: number; isAce: boolean } => {
    const firstChar = cardCode[0];
    return firstChar === "A"
      ? { value: 0, isAce: true }
      : ["K", "Q", "J", "0"].includes(firstChar)
      ? { value: 10, isAce: false }
      : { value: parseInt(firstChar), isAce: false };
  };
  
  export const calculateAceValue = (currentValue: number): number =>
    currentValue + 11 <= 21 ? 11 : 1;
  
  export const calculateHandValue = (
    hand: Card[],
    isDealer: boolean = false,
    dealerCardVisible: boolean = false
  ): number => {
    const visibleCards = hand.filter(
      (_, index) => !isDealer || index === 0 || dealerCardVisible
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
  
  export const determineWinner = (
    playerValue: number,
    dealerValue: number,
    gameEnd: boolean = false
  ) => ({
    isWin:
      dealerValue > 21 || (gameEnd && playerValue > dealerValue && playerValue <= 21),
    isLoss:
      playerValue > 21 || (gameEnd && dealerValue > playerValue && dealerValue <= 21),
    isTie: gameEnd && dealerValue === playerValue && playerValue <= 21,
  });
  