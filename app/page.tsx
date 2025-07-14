"use client";
import { useEffect, useState } from "react";
import HangmanDrawing from "./components/HangmanDrawing";

// Import the word list from the public directory
import words from "../public/words.json";

type WordData = {
  word: string;
  definition?: string;
};

const MAX_ATTEMPTS = 6;

// Pick a random word and definition from the imported words.json
function getRandomWordAndDefinition(): WordData {
  const idx = Math.floor(Math.random() * words.length);
  const entry = words[idx];
  return {
    word: entry.word.toLowerCase(),
    definition: entry.definition,
  };
}

function getDisplayWord(word: string, guessed: Set<string>) {
  return word
    .split("")
    .map((c) => (guessed.has(c) ? c : "_"))
    .join(" ");
}

function isAlpha(ch: string) {
  return /^[a-zA-Z]$/.test(ch);
}

export default function Home() {
  const [word, setWord] = useState<string>("");
  const [definition, setDefinition] = useState<string | undefined>(undefined);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<Set<string>>(new Set());
  const [showDef, setShowDef] = useState(false);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startNewGame() {
    setLoading(true);
    setShowDef(false);
    setGuessed(new Set());
    setWrong(new Set());
    setStatus("playing");
    // Pick a random word from words.json
    const { word, definition } = getRandomWordAndDefinition();
    setWord(word);
    setDefinition(definition);
    setLoading(false);
  }

  useEffect(() => {
    if (!word) return;
    // Check win
    const uniqueLetters = new Set(word.split(""));
    const allGuessed = Array.from(uniqueLetters).every((c) => guessed.has(c));
    if (allGuessed) setStatus("won");
    else if (wrong.size >= MAX_ATTEMPTS) setStatus("lost");
  }, [guessed, wrong, word]);

  function handleGuess(letter: string) {
    if (status !== "playing") return;
    letter = letter.toLowerCase();
    if (!isAlpha(letter) || guessed.has(letter) || wrong.has(letter)) return;
    if (word.includes(letter)) {
      setGuessed((prev) => new Set(prev).add(letter));
    } else {
      setWrong((prev) => new Set(prev).add(letter));
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (isAlpha(e.key)) {
      handleGuess(e.key);
    }
  }

  function resetGame() {
    startNewGame();
  }

  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20"
      style={{ backgroundColor: "#f3f6fa" }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <main className="flex flex-col gap-8 items-center w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Hangman</h1>
        {loading ? (
          <div className="text-lg text-gray-900">Loading word...</div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-10 flex flex-col lg:flex-row items-center w-full max-w-3xl">
              {/* Hangman Drawing and Game Controls in the same box */}
              <div className="flex flex-col lg:flex-row w-full gap-8 items-center">
                {/* Hangman Drawing */}
                <div className="flex justify-center items-center w-full lg:w-auto">
                  <HangmanDrawing wrongGuesses={wrong.size} maxAttempts={MAX_ATTEMPTS} />
                </div>
                {/* Game Controls */}
                <div className="flex flex-col items-center gap-2 w-full">
                  <div className="text-2xl font-mono tracking-widest mb-2 text-gray-900">
                    {getDisplayWord(word, guessed)}
                  </div>
                  <div className="flex gap-1 flex-wrap justify-center">
                    {alphabet.map((letter) => (
                      <button
                        key={letter}
                        className={`w-8 h-8 rounded border text-lg font-mono transition-all ${
                          guessed.has(letter)
                            ? "bg-green-200 border-green-400 text-green-800"
                            : wrong.has(letter)
                            ? "bg-red-200 border-red-400 text-red-800"
                            : "bg-white border-gray-300 hover:bg-gray-100 text-gray-900"
                        }`}
                        disabled={
                          guessed.has(letter) ||
                          wrong.has(letter) ||
                          status !== "playing"
                        }
                        onClick={() => handleGuess(letter)}
                        aria-label={`Guess letter ${letter}`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-gray-800">
                    Wrong guesses:{" "}
                    <span className="font-mono">
                      {[...wrong].join(" ") || "-"}
                    </span>{" "}
                    ({wrong.size}/{MAX_ATTEMPTS})
                  </div>
                  <div className="mt-6 w-full flex flex-col items-center">
                    {status === "won" && (
                      <div className="text-green-700 text-lg font-semibold">
                        🎉 You won! The word was <span className="font-mono">{word}</span>
                      </div>
                    )}
                    {status === "lost" && (
                      <div className="text-red-700 text-lg font-semibold">
                        😢 You lost! The word was <span className="font-mono">{word}</span>
                      </div>
                    )}
                    {(status === "won" || status === "lost") && (
                      <>
                        <button
                          className="mt-4 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                          onClick={resetGame}
                        >
                          Play again
                        </button>
                        {definition && (
                          <div className="mt-4 flex flex-col items-center w-full">
                            <button
                              className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm transition-colors"
                              onClick={() => setShowDef((v) => !v)}
                            >
                              {showDef ? "Hide definition" : "Show definition"}
                            </button>
                            {showDef && (
                              <div className="mt-2 p-3 bg-gray-100 rounded text-gray-900 text-sm w-full flex justify-center">
                                <div>
                                  <span className="font-bold">Definition:</span> {definition}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="mt-8 text-xs text-gray-500 text-center">
          Words and definitions from the English dictionary.
        </div>
      </main>
    </div>
  );
}
