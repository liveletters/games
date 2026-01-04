# Live Letters Memory Game

An educational Hebrew memory matching game for young children, featuring custom alphabet letters designed as animal shapes.

## Features

- **Memory Matching Game**: Match letter cards with their corresponding animal cards
- **Adjustable Difficulty**: Slider to select 3-22 pairs (full Hebrew alphabet)
- **Kid-Friendly Design**:
  - Large square cards (130×130px) for easy tapping
  - Custom cover images for letter and animal cards
  - Grayscale effect on matched pairs
  - Smooth card flip animations
- **Hebrew Language**: Full RTL support with Heebo font
- **Responsive**: Optimized for tablets and mobile devices
- **Celebration**: Confetti animation and completion modal
- **iframe Ready**: Configured for embedding on external sites

## Technology Stack

- **React 18.3.1** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **React Confetti** - Celebration animations
- **CSS3** - Animations and responsive design

## Project Structure

```
livelettersgame/
├── public/
│   └── images/
│       ├── letters/          # Letter images (letter_01.png - letter_22.png)
│       ├── animals/          # Animal images (animal_01.png - animal_22.png)
│       ├── cover_letters.png # Card back for letters
│       └── cover_animals.png # Card back for animals
├── src/
│   ├── pages/
│   │   ├── MemoryGame.jsx   # Main game component
│   │   └── MemoryGame.css   # Game styles
│   ├── App.jsx              # Router setup
│   ├── main.jsx             # App entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── package.json
├── vite.config.js
├── vercel.json              # Vercel deployment config (iframe support)
└── README.md
```

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173/memory-game`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment to Vercel

1. **Connect Repository**: Link your GitHub/GitLab repository to Vercel

2. **Configure Project**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Deploy**: Vercel will automatically deploy on push to main branch

4. **iframe Embedding**: The included `vercel.json` configures headers to allow iframe embedding on any domain

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Game Routes

- `/memory-game` - Main game page

## Configuration

### Difficulty Range
Edit `TOTAL_PAIRS` in `src/pages/MemoryGame.jsx` to change maximum difficulty:
```javascript
const TOTAL_PAIRS = 22 // Hebrew alphabet has 22 letters
```

### Card Sizes
Edit card dimensions in `src/pages/MemoryGame.css`:
```css
.card {
  width: 130px;
  height: 130px;
}
```

### Colors
Primary color scheme uses teal/turquoise (`#488a74`, `#55af91`) and cream background (`#FCF1E4`)

## iframe Integration

To embed the game on your website:

```html
<iframe
  src="https://your-deployment-url.vercel.app/memory-game"
  width="100%"
  height="800px"
  frameborder="0"
  title="Live Letters Memory Game">
</iframe>
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- iOS Safari (latest)
- Chrome Mobile (latest)

## License

Private project for Live Letters (liveletters.co.il)

## Credits

Developed for Live Letters educational platform
