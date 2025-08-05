"use client";

import { useState, useCallback, useEffect } from "react";

export interface GameState {
  word: string;
  guesses: string[];
  currentGuess: string;
  gameStatus: "playing" | "won" | "lost" | "notStarted";
  maxGuesses: number;
  currentRow: number;
  letterStatuses: Record<string, "correct" | "present" | "absent" | "unknown">;
}

export interface LetterState {
  letter: string;
  status: "correct" | "present" | "absent" | "unknown";
}

const WORD_LIST = [
  "GOOBY", "GAMES", "FRAME", "CHAIN", "TOKEN", "TRADE", "MAGIC", "QUICK",
  "BLAST", "SHINE", "BRAVE", "POWER", "DREAM", "LIGHT", "SPACE", "CLEAR",
  "FRESH", "SMART", "SOLID", "PRIME", "SWEET", "SHARP", "CRISP", "SWIFT",
  "LUCKY", "FUNNY", "HAPPY", "CRAZY", "FUNKY", "ZIPPY", "JOLLY", "WITTY"
];

export function useGoobieGame() {
  const [gameState, setGameState] = useState<GameState>({
    word: "",
    guesses: [],
    currentGuess: "",
    gameStatus: "notStarted",
    maxGuesses: 6,
    currentRow: 0,
    letterStatuses: {}
  });

  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [hasPaidForGame, setHasPaidForGame] = useState(false);
  const [isFreeMode, setIsFreeMode] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastPlayed = localStorage.getItem("goobie-last-played");
    const lastPaid = localStorage.getItem("goobie-last-paid");
    const freeMode = localStorage.getItem("goobie-free-mode");
    
    if (lastPlayed === today) {
      setHasPlayedToday(true);
    }
    
    if (lastPaid === today) {
      setHasPaidForGame(true);
    }

    if (freeMode === "true") {
      setIsFreeMode(true);
    }
  }, []);

  const getRandomWord = useCallback(() => {
    return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
  }, []);

  const startNewGame = useCallback(() => {
    const newWord = getRandomWord();
    setGameState({
      word: newWord,
      guesses: [],
      currentGuess: "",
      gameStatus: "playing",
      maxGuesses: 6,
      currentRow: 0,
      letterStatuses: {}
    });
  }, [getRandomWord]);

  const updateLetterStatuses = useCallback((guess: string, word: string, currentStatuses: Record<string, "correct" | "present" | "absent" | "unknown">) => {
    const newStatuses = { ...currentStatuses };
    
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      if (word[i] === letter) {
        newStatuses[letter] = "correct";
      } else if (word.includes(letter) && newStatuses[letter] !== "correct") {
        newStatuses[letter] = "present";
      } else if (!word.includes(letter)) {
        newStatuses[letter] = "absent";
      }
    }
    
    return newStatuses;
  }, []);

  const getLetterStates = useCallback((guess: string, word: string): LetterState[] => {
    const result: LetterState[] = [];
    const wordArray = word.split("");
    const guessArray = guess.split("");
    
    // First pass: mark correct letters
    const availableLetters = [...wordArray];
    for (let i = 0; i < guessArray.length; i++) {
      if (guessArray[i] === wordArray[i]) {
        result[i] = { letter: guessArray[i], status: "correct" };
        availableLetters[i] = "";
      } else {
        result[i] = { letter: guessArray[i], status: "unknown" };
      }
    }
    
    // Second pass: mark present letters
    for (let i = 0; i < guessArray.length; i++) {
      if (result[i].status === "unknown") {
        const letterIndex = availableLetters.indexOf(guessArray[i]);
        if (letterIndex !== -1) {
          result[i].status = "present";
          availableLetters[letterIndex] = "";
        } else {
          result[i].status = "absent";
        }
      }
    }
    
    return result;
  }, []);

  const makeGuess = useCallback((guess: string) => {
    if (gameState.gameStatus !== "playing" || guess.length !== 5) {
      return false;
    }

    const newGuesses = [...gameState.guesses, guess.toUpperCase()];
    const newLetterStatuses = updateLetterStatuses(guess.toUpperCase(), gameState.word, gameState.letterStatuses);
    
    let newStatus: "playing" | "won" | "lost" = "playing";
    
    if (guess.toUpperCase() === gameState.word) {
      newStatus = "won";
      if (!isFreeMode) {
        const today = new Date().toDateString();
        localStorage.setItem("goobie-last-played", today);
        setHasPlayedToday(true);
      }
    } else if (newGuesses.length >= gameState.maxGuesses) {
      newStatus = "lost";
      if (!isFreeMode) {
        const today = new Date().toDateString();
        localStorage.setItem("goobie-last-played", today);
        setHasPlayedToday(true);
      }
    }

    setGameState(prev => ({
      ...prev,
      guesses: newGuesses,
      currentGuess: "",
      gameStatus: newStatus,
      currentRow: newGuesses.length,
      letterStatuses: newLetterStatuses
    }));

    return true;
  }, [gameState, updateLetterStatuses, isFreeMode]);

  const updateCurrentGuess = useCallback((guess: string) => {
    if (guess.length <= 5) {
      setGameState(prev => ({
        ...prev,
        currentGuess: guess.toUpperCase()
      }));
    }
  }, []);

  const deleteLetter = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentGuess: prev.currentGuess.slice(0, -1)
    }));
  }, []);

  const markGameAsPaid = useCallback(() => {
    const today = new Date().toDateString();
    localStorage.setItem("goobie-last-paid", today);
    setHasPaidForGame(true);
  }, []);

  const resetPayment = useCallback(() => {
    localStorage.removeItem("goobie-last-paid");
    setHasPaidForGame(false);
  }, []);

  const toggleFreeMode = useCallback(() => {
    const newFreeMode = !isFreeMode;
    setIsFreeMode(newFreeMode);
    localStorage.setItem("goobie-free-mode", newFreeMode.toString());
  }, [isFreeMode]);

  const resetGame = useCallback(() => {
    localStorage.removeItem("goobie-last-played");
    setHasPlayedToday(false);
    setGameState({
      word: "",
      guesses: [],
      currentGuess: "",
      gameStatus: "notStarted",
      maxGuesses: 6,
      currentRow: 0,
      letterStatuses: {}
    });
  }, []);

  return {
    gameState,
    hasPlayedToday,
    hasPaidForGame,
    isFreeMode,
    startNewGame,
    makeGuess,
    updateCurrentGuess,
    deleteLetter,
    getLetterStates,
    markGameAsPaid,
    resetPayment,
    toggleFreeMode,
    resetGame
  };
}