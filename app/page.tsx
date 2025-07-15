"use client";
import { useEffect, useState, useRef } from "react";
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

// Helper: interpolate between two colors
function lerpColor(a: number[], b: number[], t: number) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

// Helper: convert rgb array to css string
function rgbToCss(rgb: number[]) {
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}

// List of nice pastel colors to fade between
const BG_COLORS: number[][] = [
  [243, 246, 250], // #f3f6fa
  [255, 239, 213], // #ffefd5 (papaya whip)
  [224, 255, 255], // #e0ffff (light cyan)
  [240, 255, 240], // #f0fff0 (honeydew)
  [255, 228, 225], // #ffe4e1 (misty rose)
  [245, 222, 179], // #f5deb3 (wheat)
  [230, 230, 250], // #e6e6fa (lavender)
];

export default function Home() {
  const [word, setWord] = useState<string>("");
  const [definition, setDefinition] = useState<string | undefined>(undefined);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<Set<string>>(new Set());
  const [showDef, setShowDef] = useState(false);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [loading, setLoading] = useState(true);

  // Animated background state
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const colorIdx = useRef(0);
  const animFrame = useRef<number | null>(null);

  // Animate background color
  useEffect(() => {
    let t = 0;
    let duration = 10; // seconds for each fade
    let lastTime = performance.now();

    function animate(now: number) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      t += dt / duration;
      if (t > 1) {
        t = 0;
        colorIdx.current = (colorIdx.current + 1) % BG_COLORS.length;
      }
      const from = BG_COLORS[colorIdx.current];
      const to = BG_COLORS[(colorIdx.current + 1) % BG_COLORS.length];
      setBgColor(lerpColor(from, to, t));
      animFrame.current = requestAnimationFrame(animate);
    }
    animFrame.current = requestAnimationFrame(animate);
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, []);

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
      className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-10"
      style={{
        background: `linear-gradient(135deg, ${rgbToCss(bgColor)} 0%, #fff 100%)`,
        transition: "background 1s linear",
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <main className="flex flex-col gap-12 items-center w-full max-w-7xl">
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-2 text-gray-900 drop-shadow-lg tracking-tight">
          Hangman
        </h1>
        <div className="mb-1 text-sm text-gray-600 text-center max-w-2xl">
          Guess the hidden word one letter at a time. Each incorrect guess adds a part to the hangman. You have {MAX_ATTEMPTS} wrong guesses before the game is over. Can you solve the word before it's too late?
        </div>
        {loading ? (
          <div className="text-2xl text-gray-900">Loading word...</div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-16 flex flex-col lg:flex-row items-center w-full max-w-5xl scale-110">
              <div className="flex flex-col lg:flex-row w-full gap-12 items-center">
                <div className="flex justify-center items-center w-full lg:w-auto scale-125">
                  <HangmanDrawing wrongGuesses={wrong.size} maxAttempts={MAX_ATTEMPTS} />
                </div>
                <div className="flex flex-col items-center gap-4 w-full">
                  <div className="text-4xl font-mono tracking-widest mb-4 text-gray-900">
                    {getDisplayWord(word, guessed)}
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {alphabet.map((letter) => (
                      <button
                        key={letter}
                        className={`w-12 h-12 rounded-lg border text-2xl font-mono transition-all ${
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
                  <div className="mt-6 text-lg text-gray-800">
                    Wrong guesses:{" "}
                    <span className="font-mono">
                      {[...wrong].join(" ") || "-"}
                    </span>{" "}
                    ({wrong.size}/{MAX_ATTEMPTS})
                  </div>
                  <div className="mt-8 w-full flex flex-col items-center">
                    {status === "won" && (
                      <div className="text-green-700 text-2xl font-semibold">
                        🎉 You won! The word was <span className="font-mono">{word}</span>
                      </div>
                    )}
                    {status === "lost" && (
                      <div className="text-red-700 text-2xl font-semibold">
                        😢 You lost! The word was <span className="font-mono">{word}</span>
                      </div>
                    )}
                    {(status === "won" || status === "lost") && (
                      <>
                        <button
                          className="mt-6 px-6 py-3 rounded-lg bg-blue-500 text-white text-lg font-bold hover:bg-blue-600 transition-colors"
                          onClick={resetGame}
                        >
                          Play again
                        </button>
                        {definition && (
                          <div className="mt-6 flex flex-col items-center w-full">
                            <button
                              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 text-base transition-colors"
                              onClick={() => setShowDef((v) => !v)}
                            >
                              {showDef ? "Hide definition" : "Show definition"}
                            </button>
                            {showDef && (
                              <div className="mt-3 p-4 bg-gray-100 rounded text-gray-900 text-base w-full flex justify-center">
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
        <div className="mt-12 text-sm text-gray-500 text-center">
          Words and definitions from the English dictionary.
        </div>
      </main>
    </div>
  );
}