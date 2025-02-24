import { throttle } from 'lodash'
import { sendMessage } from '../api'

export async function labelPost(post: Element) {
  // Get the post text content
  const tweetText = post.querySelector('[data-testid="tweetText"]')?.textContent?.toLowerCase() || ''

  // label the post
  const resp = await sendMessage(`label this post: ${tweetText}`)

  return {
    label: resp[1].params.label,
    color: resp[1].params.color
  }
}

// Create a throttled version of checkForScamIndicators
const throttledCheck = throttle(async (post: Element) => {
  return await labelPost(post)
}, 2000)

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

export async function markPost(post: Element) {
  try {
    if (post.hasAttribute('data-marked') || post.querySelector('.data-label')) {
      return;
    }

    const result = await throttledCheck(post);
    const articleContainer = post.closest('article[data-testid="tweet"]');
    if (!articleContainer) return;

    // Create and style label
    const labelElement = document.createElement('div');
    labelElement.textContent = result.label;
    labelElement.className = 'data-label';
    applyLabelStyles(labelElement, result.color);

    // Style article
    (articleContainer as HTMLElement).style.position = 'relative';
    applyArticleStyles(articleContainer, result.color);
    articleContainer.setAttribute('data-marked', 'true');

    // Add animations
    document.head.appendChild(
      createStyleElement(
        LABEL_STYLES.animations.gradientBorder +
        LABEL_STYLES.animations.safePulse(result.color)
      )
    );

    articleContainer.insertBefore(labelElement, articleContainer.firstChild);
  } catch (err) {
    console.error('Error marking post:', err);
  }
}

// async function deletePost(postElement: Element) {
//   try {
//     // Add CSS for the Thanos effect
//     const style = document.createElement('style')
//     style.textContent = `
//       @keyframes fadeAway {
//         0% {
//           opacity: 1;
//         }
//         100% {
//           opacity: 0;
//         }
//       }

//       .particle {
//         position: absolute;
//         background: currentColor;
//         border-radius: 50%;
//         pointer-events: none;
//         z-index: 1000;
//       }

//       @keyframes float {
//         0% {
//           transform: translate(0, 0) rotate(0deg);
//         }
//         100% {
//           transform: translate(var(--tx), var(--ty)) rotate(var(--r));
//           opacity: 0;
//         }
//       }
//     `
//     document.head.appendChild(style)

//     // Create particles
//     const rect = postElement.getBoundingClientRect()
//     const numParticles = 100
//     const particles = []

//     for (let i = 0; i < numParticles; i++) {
//       const particle = document.createElement('div')
//       particle.className = 'particle'

//       // Random position within the element
//       const x = Math.random() * rect.width + rect.left
//       const y = Math.random() * rect.height + rect.top

//       // Random size between 2-6px
//       const size = Math.random() * 4 + 2

//       // Get the color at this position
//       const color = window.getComputedStyle(postElement).color

//       particle.style.cssText = `
//         left: ${x}px;
//         top: ${y}px;
//         width: ${size}px;
//         height: ${size}px;
//         background: ${color};
//         --tx: ${(Math.random() - 0.5) * 100}px;
//         --ty: ${-Math.random() * 200}px;
//         --r: ${Math.random() * 360}deg;
//         animation: float 2s ease-out forwards;
//       `

//       document.body.appendChild(particle)
//       particles.push(particle)
//     }

//     // Fade out the original element
//     postElement.style.animation = 'fadeAway 2s forwards'

//     // Clean up and rerun parser
//     setTimeout(() => {
//       particles.forEach(p => p.remove())
//       postElement.remove()

//       // Rerun parser for suitable parsers
//       suitableParsers.forEach((p) => {
//         try {
//           core.detachParserConfig(p.id)
//           core.attachParserConfig(p)
//         } catch (err) {
//           console.error('Error reattaching parser:', err)
//         }
//       })
//     }, 2000)
//   } catch (err) {
//     console.error('Error removing post:', err)
//   }
// }
