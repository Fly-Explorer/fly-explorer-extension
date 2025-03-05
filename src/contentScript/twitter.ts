// Style constants
const LABEL_STYLES = {
  base: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '600',
    zIndex: '10000',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    pointerEvents: 'none',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  animations: {
    gradientBorder: `
      @keyframes gradientBorder {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `,
    safePulse: (color: string) => `
      @keyframes safePulse {
        0%, 100% {
          box-shadow: 0 0 20px ${color}33, inset 0 0 20px ${color}33;
        }
        50% {
          box-shadow: 0 0 30px ${color}55, inset 0 0 30px ${color}55;
        }
      }
    `,
    deleteEffects: `
      @keyframes fadeAway {
        0% { opacity: 1; }
        100% { opacity: 0; }
      }

      @keyframes float {
        0% {
          transform: translate(0, 0) rotate(0deg);
        }
        100% {
          transform: translate(var(--tx), var(--ty)) rotate(var(--r));
          opacity: 0;
        }
      }
    `
  }
};

// Utility functions for styling
function createStyleElement(cssText: string): HTMLStyleElement {
  const style = document.createElement('style');
  style.textContent = cssText;
  return style;
}

function applyLabelStyles(element: HTMLElement, color: string): void {
  const styles = { ...LABEL_STYLES.base, background: color };
  element.style.cssText = Object.entries(styles)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ');
}

function applyArticleStyles(article: Element, color: string): void {
  article.setAttribute('style', `
    border: 2px solid transparent !important;
    background:
      linear-gradient(#000, #000) padding-box,
      linear-gradient(45deg, ${color}, ${color}) border-box;
    background-size: 300% 300%;
    border-radius: 16px;
    margin: 8px 0;
    box-shadow:
      0 0 20px ${color}33,
      inset 0 0 20px ${color}33;
    animation: gradientBorder 3s ease infinite,
              safePulse 2s infinite;
    transition: opacity 1s ease-in;
    position: relative;
  `);
}

function getRandomColor(): string {
  const colors = [
    '#FF6B6B',  // coral red
    '#4ECDC4',  // turquoise
    '#45B7D1',  // sky blue
    '#96CEB4',  // sage green
    '#FFEEAD',  // light yellow
    '#D4A5A5',  // dusty rose
    '#9B59B6',  // purple
    '#3498DB',  // blue
    '#E67E22',  // orange
    '#2ECC71'   // green
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function markPost(post: Element) {
  // Check if post is already marked by looking for our label or data-marked attribute
  if (post.querySelector('.tweet-label') || post.getAttribute('data-marked') === 'true') {
    return; // Skip if already marked
  }

  const color = getRandomColor();

  // Create and inject animation styles if not already present
  if (!document.querySelector('#tweet-animations')) {
    const animationStyles = createStyleElement(`
      ${LABEL_STYLES.animations.gradientBorder}
      ${LABEL_STYLES.animations.safePulse(color)}
      ${LABEL_STYLES.animations.deleteEffects}
    `);
    animationStyles.id = 'tweet-animations';
    document.head.appendChild(animationStyles);
  }

  // Apply styles to the post
  applyArticleStyles(post, color);

  // Make sure post has relative positioning for absolute label positioning
  post.setAttribute('style', post.getAttribute('style') + 'position: relative !important;');

  // Mark as processed
  post.setAttribute('data-marked', 'true');
}
