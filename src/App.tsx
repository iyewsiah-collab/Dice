import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  RotateCcw, 
  Play, 
  Edit3, 
  Copy, 
  Check, 
  Smile, 
  Sparkles, 
  BookOpen, 
  Code,
  FileCode,
  ArrowRight,
  RefreshCw,
  Baby
} from 'lucide-react';

// Define the indices and rotations of the faces to align flat in front of the camera
const FACE_ROTATIONS = [
  { index: 0, name: "Front", rx: 0, ry: 0 },
  { index: 1, name: "Back", rx: 0, ry: 180 },
  { index: 2, name: "Right", rx: 0, ry: -90 },
  { index: 3, name: "Left", rx: 0, ry: 90 },
  { index: 4, name: "Top", rx: -90, ry: 0 },
  { index: 5, name: "Bottom", rx: 90, ry: 0 }
];

// Fun, educational presets for lower primary school pupils
const PRESET_LISTS = [
  { 
    name: "Adjectives", 
    icon: "🌟",
    words: ["short", "long", "beautiful", "ugly", "new", "old"],
    sentences: {
      short: "a short ruler 📏",
      long: "a long train 🚂",
      beautiful: "a beautiful doll 🪆",
      ugly: "an ugly monster 👾",
      new: "a new bike 🚲",
      old: "an old car 🚗"
    }
  },
  { 
    name: "Colours", 
    icon: "🎨",
    words: ["red", "blue", "green", "yellow", "pink", "orange"],
    sentences: {
      red: "a red pen 🖊️",
      blue: "a blue bike 🚲",
      green: "a green go-kart 🏎️",
      yellow: "a yellow rubber 🧼",
      pink: "a pink doll 🪆",
      orange: "an orange ball 🏀"
    }
  },
  { 
    name: "Toys", 
    icon: "🧸",
    words: ["go-kart", "computer game", "train", "plane", "bike", "kite"],
    sentences: {
      "go-kart": "My favourite toy is a go-kart. 🏎️",
      "computer game": "My favourite toy is a computer game. 🎮",
      train: "His favourite toy is a train. 🚂",
      plane: "His favourite toy is a plane. ✈️",
      bike: "Her favourite toy is a bike. 🚲",
      kite: "Her favourite toy is a kite. 🪁"
    }
  },
  { 
    name: "Numbers", 
    icon: "🔢",
    words: ["eight", "one", "five", "four", "nine", "ten"],
    sentences: {
      eight: "My favourite number is eight. 8️⃣",
      one: "My favourite number is one. 1️⃣",
      five: "My favourite number is five. 5️⃣",
      four: "My favourite number is four. 4️⃣",
      nine: "My favourite number is nine. 9️⃣",
      ten: "My favourite number is ten. 🔟"
    }
  },
  { 
    name: "Shapes", 
    icon: "📐",
    words: ["shapes", "circle", "rectangle", "square", "triangle", "parallelogram"],
    sentences: {
      shapes: "I can see shapes. 🟦",
      circle: "I can see a circle. 🔴",
      rectangle: "I can see a rectangle. 🟩",
      square: "I can't see a square. ⬜",
      triangle: "I can't see a triangle. 🔺",
      parallelogram: "I can't see a parallelogram. ⬡"
    }
  }
];

export const THEME_PALETTES = [
  {
    id: "rainbow",
    name: "🌈 Vibrant Rainbow",
    colors: ["#FF5F5F", "#4D96FF", "#6BCB77", "#FF9F29", "#B983FF", "#FF87CA"]
  },
  {
    id: "pastel",
    name: "🌸 Pastel Dream",
    colors: ["#FFB7B2", "#BFFCC6", "#FFDAC1", "#E8AEFF", "#97C1A9", "#ABDEE6"]
  },
  {
    id: "warm",
    name: "🔥 Sunset Glow",
    colors: ["#FF7E67", "#FF9A76", "#FFC478", "#FF8B94", "#F3A953", "#E23E57"]
  },
  {
    id: "ocean",
    name: "🌊 Ocean Splash",
    colors: ["#0F4C81", "#1976D2", "#00ACC1", "#0288D1", "#0097A7", "#00ADB5"]
  },
  {
    id: "neon",
    name: "✨ Neon Magic",
    colors: ["#FF007F", "#00F0FF", "#36F174", "#FFEF00", "#9400D3", "#FF5E00"]
  }
];

export default function App() {
  // List of presets is now fully editable and kept in state with themes
  const [presets, setPresets] = useState(() => PRESET_LISTS.map((p, idx) => ({
    name: p.name,
    icon: p.icon,
    words: [...p.words],
    sentences: { ...p.sentences } as Record<string, string>,
    theme: idx === 0 ? "rainbow" : idx === 1 ? "pastel" : idx === 2 ? "ocean" : idx === 3 ? "warm" : "neon"
  })));

  // Selected preset/topic index being played
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);

  // Active playing words and sentences (defaults to presets[0])
  const [words, setWords] = useState<string[]>(() => [...PRESET_LISTS[0].words]);
  const [sentences, setSentences] = useState<Record<string, string>>(() => ({ ...PRESET_LISTS[0].sentences }));

  // Draft form states for the "Edit Words & Topic" tab:
  const [editingPresetIndex, setEditingPresetIndex] = useState<number>(0);
  const [editPresetName, setEditPresetName] = useState<string>(PRESET_LISTS[0].name);
  const [editPresetIcon, setEditPresetIcon] = useState<string>(PRESET_LISTS[0].icon);
  const [editTheme, setEditTheme] = useState<string>("rainbow");
  const [editWords, setEditWords] = useState<string[]>(() => [...PRESET_LISTS[0].words]);
  const [editSentences, setEditSentences] = useState<string[]>(() => 
    PRESET_LISTS[0].words.map(w => PRESET_LISTS[0].sentences[w] || '')
  );

  // Dice rolling state variables
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [landedIndex, setLandedIndex] = useState<number>(0);
  const [rotation, setRotation] = useState<{ x: number; y: number }>({ x: 15, y: 15 });
  const [hasRolledOnce, setHasRolledOnce] = useState<boolean>(false);
  
  // UI states
  const [activeTab, setActiveTab] = useState<'play' | 'edit' | 'code'>('play');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  
  // Animation timers references
  const tumbleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initial Web Audio Context synthethizer
  const playSoundEffect = (type: 'click' | 'tumble' | 'success') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      
      if (type === 'click') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(450, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } else if (type === 'tumble') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140 + Math.random() * 120, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } else if (type === 'success') {
        // High quality sweet 3-tone chime for kids
        const now = audioCtx.currentTime;
        const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
        freqs.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0, now + idx * 0.1);
          gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.1 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.1 + 0.35);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.4);
        });
      }
    } catch (err) {
      console.warn('Browser AudioContext is blocked or unsupported:', err);
    }
  };

  // Text-To-Speech Pronunciation engine
  const speakCurrentWord = (wordToSpeak: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // kill existing sounds
      const utterance = new SpeechSynthesisUtterance(wordToSpeak);
      utterance.rate = 0.85;  // slower for kids to absorb clearly
      utterance.pitch = 1.25; // higher pitch is more friendly and appealing to children
      window.speechSynthesis.speak(utterance);
    }
  };

  // Select Preset handler
  const handleSelectPreset = (idx: number) => {
    playSoundEffect('click');
    setSelectedPresetIndex(idx);
    const selected = presets[idx];
    setWords([...selected.words]);
    setSentences({ ...selected.sentences });
    
    // Also sync the edit drafts so going to edit tab aligns with play selection
    setEditingPresetIndex(idx);
    setEditPresetName(selected.name);
    setEditPresetIcon(selected.icon);
    setEditTheme(selected.theme || "rainbow");
    setEditWords([...selected.words]);
    setEditSentences(selected.words.map(w => selected.sentences[w] || ''));
  };

  // Topic & words editors submit
  const handleApplyCustomWords = (e: React.FormEvent) => {
    e.preventDefault();
    playSoundEffect('success');
    
    // clean up words and sentences objects
    const cleanWords = editWords.map((w, i) => (w.trim() || `word ${i + 1}`).toLowerCase());
    const updatedSentences: Record<string, string> = {};
    
    cleanWords.forEach((word, idx) => {
      const sentenceVal = editSentences[idx]?.trim();
      updatedSentences[word] = sentenceVal || `Can you say "${word}" inside a lovely sentence? 🌟`;
    });

    // save back to presets state
    const nextPresets = [...presets];
    nextPresets[editingPresetIndex] = {
      name: editPresetName.trim() || `Topic ${editingPresetIndex + 1}`,
      icon: editPresetIcon.trim() || '🎲',
      words: cleanWords,
      sentences: updatedSentences,
      theme: editTheme
    };
    setPresets(nextPresets);

    // immediately load into active dice play
    setSelectedPresetIndex(editingPresetIndex);
    setWords(cleanWords);
    setSentences(updatedSentences);
    
    setActiveTab('play');
  };

  // Main high-performance rolling engine logic
  const rollDice = () => {
    if (isRolling) return;
    
    playSoundEffect('click');
    setIsRolling(true);
    setHasRolledOnce(true);

    // Pick a random landing face index (0 to 5)
    const targetIdx = Math.floor(Math.random() * 6);
    
    // Add 4 to 6 full 360-degree spins, plus index-specific offsets to land perfect
    const spinsX = 3 + Math.floor(Math.random() * 3);
    const spinsY = 3 + Math.floor(Math.random() * 3);
    
    const targetFace = FACE_ROTATIONS[targetIdx];
    
    // Smooth forward spin accumulators
    const nextX = Math.round(rotation.x / 360) * 360 + (spinsX * 360) + targetFace.rx;
    const nextY = Math.round(rotation.y / 360) * 360 + (spinsY * 360) + targetFace.ry;
    
    setRotation({ x: nextX, y: nextY });

    // Start cute tumble sounds mimicking mechanical roll
    let tempIndex = 1;
    tumbleIntervalRef.current = setInterval(() => {
      playSoundEffect('tumble');
      tempIndex++;
    }, 120);

    // Conclude rolling at 2000 milliseconds
    setTimeout(() => {
      if (tumbleIntervalRef.current) {
        clearInterval(tumbleIntervalRef.current);
      }
      setIsRolling(false);
      setLandedIndex(targetIdx);
      playSoundEffect('success');
      
      // Pupils read the word themselves first (Get Help option is available)
    }, 2000);
  };

  // Clean-up interval on unmount
  useEffect(() => {
    return () => {
      if (tumbleIntervalRef.current) {
        clearInterval(tumbleIntervalRef.current);
      }
    };
  }, []);

  // Generates the pure, premium standalone html requested by the user
  const generateStandaloneHTML = () => {
    const formattedWordsString = JSON.stringify(words, null, 4);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Rollable Word Dice for Kids</title>
    <!-- Beautiful child-friendly Google fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Quicksand:wght@500;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --primary: #2D3436;
            --primary-hover: #1f2324;
            --bg-play: #f0f7ff;
            --cube-sz: 160px;
            --cube-tz: 80px;
        }

        @media (min-width: 600px) {
            :root {
                --cube-sz: 210px;
                --cube-tz: 105px;
            }
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Fredoka', 'Quicksand', system-ui, sans-serif;
        }

        body {
            background: radial-gradient(circle at center, #FFFFFF 0%, #E0EEFF 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            color: #2D3436;
        }

        .container {
            width: 100%;
            max-width: 580px;
            background: white;
            border-radius: 2rem;
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.05), 0 5px 15px rgba(0, 0, 0, 0.02);
            border: 6px solid #E0EEFF;
            padding: 2rem 1.5rem;
            text-align: center;
            overflow: hidden;
        }

        h1 {
            font-size: 2.2rem;
            font-weight: 900;
            color: #2D3436;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .subtitle {
            font-size: 1rem;
            font-weight: 600;
            color: #636E72;
            text-transform: uppercase;
            margin-bottom: 2rem;
            letter-spacing: 0.5px;
        }

        /* 3D Stage Setup */
        .stage {
            height: 280px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            background: radial-gradient(circle, #ffffff 0%, #f0f7ff 100%);
            border-radius: 1.5rem;
            margin-bottom: 2rem;
            border: 3px dashed #b2bec3;
            perspective: 800px;
        }

        /* Ambient glowing floor shadow */
        .stage::after {
            content: '';
            position: absolute;
            bottom: 40px;
            width: 120px;
            height: 18px;
            background: rgba(0, 0, 0, 0.06);
            border-radius: 50%;
            filter: blur(6px);
        }

        .cube-wrapper {
            position: relative;
            transform-style: preserve-3d;
        }

        .cube {
            width: var(--cube-sz);
            height: var(--cube-sz);
            position: relative;
            transform-style: preserve-3d;
            transition: transform 2s cubic-bezier(0.18, 0.89, 0.32, 1.15);
        }

        .cube-face {
            position: absolute;
            width: var(--cube-sz);
            height: var(--cube-sz);
            border: 6px solid rgba(255, 255, 255, 0.45);
            border-radius: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            font-weight: 900;
            text-transform: lowercase;
            text-align: center;
            padding: 0.75rem;
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.15), 
                        0 10px 15px -3px rgba(0, 0, 0, 0.12);
            user-select: none;
            overflow: hidden;
            word-wrap: break-word;
        }

        @keyframes super-roll {
            0% { transform: translateY(0) scale(1) rotate(0deg); }
            15% { transform: translateY(25px) scaleY(0.7) scaleX(1.1) rotate(-8deg); }
            40% { transform: translateY(-130px) scale(1.25) rotate(180deg); }
            65% { transform: translateY(15px) scaleY(0.75) scaleX(1.15) rotate(350deg); }
            80% { transform: translateY(-15px) scale(1.05) rotate(362deg); }
            100% { transform: translateY(0) scale(1) rotate(360deg); }
        }

        .cube-rolling-active {
            animation: super-roll 2s cubic-bezier(0.22, 1, 0.36, 1) forwards !important;
        }

        /* Dynamic rotations and vibrant palette colors based on cube-tz variable */
        .cube-face-0 { transform: rotateY(  0deg) translateZ(var(--cube-tz)); background-color: #FF5F5F; }
        .cube-face-1 { transform: rotateY(180deg) translateZ(var(--cube-tz)); background-color: #4D96FF; }
        .cube-face-2 { transform: rotateY( 90deg) translateZ(var(--cube-tz)); background-color: #6BCB77; }
        .cube-face-3 { transform: rotateY(-90deg) translateZ(var(--cube-tz)); background-color: #FF9F29; }
        .cube-face-4 { transform: rotateX( 90deg) translateZ(var(--cube-tz)); background-color: #B983FF; }
        .cube-face-5 { transform: rotateX(-90deg) translateZ(var(--cube-tz)); background-color: #FF87CA; }

        /* Roll Button */
        .roll-btn {
            background: #2D3436;
            color: white;
            border: none;
            padding: 1.1rem 2.8rem;
            font-size: 1.4rem;
            font-weight: 800;
            border-radius: 100px;
            cursor: pointer;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            transition: all 0.15s ease-out;
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            user-select: none;
            outline: none;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .roll-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
            background: #1f2324;
        }

        .roll-btn:active:not(:disabled) {
            transform: translateY(2px);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
        }

        .roll-btn:disabled {
            background: #d1d5db;
            color: #9ca3af;
            cursor: not-allowed;
            box-shadow: none;
            transform: none;
        }

        /* Outcome display styling */
        .banner {
            margin-top: 1.8rem;
            padding: 1.2rem;
            border-radius: 1.25rem;
            background: #faf5ff;
            border: 2px solid #e9d5ff;
            opacity: 0;
            transform: scale(0.9);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            align-items: center;
        }

        .banner.show {
            opacity: 1;
            transform: scale(1);
        }

        .banner .prefix {
            font-size: 0.95rem;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.05em;
            color: #8b5cf6;
        }

        .banner .word {
            font-size: 2.2rem;
            font-weight: 700;
            color: #7c3aed;
        }

        .speech-btn {
            background: white;
            border: 2px solid #d8b4fe;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: all 0.2s;
            margin-left: 0.5rem;
        }

        .speech-btn:hover {
            background: #fdfaff;
            transform: scale(1.1);
            border-color: #8b5cf6;
        }

        .footer {
            margin-top: 1.5rem;
            font-size: 0.85rem;
            color: #9ca3af;
        }

        .speech-container {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            justify-content: center;
        }
    </style>
</head>
<body>

    <div class="container">
        <h1>🎈 Word Explorer Dice</h1>
        <p class="subtitle">Can you read the magic words on the dice? Roll and try!</p>

        <!-- 3D Stage -->
        <div class="stage">
            <div class="cube-wrapper" id="diceWrapper">
                <div class="cube" id="dice">
                    <!-- Word Dice faces injected on load -->
                </div>
            </div>
        </div>

        <!-- Trigger roll button -->
        <button class="roll-btn" id="rollBtn" onclick="roll()">
            <span>🎲 ROLL DICE!</span>
        </button>

        <!-- Kid outcome board -->
        <div class="banner" id="outcomeBanner">
            <div class="prefix" style="color: #4D96FF; font-weight: 700;">Can you read this? Say it out loud! 🗣️</div>
            <div class="speech-container" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                <span class="word" id="outcomeWord" style="text-transform: lowercase; font-size: 2.3rem; font-weight: 900; color: #2D3436;">hello</span>
                <button class="roll-btn" onclick="sayWord()" title="Get Help" style="font-size: 0.9rem; padding: 0.5rem 1.25rem; background-color: #4D96FF; border: none; display: flex; align-items: center; gap: 0.4rem; height: auto; margin-top: 0.25rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: white;"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    <span style="color: white; font-weight: 800;">GET HELP 🙋‍♂️</span>
                </button>
            </div>
        </div>

        <div class="footer">
            Designed for curious primary school learners • Built with HTML5 and CSS 3D
        </div>
    </div>

    <!-- Script Block -->
    <script>
        /**
         * EDIT THIS ARRAY OF WORDS TO CHANGE THE FACES OF THE DICE LATER!
         * There must be exactly 6 elements.
         */
        const words = ${formattedWordsString};

        // Rotation multipliers for smooth forward motions
        let curX = 15;
        let curY = 15;
        let isRolling = false;
        let landedWord = "";

        // Web Audio synthethizer for cute physical feedback
        function synthSound(type) {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                const ctx = new AudioCtx();
                
                if (type === 'click') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.setValueAtTime(450, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);
                    gain.gain.setValueAtTime(0.12, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.12);
                } else if (type === 'tumble') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(150 + Math.random() * 120, ctx.currentTime);
                    gain.gain.setValueAtTime(0.06, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.08);
                } else if (type === 'success') {
                    const now = ctx.currentTime;
                    const tones = [523.25, 659.25, 783.99]; // cheerful primary chord
                    tones.forEach((freq, idx) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
                        gain.gain.setValueAtTime(0, now + idx * 0.1);
                        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.1 + 0.02);
                        gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.1 + 0.35);
                        osc.start(now + idx * 0.1);
                        osc.stop(now + idx * 0.1 + 0.4);
                    });
                }
            } catch(e) {
                console.warn(e);
            }
        }

        // Initialize faces inside the DOM
        function initFaces() {
            const dice = document.getElementById('dice');
            dice.innerHTML = '';
            
            // Generate 6 faces corresponding 
            for (let i = 0; i < 6; i++) {
                const face = document.createElement('div');
                face.className = 'cube-face cube-face-' + i;
                // keep lowercase for primary school pupils
                face.innerText = (words[i] || "").toLowerCase();
                face.style.textTransform = "lowercase";
                dice.appendChild(face);
            }
            
            // Set initial rotation
            dice.style.transform = 'rotateX(' + curX + 'deg) rotateY(' + curY + 'deg)';
        }

        // Text-To-Speech Pronunciation engine
        function sayWord() {
            if (!landedWord) return;
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(landedWord);
                utterance.rate = 0.85;
                utterance.pitch = 1.25; // Friendly high pitch for kids
                window.speechSynthesis.speak(utterance);
            }
        }

        // Core roll trigger function
        function roll() {
            if (isRolling) return;
            
            synthSound('click');
            isRolling = true;
            
            const btn = document.getElementById('rollBtn');
            const banner = document.getElementById('outcomeBanner');
            const dice = document.getElementById('dice');
            const diceWrapper = document.getElementById('diceWrapper') || dice;
            
            btn.disabled = true;
            banner.classList.remove('show');
            diceWrapper.classList.add('cube-rolling-active');

            // 6 face configurations
            const rotations = [
                { rx: 0, ry: 0 },      // Front
                { rx: 0, ry: 180 },    // Back
                { rx: 0, ry: -90 },    // Right
                { rx: 0, ry: 90 },     // Left
                { rx: -90, ry: 0 },    // Top
                { rx: 90, ry: 0 }      // Bottom
            ];

            const targetIdx = Math.floor(Math.random() * 6);
            const targetFace = rotations[targetIdx];
            landedWord = words[targetIdx] || "hello";

            // Add 4 to 6 full tumbles
            const spinsX = 3 + Math.floor(Math.random() * 3);
            const spinsY = 3 + Math.floor(Math.random() * 3);

            curX = Math.round(curX / 360) * 360 + (spinsX * 360) + targetFace.rx;
            curY = Math.round(curY / 360) * 360 + (spinsY * 360) + targetFace.ry;

            dice.style.transform = 'rotateX(' + curX + 'deg) rotateY(' + curY + 'deg)';

            // Sound feedback tumble loop
            let synthCount = 0;
            const clicker = setInterval(() => {
                synthSound('tumble');
                synthCount++;
                if (synthCount >= 15) {
                    clearInterval(clicker);
                }
            }, 120);

            // Completion timeout at 2 seconds
            setTimeout(() => {
                clearInterval(clicker);
                isRolling = false;
                btn.disabled = false;
                diceWrapper.classList.remove('cube-rolling-active');
                
                synthSound('success');
                
                // Show result banner
                document.getElementById('outcomeWord').innerText = landedWord.toLowerCase();
                banner.classList.add('show');
                
                // Automatic voice reading disabled - pupils read by themselves first
            }, 2000);
        }

        // Page startup
        window.addEventListener('load', initFaces);
    </script>
</body>
</html>
`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateStandaloneHTML());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,#FFFFFF_0%,#E0EEFF_100%)] bg-[#F0F7FF] py-8 px-4 text-slate-700 font-sans selection:bg-[#4D96FF]/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Application Header */}
        <header className="text-center mb-10 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-blue-100 rounded-full text-blue-800 font-semibold text-xs md:text-sm mb-4 shadow-xs uppercase tracking-wide">
            <span className="animate-bounce">🎈</span> Learn adjectives through play!
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#2D3436] flex items-center justify-center gap-2 tracking-tight uppercase">
            <Sparkles className="text-amber-500 w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
            Word Dice
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#636E72] font-semibold uppercase tracking-wider max-w-xl mx-auto">
            Primary School Learning Tool • Interactive 3D Cube
          </p>
        </header>

        {/* Playful Command Sub-Tabs */}
        <div className="flex justify-center gap-1 mb-8 bg-blue-100/40 p-1 rounded-2xl max-w-md mx-auto border border-blue-100/50 shadow-xs" id="menu-bar">
          <button
            id="tab-play"
            onClick={() => { playSoundEffect('click'); setActiveTab('play'); }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeTab === 'play'
                ? 'bg-[#2D3436] text-white shadow-md'
                : 'text-slate-600 hover:bg-white/40'
            }`}
          >
            <Smile className="w-4 h-4 text-amber-400 fill-amber-400" />
            Play
          </button>
          
          <button
            id="tab-edit"
            onClick={() => { playSoundEffect('click'); setActiveTab('edit'); }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeTab === 'edit'
                ? 'bg-[#2D3436] text-white shadow-md'
                : 'text-slate-600 hover:bg-white/40'
            }`}
          >
            <Edit3 className="w-4 h-4 text-blue-400" />
            Edit Words
          </button>

          <button
            id="tab-code"
            onClick={() => { playSoundEffect('click'); setActiveTab('code'); }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeTab === 'code'
                ? 'bg-[#2D3436] text-white shadow-md'
                : 'text-slate-600 hover:bg-white/40'
            }`}
          >
            <FileCode className="w-4 h-4 text-emerald-400" />
            Copy HTML
          </button>
        </div>

        {activeTab === 'play' && (
          <div className="max-w-2xl mx-auto w-full bg-white p-6 sm:p-10 rounded-3xl border-4 border-slate-100 shadow-xl text-center flex flex-col items-center">
            
            {/* Presets Quickbar */}
            <div className="w-full mb-6">
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block mb-3 text-center">
                ⚡ Quick Study Presets
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(idx)}
                    className={`text-xs font-bold px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all ${
                      selectedPresetIndex === idx 
                        ? 'bg-amber-100 border-amber-300 text-amber-800 scale-102 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Dice Cylinder Stage Area */}
            <div className="scene w-full h-[320px] flex items-center justify-center relative bg-radial from-slate-50 to-[#E0EEFF]/40 rounded-2xl border-2 border-dashed border-slate-200/80 shadow-inner overflow-hidden mb-8">
              
              {/* Visual light rays or glowing focal background */}
              <span className="absolute text-7xl select-none opacity-5 pointer-events-none transform -translate-y-4">
                🎨🎲🦁
              </span>

              {/* 3D Dice Component Wrapper for Playful Throwing / Bouncing */}
              <div className={`cube-wrapper ${isRolling ? 'cube-rolling-active' : 'pulse-gently'}`}>
                {/* 3D Dice Component */}
                <div 
                  className="cube cursor-pointer"
                  style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                  }}
                  onClick={rollDice}
                  id="3d-dice-cube"
                >
                  {FACE_ROTATIONS.map((face, idx) => {
                    const activeThemeId = presets[selectedPresetIndex]?.theme || "rainbow";
                    const activeTheme = THEME_PALETTES.find(t => t.id === activeThemeId) || THEME_PALETTES[0];
                    const faceColor = activeTheme.colors[idx % activeTheme.colors.length];
                    return (
                      <div
                        key={face.index}
                        className={`cube-face cube-face-${face.name.toLowerCase()}`}
                        style={{ backgroundColor: faceColor }}
                      >
                        <span className="text-2xl sm:text-3xl font-black lowercase tracking-wide break-words px-2 text-white">
                          {words[idx].toLowerCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Perspective depth helper elements: shadow floor */}
              <div className="absolute bottom-6 w-32 h-4 bg-slate-900/10 rounded-full blur-xs scale-x-110 pointer-events-none"></div>
            </div>

            {/* Rolling Interaction Controller Trigger */}
            <button
              id="roll-dice-action-btn"
              onClick={rollDice}
              disabled={isRolling}
              className="w-full sm:w-auto px-16 py-6 bg-[#2D3436] hover:bg-[#1a1c1d] active:scale-95 text-white font-extrabold text-2xl rounded-full tracking-wide uppercase transition-all duration-150 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 border-none select-none shadow-lg shadow-black/10"
            >
              <span className="text-3xl">🎲</span>
              <span>{isRolling ? "Spinning..." : "Roll Dice"}</span>
            </button>

            {/* Kid-friendly word outcomes card */}
            <div 
              className={`w-full mt-8 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-500 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                hasRolledOnce 
                  ? 'opacity-100 translate-y-0 scale-100 bg-blue-50/50 border-blue-200/50 shadow-sm' 
                  : 'opacity-45 scale-95 border-slate-100 bg-slate-50'
              }`}
            >
              <div className="text-left w-full sm:w-auto">
                <div className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <span>Your Landed Face 🌟</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-3xl font-black tracking-tight text-slate-800 lowercase select-all">
                    {words[landedIndex]?.toLowerCase()}
                  </span>
                  <p className="text-[11px] font-bold text-slate-500">
                    Can you read this? Say it out loud! 🗣️
                  </p>
                  <button
                    onClick={() => speakCurrentWord(words[landedIndex])}
                    className="inline-flex mt-1.5 w-fit items-center gap-1.5 px-3 py-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-full transition-all shadow-xs"
                    title="Get Help (Read word for me)"
                    id="pronounce-word"
                  >
                    <Volume2 className="w-3.5 h-3.5 fill-blue-300" />
                    <span>Get Help 🙋‍♂️</span>
                  </button>
                </div>
              </div>

              {/* Educational kid-friendly sentence */}
              <div className="text-left bg-white p-4 rounded-xl border border-blue-100 flex-1 max-w-sm w-full">
                <div className="text-[10px] uppercase font-bold text-zinc-400 mb-0.5">Let's practice! 📖</div>
                <p className="text-xs sm:text-sm font-medium text-slate-600 italic leading-relaxed">
                  {sentences[words[landedIndex]] || `Can you say "${words[landedIndex]}" inside a lovely sentence? 🌟`}
                </p>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'edit' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-4 border-purple-100/80 shadow-xl max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-purple-50">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800">Customize Topics & Words</h2>
                <p className="text-xs text-slate-500 font-semibold">Customize topic titles, emoji icons, the 6 dice words, and custom reading helper sentences!</p>
              </div>
            </div>

            {/* Step 1: Select which of the five presets to edit */}
            <div className="mb-6 bg-purple-50/40 p-4 rounded-2xl border border-purple-100/60">
              <span className="text-xs uppercase tracking-wider font-extrabold text-purple-700 block mb-3 text-center">
                📁 1. Click a Topic below to modify:
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      playSoundEffect('click');
                      setEditingPresetIndex(idx);
                      setEditPresetName(p.name);
                      setEditPresetIcon(p.icon);
                      setEditTheme(p.theme || "rainbow");
                      setEditWords([...p.words]);
                      setEditSentences(p.words.map(w => p.sentences[w] || ''));
                    }}
                    className={`text-xs font-bold px-3 py-2.5 rounded-xl border flex items-center gap-1.5 transition-all duration-200 ${
                      editingPresetIndex === idx 
                        ? 'bg-purple-600 border-purple-700 text-white scale-102 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleApplyCustomWords} className="space-y-6">
              
              {/* Step 2: Edit current topic's title and icon */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/80">
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block mb-3">
                  ✏️ Topic Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Topic Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editPresetName}
                      onChange={(e) => setEditPresetName(e.target.value)}
                      className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      placeholder="e.g. My Custom Words"
                    />
                  </div>
                  <div className="sm:col-span-4 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Emoji Icon
                    </label>
                    <input
                      type="text"
                      required
                      value={editPresetIcon}
                      onChange={(e) => setEditPresetIcon(e.target.value)}
                      className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-center text-slate-800 font-bold text-lg focus:outline-hidden focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      placeholder="e.g. ⭐"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2.5: Edit Theme selection */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/80">
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block mb-3">
                  🎨 Dice Color Theme
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {THEME_PALETTES.map((t) => {
                    const isSelected = editTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          playSoundEffect('click');
                          setEditTheme(t.id);
                        }}
                        className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-between gap-2 transition-all text-center ${
                          isSelected 
                            ? 'border-purple-600 bg-purple-50 text-purple-950 scale-102 font-bold shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="text-[11px] font-black tracking-tight">{t.name.split(" ")[1] || t.name}</span>
                        <div className="flex gap-0.5 justify-center">
                          {t.colors.slice(0, 3).map((c, i) => (
                            <span key={i} className="w-3 h-3 rounded-full inline-block border border-white" style={{ backgroundColor: c }}></span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Configure 6 words and practice sentences */}
              <div>
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block mb-3">
                  🎲 Customize the 6 Words & Practice Sentences
                </span>
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {editWords.map((val, idx) => (
                    <div key={idx} className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ background: idx === 0 ? '#ef4444' : idx === 1 ? '#4D96FF' : idx === 2 ? '#6BCB77' : idx === 3 ? '#FF9F29' : idx === 4 ? '#B983FF' : '#FF87CA' }}></span>
                          Face {idx + 1}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                        <div className="md:col-span-4">
                          <input
                            type="text"
                            maxLength={15}
                            required
                            value={val}
                            onChange={(e) => {
                              const nextWords = [...editWords];
                              nextWords[idx] = e.target.value.toLowerCase();
                              setEditWords(nextWords);
                            }}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-extrabold lowercase placeholder:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
                            placeholder={`Enter Word ${idx + 1}`}
                          />
                        </div>
                        <div className="md:col-span-8">
                          <input
                            type="text"
                            required
                            value={editSentences[idx] || ''}
                            onChange={(e) => {
                              const nextSents = [...editSentences];
                              nextSents[idx] = e.target.value;
                              setEditSentences(nextSents);
                            }}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold placeholder:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-400 focus:border-transparent text-xs"
                            placeholder={`Enter child practice sentence for "${val || `Word ${idx + 1}`}"`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-purple-50">
                <button
                  type="button"
                  onClick={() => {
                    playSoundEffect('click');
                    // Reset drafts to current active play state
                    setEditingPresetIndex(selectedPresetIndex);
                    setEditPresetName(presets[selectedPresetIndex].name);
                    setEditPresetIcon(presets[selectedPresetIndex].icon);
                    setEditTheme(presets[selectedPresetIndex].theme || "rainbow");
                    setEditWords([...presets[selectedPresetIndex].words]);
                    setEditSentences(presets[selectedPresetIndex].words.map(w => presets[selectedPresetIndex].sentences[w] || ''));
                    setActiveTab('play');
                  }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl transition-all shadow-md shadow-purple-500/15 text-sm"
                >
                  Save and Update Dice 🎯
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-4 border-purple-100/80 shadow-xl max-w-4xl mx-auto">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-purple-50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                  <FileCode className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">Your Standalone HTML Code</h2>
                  <p className="text-xs text-slate-500 font-semibold">Copy this single file code for offline testing or class slide embedding!</p>
                </div>
              </div>
              
              <button
                id="copy-html-btn"
                onClick={handleCopyCode}
                className={`w-full md:w-auto px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  copiedCode 
                    ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200' 
                    : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/10'
                }`}
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Standalone HTML Code
                  </>
                )}
              </button>
            </div>

            {/* Instruction workflow steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex gap-2.5 items-start">
                <span className="bg-teal-100 text-teal-800 font-bold text-xs h-6 w-6 rounded-full flex items-center justify-center shrink-0">A</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-700">1. Copy the Code</h4>
                  <p className="text-[11px] text-slate-500">Press the teal button above to copy the unified code snippet.</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="bg-teal-100 text-teal-800 font-bold text-xs h-6 w-6 rounded-full flex items-center justify-center shrink-0">B</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-700">2. Save file as HTML</h4>
                  <p className="text-[11px] text-slate-500">Create a new local text file names <code>dice.html</code> and paste the text.</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="bg-teal-100 text-teal-800 font-bold text-xs h-6 w-6 rounded-full flex items-center justify-center shrink-0">C</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-700">3. Double-Click to Play</h4>
                  <p className="text-[11px] text-slate-500">Open it in any modern browser! Speech, synthesized audio, and 3D are active.</p>
                </div>
              </div>
            </div>

            {/* Code visual rendering box */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
              <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-[10px] text-teal-400 font-bold font-mono">
                HTML5/CSS3/Vanilla JS
              </div>
              <pre className="p-4 sm:p-6 overflow-x-auto text-[11px] sm:text-xs font-mono text-zinc-100 leading-relaxed max-h-[400px]">
                {generateStandaloneHTML()}
              </pre>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
