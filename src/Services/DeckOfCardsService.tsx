class DeckOfCardsService {
    baseUrl: string;
    deckId: null;

    constructor() {
      this.baseUrl = "https://deckofcardsapi.com/api/deck";
      this.deckId = null;
    }
  
    async createDeck(deckCount = 1) {
      const response = await fetch(`${this.baseUrl}/new/shuffle/?deck_count=${deckCount}`);
      const data = await response.json();
      this.deckId = data.deck_id;
      return data;
    }
  
    async drawCards(count = 1) {
      if (!this.deckId) await this.createDeck();
      const response = await fetch(`${this.baseUrl}/${this.deckId}/draw/?count=${count}`);
      return response.json();
    }
  
    async shuffleDeck(remaining = false) {
      if (!this.deckId) throw new Error("No deck initialized.");
      const url = `${this.baseUrl}/${this.deckId}/shuffle/${remaining ? '?remaining=true' : ''}`;
      const response = await fetch(url);
      return response.json();
    }
  
    async createPartialDeck(cards) {
      const cardList = cards.join(',');
      const response = await fetch(`${this.baseUrl}/new/shuffle/?cards=${cardList}`);
      const data = await response.json();
      this.deckId = data.deck_id;
      return data;
    }
  
    async addToPile(pileName, cards) {
      if (!this.deckId) throw new Error("No deck initialized.");
      const cardList = cards.join(',');
      const response = await fetch(`${this.baseUrl}/${this.deckId}/pile/${pileName}/add/?cards=${cardList}`);
      return response.json();
    }
  
    async listPile(pileName) {
      if (!this.deckId) throw new Error("No deck initialized.");
      const response = await fetch(`${this.baseUrl}/${this.deckId}/pile/${pileName}/list/`);
      return response.json();
    }
  
    async drawFromPile(pileName, count = 1) {
      if (!this.deckId) throw new Error("No deck initialized.");
      const response = await fetch(`${this.baseUrl}/${this.deckId}/pile/${pileName}/draw/?count=${count}`);
      return response.json();
    }
  
    async shufflePile(pileName) {
      if (!this.deckId) throw new Error("No deck initialized.");
      const response = await fetch(`${this.baseUrl}/${this.deckId}/pile/${pileName}/shuffle/`);
      return response.json();
    }
  
    async returnCards(cards) {
      if (!this.deckId) throw new Error("No deck initialized.");
      const cardList = cards.join(',');
      const response = await fetch(`${this.baseUrl}/${this.deckId}/return/?cards=${cardList}`);
      return response.json();
    }
  }
  
  export default DeckOfCardsService;
  