# House of BlackJack - M323 Kompetenznachweis

This document describes the implementation of functional programming concepts in the "House of BlackJack" project, as required for the M323 module competency assessment.

## 1. Functional Programming Enhancements

The application has been significantly refactored to incorporate functional programming principles. These changes are most prominent in the `src/Pages/GameField.tsx` component and its related services, which now manage the game's state and logic in a functional, declarative, and immutable way.

### 1.1. Core Concepts Applied

The following functional programming concepts have been applied throughout the application:

-   **Pure Functions:** All data transformation and game logic (card value calculation, winner determination, etc.) are implemented as pure functions. These functions have no side effects and return new, transformed data, leaving the original state untouched.
-   **Immutability:** The application state is treated as immutable. Instead of modifying the state directly, a reducer function is used to create a new state object with the updated values.
-   **Higher-Order Functions:** The `pipe` function in `Scoreboard.tsx` is a higher-order function that takes other functions as arguments to create a data processing pipeline.
-   **Function Composition:** The `pipe` utility is used to chain together data transformation functions in a declarative and readable way.
-   **State Management with Reducers:** The `useReducer` hook is used in `GameField.tsx` to manage the component's complex state. The reducer is a pure function that takes the current state and an action and returns a new state, which is a core concept in functional state management.
-   **Separation of Concerns:** The code has been refactored to separate pure functions from those with side effects. The `GameLogic.ts` file contains only pure functions, while `GameService.ts` handles all interactions with external services like Firebase and the Deck of Cards API.

### 1.2. Code Examples

Here are some concrete examples from the project that illustrate the application of these concepts.

#### Functional State Management with `useReducer` in `GameField.tsx`

The `GameField.tsx` component uses the `useReducer` hook to manage its state. The `gameReducer` is a pure function that handles all state transitions in a predictable and immutable way.

```typescript
// src/Services/GameReducer.ts

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "SET_USER_DATA":
      return { ...state, ...action.payload };
    case "PLACE_BET":
      return {
        ...state,
        balance: state.balance - action.payload,
        betAmount: action.payload,
      };
    // ... other cases
    default:
      return state;
  }
};
```

#### Separation of Pure Functions and Side Effects

The project now has a clear separation between pure functions and functions with side effects.

-   **`src/Services/GameLogic.ts`** contains only pure functions for calculating game state.

    ```typescript
    // src/Services/GameLogic.ts

    export const calculateHandValue = (
      hand: Card[],
      isDealer: boolean = false,
      dealerCardVisible: boolean = false
    ): number => {
      // ... pure calculation logic
    };
    ```

-   **`src/Services/GameService.ts`** handles all side effects, such as fetching data from APIs and interacting with the database.

    ```typescript
    // src/Services/GameService.ts

    export const loadUserData = async (dispatch: React.Dispatch<any>) => {
      // ... interacts with Firebase
    };

    export const placeBet = async (
      dispatch: React.Dispatch<any>,
      betInput: string,
      balance: number
    ) => {
      // ... interacts with the Deck of Cards API
    };
    ```

This separation makes the code easier to test, reason about, and maintain.

## 2. Reflection

### 2.1. Principles of Functional Programming

The core principles of functional programming applied in this project are:

-   **Declarative Code:** By using a reducer and dispatching actions, we describe *what* should happen in the application, rather than the specific step-by-step instructions of *how* it should happen.
-   **Predictability and Testability:** Pure functions and reducers are predictable. Given the same input, they will always produce the same output. This makes them easy to test in isolation without needing to mock complex dependencies or application states.
-   **Avoiding Side Effects:** The use of pure functions and immutable state updates eliminates side effects, which are a common source of bugs in complex applications. This leads to more robust and maintainable code.

### 2.2. Challenges and Benefits

**Challenges:**

-   **Initial Learning Curve:** Adopting a functional mindset requires a shift in thinking, especially when coming from an object-oriented or imperative background. Understanding concepts like reducers, actions, and immutability can be challenging at first.
-   **Boilerplate:** Implementing the reducer pattern can sometimes feel like it requires more boilerplate code than using `useState`. However, this initial investment pays off in larger and more complex components.

**Benefits:**

-   **Improved Readability:** The declarative nature of the code, combined with the clear separation of concerns, makes it easier to understand the application's logic.
-   **Enhanced Maintainability:** With a clear separation of concerns and no side effects, the code is easier to modify and extend without introducing bugs.
-   **Better Testability:** Pure functions and reducers are trivial to unit test, which increases confidence in the correctness of the code.
-   **Reduced Complexity:** By centralizing state management and separating logic from side effects, the overall complexity of the application is significantly reduced.

In conclusion, applying functional programming principles to the "House of BlackJack" project has resulted in a more robust, maintainable, and readable codebase. The initial investment in learning these concepts pays off by reducing complexity and improving code quality in the long run.


## 3. Use of AI

**Note:** This section is intentionally informal, so we can give a genuine reflection.

Even though it isn’t really necessary, I still want to point out that this project heavily utilized AI for design ideas, functional feedback, and improvement suggestions. In total, we used four different AI agents to help make this code the best it can be:

- **OpenAI Codex:** We only used it at the very beginning—and yes, the code it generated was pretty rough—but it gave us a solid foundation to build on.

- **Claude:** Our go-to for refactoring—offering instant feedback on what could be improved, what needed work, and step-by-step guidance on breaking the GameField into smaller components. (Note: In theory the suggestions were great, but most of the code examples it provided were downright unusable.)

- **ChatGPT:** If you have more than three brain cells and are as lazy as we are, you automate as much as possible. We mainly used ChatGPT for documentation, code snippets, and more—though its code rarely fit our functional-programming style and it often ignored instructions. For documentation, however, it was awesome!

- **GitHub Copilot:** We used Copilot directly in the editor for quick suggestions on repetitive tasks—boosting our speed by a serious margin—and we also enabled the built-in Copilot in GitHub for code reviews, since it gives a more “outside” perspective on our PRs. Most of the time it spotted bugs, flagged style issues, and offered handy refactoring tips, but occasionally it couldn’t see the whole picture and—tbh—was kinda dumb. Still, it saved us from overlooking a bunch of small stuff.

**summary:**
In short, AI is awesome—and anyone who says you shouldn’t use it is even dumber than the AIs themselves. It’s a killer way to code faster and more efficiently, but you actually have to understand what it’s doing, or you’ll run into big problems sooner or later. For our next project, we’ll definitely keep using AI—and lean on it even more if possible. I mean, why wouldn’t you? It’s like saying “no thanks” to the wheel because it makes you lazy. Sure, it can make you lazy—but it also makes you way faster, helps you grasp concepts more easily, and saves you from getting yelled at on StackOverflow for using Node.js instead of Deno or whatever.
