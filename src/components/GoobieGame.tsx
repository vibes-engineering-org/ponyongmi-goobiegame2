"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { DaimoPayTransferButton } from "~/components/daimo-pay-transfer-button";
import { useGoobieGame, type LetterState } from "~/hooks/use-goobie-game";
import { useMiniAppSdk } from "~/hooks/use-miniapp-sdk";

interface GameBoardProps {
  guesses: string[];
  currentGuess: string;
  maxGuesses: number;
  word: string;
  getLetterStates: (guess: string, word: string) => LetterState[];
}

function GameBoard({ guesses, currentGuess, maxGuesses, word, getLetterStates }: GameBoardProps) {
  const rows = [];
  
  for (let i = 0; i < maxGuesses; i++) {
    const isCurrentRow = i === guesses.length;
    const guess = guesses[i] || (isCurrentRow ? currentGuess.padEnd(5, " ") : "     ");
    
    const letterStates = guesses[i] 
      ? getLetterStates(guesses[i], word)
      : guess.split("").map(letter => ({ letter, status: "unknown" as const }));
    
    rows.push(
      <div key={i} className="flex gap-1 justify-center">
        {letterStates.map((letterState, j) => (
          <div
            key={j}
            className={`
              w-12 h-12 border-2 flex items-center justify-center text-lg font-bold rounded
              ${letterState.status === "correct" ? "bg-green-500 border-green-500 text-white" :
                letterState.status === "present" ? "bg-yellow-500 border-yellow-500 text-white" :
                letterState.status === "absent" ? "bg-gray-500 border-gray-500 text-white" :
                isCurrentRow && letterState.letter.trim() ? "border-gray-400 bg-white" :
                "border-gray-200 bg-gray-50"
              }
            `}
          >
            {letterState.letter.trim() || ""}
          </div>
        ))}
      </div>
    );
  }
  
  return <div className="space-y-1">{rows}</div>;
}

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  letterStatuses: Record<string, "correct" | "present" | "absent" | "unknown">;
  disabled: boolean;
}

function VirtualKeyboard({ onKeyPress, onDelete, onEnter, letterStatuses, disabled }: VirtualKeyboardProps) {
  const rows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"]
  ];

  const getKeyStyle = (key: string) => {
    const status = letterStatuses[key];
    if (status === "correct") return "bg-green-500 text-white border-green-500";
    if (status === "present") return "bg-yellow-500 text-white border-yellow-500";
    if (status === "absent") return "bg-gray-500 text-white border-gray-500";
    return "bg-gray-100 hover:bg-gray-200 border-gray-300";
  };

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-1 justify-center">
          {i === 2 && (
            <Button
              onClick={onEnter}
              disabled={disabled}
              className="px-3 py-2 text-sm font-medium rounded border h-10"
              variant="outline"
            >
              ENTER
            </Button>
          )}
          {row.map((key) => (
            <Button
              key={key}
              onClick={() => onKeyPress(key)}
              disabled={disabled}
              className={`w-8 h-10 text-sm font-medium rounded border ${getKeyStyle(key)}`}
              variant="outline"
            >
              {key}
            </Button>
          ))}
          {i === 2 && (
            <Button
              onClick={onDelete}
              disabled={disabled}
              className="px-3 py-2 text-sm font-medium rounded border h-10"
              variant="outline"
            >
              DEL
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

export default function GoobieGame() {
  const {
    gameState,
    hasPlayedToday,
    hasPaidForGame,
    startNewGame,
    makeGuess,
    updateCurrentGuess,
    deleteLetter,
    getLetterStates,
    markGameAsPaid,
    resetPayment
  } = useGoobieGame();

  const { context } = useMiniAppSdk();
  const [inputValue, setInputValue] = useState("");

  const handleKeyPress = (key: string) => {
    if (gameState.currentGuess.length < 5) {
      updateCurrentGuess(gameState.currentGuess + key);
    }
  };

  const handleDelete = () => {
    deleteLetter();
  };

  const handleEnter = () => {
    if (gameState.currentGuess.length === 5) {
      makeGuess(gameState.currentGuess);
    }
  };

  const handleInputSubmit = () => {
    if (inputValue.length === 5) {
      makeGuess(inputValue);
      setInputValue("");
    }
  };

  const handlePaymentSuccess = () => {
    markGameAsPaid();
  };

  const canPlayGame = hasPaidForGame && !hasPlayedToday;
  const needsPayment = !hasPaidForGame;
  const gameFinished = hasPlayedToday;

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Goobie</h1>
        <p className="text-muted-foreground">
          Guess the 5-letter word in 6 tries
        </p>
      </div>

      {needsPayment && (
        <Card className="p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold">Play Goobie</h2>
          <p className="text-muted-foreground">
            Pay 1 USDC to play today&apos;s puzzle
          </p>
          <DaimoPayTransferButton
            text="Pay to Play (1 USDC)"
            toAddress="0x0000000000000000000000000000000000000000"
            amount="1"
            onPaymentCompleted={handlePaymentSuccess}
          />
          <Button
            onClick={resetPayment}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Reset Payment (Demo)
          </Button>
        </Card>
      )}

      {hasPaidForGame && gameFinished && (
        <Card className="p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold">
            {gameState.gameStatus === "won" ? "You Won!" : 
             gameState.gameStatus === "lost" ? "Game Over" : "Already Played"}
          </h2>
          {gameState.gameStatus === "lost" && (
            <p className="text-muted-foreground">
              The word was: <span className="font-bold">{gameState.word}</span>
            </p>
          )}
          <p className="text-muted-foreground">
            Come back tomorrow for a new puzzle!
          </p>
          <div className="space-y-2">
            <p className="text-sm">Your result:</p>
            <div className="text-xs">
              {gameState.guesses.map((guess, i) => (
                <div key={i} className="flex gap-0.5 justify-center">
                  {getLetterStates(guess, gameState.word).map((letter, j) => (
                    <div
                      key={j}
                      className={`w-4 h-4 ${
                        letter.status === "correct" ? "bg-green-500" :
                        letter.status === "present" ? "bg-yellow-500" :
                        "bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {canPlayGame && (
        <>
          {gameState.gameStatus === "notStarted" && (
            <Card className="p-6 text-center">
              <Button onClick={startNewGame} className="w-full">
                Start New Game
              </Button>
            </Card>
          )}

          {gameState.gameStatus === "playing" && (
            <div className="space-y-6">
              <GameBoard
                guesses={gameState.guesses}
                currentGuess={gameState.currentGuess}
                maxGuesses={gameState.maxGuesses}
                word={gameState.word}
                getLetterStates={getLetterStates}
              />

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value.toUpperCase().slice(0, 5))}
                    placeholder="Enter 5-letter word"
                    className="text-center text-lg font-mono"
                    maxLength={5}
                  />
                  <Button onClick={handleInputSubmit} disabled={inputValue.length !== 5}>
                    Guess
                  </Button>
                </div>

                <VirtualKeyboard
                  onKeyPress={handleKeyPress}
                  onDelete={handleDelete}
                  onEnter={handleEnter}
                  letterStatuses={gameState.letterStatuses}
                  disabled={false}
                />
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Guess {gameState.guesses.length + 1} of {gameState.maxGuesses}
              </div>
            </div>
          )}

          {(gameState.gameStatus === "won" || gameState.gameStatus === "lost") && (
            <Card className="p-6 text-center space-y-4">
              <h2 className="text-xl font-semibold">
                {gameState.gameStatus === "won" ? "Congratulations!" : "Game Over"}
              </h2>
              {gameState.gameStatus === "lost" && (
                <p>The word was: <span className="font-bold">{gameState.word}</span></p>
              )}
              <p className="text-muted-foreground">
                Come back tomorrow for a new puzzle!
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}