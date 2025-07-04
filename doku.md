# House of BlackJack - M323 Kompetenznachweis

This document describes the implementation of functional programming concepts in the "House of BlackJack" project, as required for the M323 module competency assessment.

## 1. Functional Programming Enhancements

The application has been enhanced with several features that demonstrate the principles of functional programming. These changes are primarily located in the `src/Components/Scoreboard.tsx` component, which now handles data processing in a functional, declarative, and immutable way.

### 1.1. Core Concepts Applied

The following functional programming concepts have been applied:

-   **Pure Functions:** All data transformation logic (filtering, sorting, pagination) is implemented as pure functions. These functions have no side effects and return a new, transformed array, leaving the original data untouched.
-   **Immutability:** The application state, especially the user data, is treated as immutable. Instead of modifying data directly, pure functions create new data structures with the updated values.
-   **Higher-Order Functions:** The `pipe` function is a higher-order function that takes other functions as arguments to create a data processing pipeline. This allows for clear and concise composition of functions.
-   **Function Composition:** The `pipe` utility is used to chain together the `filterUsers`, `sortUsers`, and `paginateUsers` functions. This creates a declarative data flow where the sequence of operations is easy to read and understand.

### 1.2. Code Examples

Here are some concrete examples from the `Scoreboard.tsx` component that illustrate the application of these concepts.

#### Pure Functions for Data Transformation

The filtering, sorting, and pagination logic is encapsulated in pure functions. Each function takes data as input and returns a new, transformed array.

```typescript
// Pure function for filtering users
const filterUsers = (filterText: string) => (users: UserData[]): UserData[] => {
    const trimmedFilter = filterText.trim().toLowerCase();
    if (!trimmedFilter) {
        return users;
    }
    return users.filter(user => user.name.toLowerCase().includes(trimmedFilter));
};

// Pure function for sorting users
const sortUsers = (config: SortConfig) => (users: UserData[]): UserData[] => {
    const sortedUsers = [...users]; // Create a copy to ensure immutability
    // ... sorting logic ...
    return sortedUsers;
};

// Pure function for paginating data
const paginateUsers = (page: number, rowsPerPage: number) => (users: UserData[]): UserData[] => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return users.slice(start, end);
};
```

#### Function Composition with `pipe`

The `pipe` higher-order function allows us to create a clean and readable data processing pipeline. The functions are executed in sequence, with the output of one function becoming the input for the next.

```typescript
// Higher-order function for function composition
const pipe = (...fns: Function[]) => (initialValue: any) => fns.reduce((acc, fn) => fn(acc), initialValue);

// The data processing pipeline in the component
const processedUsers = useMemo(() => pipe(
    filterUsers(filter),
    sortUsers(sortConfig)
)(usersData), [usersData, filter, sortConfig]);

const paginatedUsers = useMemo(() => paginateUsers(currentPage, rowsPerPage)(processedUsers), [processedUsers, currentPage]);
```

This declarative approach makes the code more readable and easier to reason about compared to an imperative approach with multiple `if` statements and temporary variables.

## 2. Reflection

### 2.1. Principles of Functional Programming

The core principles of functional programming applied in this project are:

-   **Declarative Code:** By using function composition, we describe *what* we want to achieve (a filtered, sorted, and paginated list) rather than *how* to achieve it step-by-step.
-   **Predictability and Testability:** Pure functions are predictable. Given the same input, they will always produce the same output. This makes them easy to test in isolation without needing to mock complex dependencies or application states.
-   **Avoiding Side Effects:** The use of pure functions and immutable data structures eliminates side effects, which are a common source of bugs in complex applications. This leads to more robust and maintainable code.

### 2.2. Challenges and Benefits

**Challenges:**

-   **Initial Learning Curve:** Adopting a functional mindset requires a shift in thinking, especially when coming from an object-oriented or imperative background. Understanding concepts like higher-order functions and function composition can be challenging at first.
-   **State Management in React:** Integrating functional principles with React's state management can be tricky. It's important to ensure that state updates remain immutable, which is why tools like `useMemo` are used to re-run the processing pipeline only when necessary.

**Benefits:**

-   **Improved Readability:** The declarative nature of the code makes it easier to understand the intent of the data transformations.
-   **Enhanced Maintainability:** With a clear separation of concerns and no side effects, the code is easier to modify and extend without introducing bugs.
-   **Better Testability:** Pure functions are trivial to unit test, which increases confidence in the correctness of the code.
-   **Reduced Complexity:** By avoiding mutable state and complex control flows, the overall complexity of the component is reduced.

In conclusion, applying functional programming principles to the "House of BlackJack" project has resulted in a more robust, maintainable, and readable codebase. The initial investment in learning these concepts pays off by reducing complexity and improving code quality in the long run.
