# 🖥️ Hacker Terminal - Word Scramble Game

A cyberpunk-themed word scramble game built with React, TypeScript, and Tailwind CSS. Test your decryption skills as you breach through increasingly difficult firewall tiers!

## 🎮 Live Demo

**Play Now:** [https://hacker-terminal-game-f0z6h8405-jon-smiths-projects-a3dfc292.vercel.app](https://hacker-terminal-game-f0z6h8405-jon-smiths-projects-a3dfc292.vercel.app)

## 🌟 Features

- **6 Difficulty Tiers**: Progress through increasingly complex word challenges
- **Boss Mode**: Face the ultimate encryption challenge with rapid-fire scrambled words
- **Dynamic Scoring System**: Earn points based on tier difficulty
- **Timer Pressure**: Race against the clock to decrypt each word
- **Descramble Power-Up**: Reveal the word for a score penalty when you're stuck
- **Retro Hacker Aesthetic**: Matrix-inspired green terminal with glitch effects
- **Audio Feedback**: Beeps and alarms enhance the hacking experience
- **Responsive Design**: Play on desktop or mobile devices

## 🎯 How to Play

1. Click **"Initialize Breach"** to start
2. Unscramble the displayed word by typing your answer
3. Progress through tiers by earning points (100 points per tier)
4. Reach Tier 6 to face the **Boss Mode** challenge
5. Use the **Trace Decryption** button (-25 points) if you need help

### Scoring
- Tier 1-2: 10-20 points per word
- Tier 3-4: 30-40 points per word
- Tier 5: 50 points per word
- Boss Mode: 50 points per word + 100 bonus for completion

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Web Audio API** - Sound effects

## 🚀 Local Development

```bash
# Clone the repository
git clone https://github.com/BluShooz/hacker-terminal-game.git
cd hacker-terminal-game

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📦 Deployment

This project is deployed on Vercel with automatic deployments from the main branch.

### Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/BluShooz/hacker-terminal-game)

## 🎨 Game Mechanics

- **Word Pool**: Each tier has unique words that won't repeat in a session
- **Timer**: 30 seconds per word (hidden in Boss Mode for extra pressure)
- **Tier Progression**: Automatic advancement every 100 points
- **Boss Mode**: 3 rapid-fire words with flickering scrambles
- **Game Over**: Timeout on Tier 6 results in "identity compromised"

## 📝 License

MIT License - feel free to use this project for learning or building your own games!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Built with ❤️ by Dark Passenger** | Powered by Terminal_Zero
