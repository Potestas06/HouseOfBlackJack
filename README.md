# HouseOfBlackJack
<img src="https://github.com/user-attachments/assets/0745cea0-ea6c-4864-895f-f3cc227d2af9" alt="image" width="300">




## Description

HouseOfBlackJack is a simple, web-based Blackjack game built with React and TypeScript. The goal is to provide players with a classic casino feel and implement the core rules of Blackjack in an interactive way.

## Features

* Shuffle and deal cards
* Player and dealer logic following traditional Blackjack rules
* Display of score, bust status, and winner
* Betting system (chips) with a basic wagering mechanism
* Responsive design that runs in the browser

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Potestas06/HouseOfBlackJack.git
   ```
2. Change into the project directory:

   ```bash
   cd HouseOfBlackJack
   ```
3. Install dependencies:

   ```bash
   npm install
   ```

   Or, if you use Yarn:

   ```bash
   yarn
   ```

## Development

* **Start local development server:**

  ```bash
  npm start
  ```

  Then open `http://localhost:3000` in your browser. The page will reload automatically when you make code changes.

* **Run tests:**

  ```bash
  npm test
  ```

  Runs the built-in test runner in watch mode.

* **Build for production:**

  ```bash
  npm run build
  ```

  Creates an optimized production bundle in the `build` folder, which can be deployed.

## Project Structure

```
HouseOfBlackJack/
├── public/              # Static files (HTML, icons)
├── src/                 # Source code (components, styles, utilities)
│   ├── components/      # Reusable React components
│   ├── hooks/           # Custom React hooks
│   ├── assets/          # Images, fonts, sounds
│   ├── App.tsx          # Main entry point of the app
│   ├── index.tsx        # Mounts React into the DOM
│   └── ...              # Other files and folders
├── .gitignore
├── package.json
└── README.md            # This file
```

## Rules and Gameplay

1. At the start of the game, the player receives two cards and the dealer receives one face-up and one face-down card.
2. The player can choose “Hit” (draw a card) or “Stand” (stop drawing cards).
3. The goal is to get as close to 21 points as possible without going over (“bust”).
4. The dealer follows fixed rules (must hit until at least 17 points).
5. There is a betting system: the player starts with a predefined amount of chips and can place a bet before each round.

## Contributing

1. Fork the repository.
2. Create a new branch:

   ```bash
   git checkout -b feature/my-change
   ```
3. Commit your changes:

   ```bash
   git commit -m "My change"
   ```
4. Push to the upstream branch:

   ```bash
   git push origin feature/my-change
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
