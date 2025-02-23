import { sendMessage } from '../api'
import { throttle } from 'lodash'
import { Core } from '../core'

export async function checkForScamIndicators(post: Element) {
  // Get the post text content
  const tweetText = post.querySelector('[data-testid="tweetText"]')?.textContent?.toLowerCase() || ''
  const userName = post.querySelector('[data-testid="User-Name"]')?.textContent?.toLowerCase() || ''

  // call api to get the sentiment analysis label
  const resp = await sendMessage(`label this post: ${tweetText}`)
  console.log(resp)

  // Return the label and color from the response
  return {
    label: resp[1].params.label,
    color: resp[1].params.color
  }
}

// Create a throttled version of checkForScamIndicators
const throttledCheck = throttle(async (post: Element) => {
  return await checkForScamIndicators(post)
}, 2000)

export async function markPost(post: Element) {
  try {
    // Check if post has already been marked
    if (post.hasAttribute('data-marked') || post.querySelector('.scam-label')) {
      return
    }

    const result = await throttledCheck(post)

    // Find the article container
    const articleContainer = post.closest('article[data-testid="tweet"]')
    if (!articleContainer) return

    // Add label to the post
    const labelElement = document.createElement('div')
    labelElement.textContent = result.label
    labelElement.className = 'scam-label'
    labelElement.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: ${result.color};
      color: white;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 600;
      z-index: 10000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `

    // Ensure the article container has relative positioning
    articleContainer.style.position = 'relative'

    // Insert the label as the first child of the article
    articleContainer.insertBefore(labelElement, articleContainer.firstChild)

    // Add border styling to the article
    articleContainer.setAttribute('style', `
      border: 2px solid transparent !important;
      background:
        linear-gradient(#000, #000) padding-box,
        linear-gradient(45deg, ${result.color}, ${result.color}) border-box;
      background-size: 300% 300%;
      border-radius: 16px;
      margin: 8px 0;
      box-shadow:
        0 0 20px ${result.color}33,
        inset 0 0 20px ${result.color}33;
      animation: gradientBorder 3s ease infinite,
                safePulse 2s infinite;
      transition: opacity 1s ease-in;
      position: relative;
    `)

    // Mark the article as processed
    articleContainer.setAttribute('data-marked', 'true')

    // Keep existing animations
    const style = document.createElement('style')
    style.textContent = `
      @keyframes gradientBorder {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      @keyframes safePulse {
        0% {
          box-shadow: 0 0 20px ${result.color}33,
                      inset 0 0 20px ${result.color}33;
        }
        50% {
          box-shadow: 0 0 30px ${result.color}55,
                      inset 0 0 30px ${result.color}55;
        }
        100% {
          box-shadow: 0 0 20px ${result.color}33,
                      inset 0 0 20px ${result.color}33;
        }
      }
    `
    document.head.appendChild(style)
  } catch (err) {
    console.error('Error marking post:', err)
  }
}

async function deletePost(postElement: Element) {
  try {
    // Add CSS for the Thanos effect
    const style = document.createElement('style')
    style.textContent = `
      @keyframes fadeAway {
        0% {
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
      }

      .particle {
        position: absolute;
        background: currentColor;
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
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
    document.head.appendChild(style)

    // Create particles
    const rect = postElement.getBoundingClientRect()
    const numParticles = 100
    const particles = []

    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'

      // Random position within the element
      const x = Math.random() * rect.width + rect.left
      const y = Math.random() * rect.height + rect.top

      // Random size between 2-6px
      const size = Math.random() * 4 + 2

      // Get the color at this position
      const color = window.getComputedStyle(postElement).color

      particle.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        --tx: ${(Math.random() - 0.5) * 100}px;
        --ty: ${-Math.random() * 200}px;
        --r: ${Math.random() * 360}deg;
        animation: float 2s ease-out forwards;
      `

      document.body.appendChild(particle)
      particles.push(particle)
    }

    // Fade out the original element
    postElement.style.animation = 'fadeAway 2s forwards'

    // Clean up and rerun parser
    setTimeout(() => {
      particles.forEach(p => p.remove())
      postElement.remove()

      // Rerun parser for suitable parsers
      suitableParsers.forEach((p) => {
        try {
          core.detachParserConfig(p.id)
          core.attachParserConfig(p)
        } catch (err) {
          console.error('Error reattaching parser:', err)
        }
      })
    }, 2000)
  } catch (err) {
    console.error('Error removing post:', err)
  }
}
