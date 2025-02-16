import { Core, IContextNode, ParserConfig } from '../core'
import browser from 'webextension-polyfill'
import Background from '../common/background'
import { ClonedContextNode } from '../common/types'
import { utils } from '../utils'
import { sendMessage } from '../api'

async function main() {
  const core = new Core()

  core.tree.on('childContextAdded', handleNewContext)

  const parsers = JSON.parse(`[
    {
        "id": "parser/twitter",
        "source": "origin",
        "version": "0",
        "parserType": "json",
        "targets": [
            {
                "namespace": "engine",
                "contextType": "website",
                "if": {
                    "id": {
                        "eq": "twitter.com"
                    }
                }
            },
            {
                "namespace": "engine",
                "contextType": "website",
                "if": {
                    "id": {
                        "eq": "x.com"
                    }
                }
            },
            {
                "namespace": "engine",
                "contextType": "website",
                "if": {
                    "id": {
                        "eq": "www.x.com"
                    }
                }
            },
            {
                "namespace": "engine",
                "contextType": "website",
                "if": {
                    "id": {
                        "eq": "www.twitter.com"
                    }
                }
            }
        ],
        "contexts": {
            "root": {
                "props": {
                    "id": "string('global')",
                    "websiteName": "string('X')",
                    "username": "substring-after(string(//header//a[@aria-label='Profile']/@href), '/')",
                    "fullname": "string(//*[@aria-label='Account menu']//img/@alt)",
                    "img": "string(//*[@aria-label='Account menu']//img/@src)",
                    "url": "string(//html/head/meta[@property='og:url']/@content)"
                },
                "children": [
                    "timeline",
                    "profile"
                ]
            },
            "timeline": {
                "selector": "main [data-testid=primaryColumn] section > div",
                "props": {
                    "id": "string('timeline')",
                    "title": "string(./@aria-label)"
                },
                "children": [
                    "post"
                ]
            },
            "post": {
                "selector": "div[data-testid=cellInnerDiv]",
                "props": {
                    "id": "substring-after(string(.//time/../@href), 'status/')",
                    "text": "string(.//*[@data-testid='tweetText'])",
                    "authorFullname": "string(.//*[@data-testid='User-Name']//span)",
                    "authorUsername": "substring-before(substring-after(string(.//time/../@href), '/'), '/')",
                    "authorImg": "string(.//img/@src)",
                    "createdAt": "string(.//time/@datetime)",
                    "url": "concat('https://x.com/', substring-before(substring-after(string(.//time/../@href), '/'), '/'), '/status/', substring-after(string(.//time/../@href), 'status/'))"
                },
                "insertionPoints": {
                    "root": {
                        "selector": ":scope > div",
                        "bosLayoutManager": "bos.dapplets.near/widget/ContextActionsGroup",
                        "insertionType": "before"
                    },
                    "southPanel": {
                        "selector": "div[role=group] > *:last-child",
                        "insertionType": "after"
                    },
                    "avatar": {
                        "selector": "div.r-18kxxzh.r-1wbh5a2.r-13qz1uu > *:last-child",
                        "insertionType": "after"
                    },
                    "afterText": {
                        "selector": "[data-testid=tweetText]",
                        "bosLayoutManager": "bos.dapplets.near/widget/VerticalLayoutManager",
                        "insertionType": "end"
                    }
                },
                "children": [
                    "postSouthButton",
                    "postAvatar"
                ]
            },
            "postSouthButton": {
                "selector": "div[role='group'] > div.css-175oi2r",
                "props": {
                    "id": "string(.//*/@data-testid)"
                }
            },
            "profile": {
                "selector": "[data-testid='primaryColumn'] div.r-13qz1uu.r-1ye8kvj > div",
                "props": {
                    "id": "substring-after(string(.//*[@data-testid='UserName']), '@')",
                    "authorFullname": "string(.//*[@data-testid='UserName']//span[1])",
                    "authorUsername": "substring-after(string(.//*[@data-testid='UserName']), '@')",
                    "authorImg": "string(.//img[contains(@alt,'Opens profile photo')]/@src)",
                    "url": "concat('https://x.com/', substring-after(string(.//*[@data-testid='UserName']), '@'))"
                },
                "insertionPoints": {
                    "southPanel": {
                        "selector": "[data-testid=placementTracking]",
                        "insertionType": "after"
                    },
                    "avatar": {
                        "selector": "div.r-1ifxtd0.r-ymttw5.r-ttdzmv div.r-ggadg3.r-u8s1d.r-8jfcpp",
                        "insertionType": "begin"
                    }
                }
            },
            "postAvatar": {
                "selector": "[data-testid='Tweet-User-Avatar']",
                "props": {
                    "id": "string('avatar')"
                }
            }
        }
    },
    {
        "id": "parser/stackoverflow",
        "parserType": "json",
        "source": "origin",
        "version": "0",
        "targets": [
            {
                "namespace": "engine",
                "contextType": "website",
                "if": {
                    "id": {
                        "eq": "stackoverflow.com"
                    }
                }
            },
            {
                "namespace": "engine",
                "contextType": "website",
                "if": {
                    "id": {
                        "eq": "stackoverflow.blog"
                    }
                }
            },
            {
                "namespace": "engine",
                "contextType": "website",
                "if": {
                    "id": {
                        "eq": "stackoverflow.com/questions"
                    }
                }
            }
        ],
        "contexts": {
            "root": {
                "props": {
                    "id": "string('global')",
                    "websiteName": "string('Stack Overflow')",
                    "url": "string(//html/head/meta[@property='og:url']/@content)"
                },
                "children": [
                    "questions"
                ]
            },
            "questions": {
                "selector": "div.s-post-summary",
                "props": {
                    "id": "string(@data-post-id)",
                    "title": "string(.//h3/a)",
                    "url": "string(.//h3/a/@href)",
                    "excerpt": "string(.//div[@class='s-post-summary--content-excerpt'])",
                    "votes": "normalize-space(.//div[contains(@class, 's-post-summary--stats-item__emphasized')]/span[1])",
                    "answers": "normalize-space(.//div[@class='s-post-summary--stats-item'][2]//span[@class='s-post-summary--stats-item-number'])",
                    "views": "normalize-space(.//div[@class='s-post-summary--stats-item'][3]//span[@class='s-post-summary--stats-item-number'])",
                    "author": "normalize-space(.//div[contains(@class, 's-user-card--info')]//a)",
                    "authorProfile": "concat('https://stackoverflow.com', string(.//div[contains(@class, 's-user-card--info')]//a/@href))",
                    "authorReputation": "string(.//li[@class='s-user-card--rep']/span)",
                    "askedTime": "string(.//time/@title)"
                }
            }
        }
    },
    {
        "id": "sui-forum",
        "parserType": "json",
        "targets": [
            {
                "namespace": "engine",
                "contextType": "website",
                "if": {
                    "id": {
                        "eq": "forums.sui.io"
                    }
                }
            }
        ],
        "contexts": {
            "root": {
                "props": {
                    "id": "string('global')",
                    "websiteName": "string('Discourse')",
                    "url": "string(//html/head/meta[@property='og:url']/@content)"
                },
                "children": [
                    "topics",
                    "posts"
                ]
            },
            "topics": {
                "selector": "tbody.topic-list-body > tr",
                "props": {
                    "id": "string(@data-topic-id)",
                    "title": "string(.//td[contains(@class, 'main-link')]//a[@class='title'])",
                    "category": "string(.//a[contains(@class, 'badge-category')]//span[@class='badge-category__name'])",
                    "link": "concat('https://forums.sui.io', string(.//td[contains(@class, 'main-link')]//a[@class='title']/@href))",
                    "replies": "string(.//td[contains(@class, 'posts')]//span[@class='number'])",
                    "views": "string(.//td[contains(@class, 'views')]//span[@class='number'])",
                    "lastActivity": "string(.//td[contains(@class, 'activity')]//span[@class='relative-date'])"
                }
            },
            "posts": {
                "selector": "article",
                "props": {
                    "id": "string(@data-post-id)",
                    "authorUsername": "string(.//div[@class='names']/span/a)",
                    "authorImg": "string(.//div[@class='post-avatar']//img/@src)",
                    "createdAt": "string(.//div[@class='post-info post-date']/a/span/@title)",
                    "text": "string(.//div[@class='cooked'])",
                    "likes": "string(.//button[contains(@class, 'like-count')])",
                    "url": "concat('https://forums.sui.io', string(.//div[@class='post-info post-date']/a/@href))"
                }
            }
        }
    },
    {
        "id": "movement-forum",
        "parserType": "json",
        "targets": [
            {
                "namespace": "engine",
                "contextType": "website",
                "if": {
                    "id": {
                        "eq": "forums.movementnetwork.xyz"
                    }
                }
            }
        ],
        "contexts": {
            "root": {
                "props": {
                    "id": "string('global')",
                    "websiteName": "string('Discourse')",
                    "url": "string(//html/head/meta[@property='og:url']/@content)"
                },
                "children": [
                    "topics",
                    "posts"
                ]
            },
            "topics": {
                "selector": "tbody.topic-list-body > tr",
                "props": {
                    "id": "string(@data-topic-id)",
                    "title": "string(.//td[contains(@class, 'main-link')]//a[@class='title'])",
                    "category": "string(.//a[contains(@class, 'badge-category')]//span[@class='badge-category__name'])",
                    "link": "concat('https://forums.movementnetwork.xyz', string(.//td[contains(@class, 'main-link')]//a[@class='title']/@href))",
                    "replies": "string(.//td[contains(@class, 'posts')]//span[@class='number'])",
                    "views": "string(.//td[contains(@class, 'views')]//span[@class='number'])",
                    "lastActivity": "string(.//td[contains(@class, 'activity')]//span[@class='relative-date'])"
                }
            },
            "posts": {
                "selector": "article",
                "props": {
                    "id": "string(@data-post-id)",
                    "authorUsername": "string(.//div[@class='names']/span/a)",
                    "authorImg": "string(.//div[@class='post-avatar']//img/@src)",
                    "createdAt": "string(.//div[@class='post-info post-date']/a/span/@title)",
                    "text": "string(.//div[@class='cooked'])",
                    "likes": "string(.//button[contains(@class, 'like-count')])",
                    "url": "concat('https://forums.movementnetwork.xyz', string(.//div[@class='post-info post-date']/a/@href))"
                }
            }
        }
    }
]
`)

  // @ts-ignore
  const suitableParsers = parsers.filter((p) =>
    p.targets.some((t: any) => utils.isTargetMet(t, core.tree))
  )

  console.log({ suitableParsers })

  let isError = false

  // @ts-ignore
  suitableParsers.forEach((p) => {
    try {
      core.attachParserConfig(p)
    } catch (err) {
      console.error(err)
    }
  })

  await setIsError(suitableParsers.length === 0)

  async function setIsError(value: boolean) {
    if (isError === value) return
    isError = value
    // await Background.setIsError(value)
  }

  function handleNewContext({ child }: { child: IContextNode }) {
    child.on('childContextAdded', handleNewContext)
    // Background.storeContext(cloneContextSubtree(child))
  }

  async function generateParserConfig() {
    // const pc: any = await Background.generateParserConfigByUrl(location.href)
    // if (!pc) throw new Error('Cannot generate parser config')

    // console.log({ generatedParser: pc })

    // if (!pc.targets.some((t: any) => utils.isTargetMet(t, core.tree))) {
    //   throw new Error('The generated parser config is not suitable for this web site. Try again')
    // }

    // await Background.saveLocalParserConfig(pc)

    // suitableParsers.push(pc as any)

    // try {
    //   core.attachParserConfig(pc)
    // } catch (err) {
    //   console.error(err)
    // }
  }

  async function improveParserConfig(pc: ParserConfig, html: string) {
    // const newPc: any = await Background.improveParserConfig(pc as any, html)
    // if (!newPc) throw new Error('Cannot improve parser config')

    // console.log({ generatedParser: newPc, previousVersion: pc })

    // if (!newPc.targets.some((t: any) => utils.isTargetMet(t, core.tree))) {
    //   throw new Error('The generated parser config is not suitable for this web site. Try again')
    // }

    // await Background.saveLocalParserConfig(newPc)

    // core.detachParserConfig(pc.id)

    // try {
    //   core.attachParserConfig(newPc)
    //   suitableParsers[suitableParsers.findIndex((p) => p.id === pc.id)] = newPc
    // } catch (err) {
    //   console.error(err)
    // }
  }

  async function deleteParser(pcId: string) {
    // await Background.deleteParser(pcId)
    // suitableParsers.splice(suitableParsers.indexOf(suitableParsers.find((p) => p.id === pcId)), 1)
    // core.detachParserConfig(pcId)
  }

  async function saveLocalParserConfig(newPc: ParserConfig) {
    await Background.saveLocalParserConfig(newPc)
    core.detachParserConfig(newPc.id)

    try {
      core.attachParserConfig(newPc)
      // @ts-ignore
      const index = suitableParsers.findIndex((p) => p.id === newPc.id)
      if (~index) suitableParsers[index] = newPc
      else suitableParsers.push(newPc as any)
      return suitableParsers
    } catch (err) {
      console.error(err)
    }
  }

  async function checkForScamIndicators(post: Element): Promise<boolean> {
    // Get the post text content
    const tweetText = post.querySelector('[data-testid="tweetText"]')?.textContent?.toLowerCase() || ''
    const userName = post.querySelector('[data-testid="User-Name"]')?.textContent?.toLowerCase() || ''

    // call api to get the sentiment analysis label
    // const resp = await sendMessage(`sentiment analysis this post: ${tweetText}`)

    // const label = resp[1].params.label;

    // Define scam indicators with categorized keywords
    const scamKeywords = [
      // Crypto-related
      'crypto', 'bitcoin', 'btc', 'eth', 'ethereum', 'binance', 'wallet',
      'blockchain', 'defi', 'nft', 'token', 'airdrop', 'mining', 'hodl',
      'altcoin', 'doge', 'shib', 'metamask', 'web3',

      // Money/Investment related
      'investment', 'profit', 'roi', 'passive income', 'double your',
      'triple your', '10x', '100x', 'guaranteed returns', 'high yield',
      'quick money', 'fast cash', 'earn daily', 'trading signals',
      'forex trading', 'day trading', 'binary options',

      // Urgency/FOMO triggers
      'urgent', 'limited time', 'act now', 'last chance', 'don\'t miss out',
      'ending soon', 'only today', 'exclusive offer', 'limited slots',
      'closing soon', 'final call', 'time sensitive',

      // Giveaway/Free stuff
      'giveaway', 'free', 'winner', 'claim now', 'you\'ve won',
      'congratulations', 'lucky winner', 'selected winner', 'prize',
      'bonus', 'reward', 'free money', 'free coins',

      // Contact/Action phrases
      'dm me', 'message me', 'click here', 'join now', 'sign up now',
      'register now', 'verify now', 'connect wallet', 'sync wallet',
      'validate wallet', 'restore access',

      // Trust/Authority signals
      'trusted', 'legitimate', 'official', 'verified', 'guaranteed',
      'risk-free', 'safe investment', 'proven system', 'expert trader',
      'certified', 'regulated',

      // Common scam phrases
      'make money fast', 'work from home', 'financial freedom',
      'be your own boss', 'secret method', 'hidden technique',
      'proprietary system', 'insider info', 'private group',
      'exclusive community', 'success formula'
    ]

    // Check for scam indicators
    return scamKeywords.some(keyword =>
      tweetText.includes(keyword) || userName.includes(keyword)
    )
  }

  async function markPost(post: Element) {
    try {
      // Increase random delay range to 0-5 seconds with exponential distribution
      const baseDelay = Math.random() * 3000; // 0-3 seconds base delay
      const extraDelay = Math.pow(Math.random(), 2) * 2000; // 0-2 seconds extra delay with exponential distribution
      const delay = baseDelay + extraDelay;

      // Add small random variation to make it feel more organic
      const jitter = (Math.random() - 0.5) * 500; // ±250ms random jitter

      await new Promise(resolve => setTimeout(resolve, delay + jitter));

      const isScam = await checkForScamIndicators(post)

      // Slower fade-in animation (1 second instead of 0.5)
      post.style.opacity = '0';
      post.style.transition = 'opacity 1s ease-in';

      if (isScam) {
        post.setAttribute('style', `
          opacity: 0;
          border: 3px solid transparent !important;
          background:
            linear-gradient(#000, #000) padding-box,
            linear-gradient(45deg,
              #ff0000, #ff6b6b, #ff4500, #ff1493, #ff0000) border-box;
          background-size: 300% 300%;
          border-radius: 16px;
          margin: 8px 0;
          position: relative;
          box-shadow:
            0 0 20px rgba(255, 0, 0, 0.3),
            inset 0 0 20px rgba(255, 0, 0, 0.2);
          animation: dangerGradient 3s ease infinite,
                    dangerPulse 2s infinite;
          transition: opacity 1s ease-in;
        `)
      } else {
        post.setAttribute('style', `
          opacity: 0;
          border: 2px solid transparent !important;
          background:
            linear-gradient(#000, #000) padding-box,
            linear-gradient(45deg,
              #00ff00, #00ffaa, #00ffff, #00aaff, #0066ff, #00ff00) border-box;
          background-size: 300% 300%;
          border-radius: 16px;
          margin: 8px 0;
          box-shadow:
            0 0 20px rgba(0, 255, 128, 0.3),
            inset 0 0 20px rgba(0, 255, 128, 0.2);
          animation: gradientBorder 3s ease infinite,
                    safePulse 2s infinite;
          transition: opacity 1s ease-in;
        `)
      }

      // Add slight delay before fade in
      await new Promise(resolve => setTimeout(resolve, 50));

      // Trigger reflow and fade in
      requestAnimationFrame(() => {
        post.style.opacity = '1';
      });

      // Keep existing animations for safe posts
      const style = document.createElement('style')
      style.textContent = `
        @keyframes gradientBorder {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes safePulse {
          0% {
            box-shadow: 0 0 20px rgba(0, 255, 128, 0.3),
                        inset 0 0 20px rgba(0, 255, 128, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(0, 255, 128, 0.5),
                        inset 0 0 30px rgba(0, 255, 128, 0.3);
          }
          100% {
            box-shadow: 0 0 20px rgba(0, 255, 128, 0.3),
                        inset 0 0 20px rgba(0, 255, 128, 0.2);
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

  // Add scroll handler
  let lastScrollPosition = 0
  const scrollThreshold = 100 // Reduced threshold for more frequent deletion

  window.addEventListener('scroll', () => {
    const currentPosition = window.scrollY
    if (currentPosition - lastScrollPosition > scrollThreshold) {
      lastScrollPosition = currentPosition

      // Find all visible posts and process them
      const posts = document.querySelectorAll('article[data-testid="tweet"]')
      posts.forEach(post => {
        const rect = post.getBoundingClientRect()
        // If post is visible in viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          // Mark posts before deleting them
          markPost(post)
          // Optional: Add a delay before deletion to show the marking
          // setTimeout(() => deletePost(post), 2000) // 2 second delay
        }
      })
    }
  })

  browser.runtime.onMessage.addListener((message: any) => {
    if (!message || !message.type) return
    if (message.type === 'PING') {
      // Used for background. When user clicks on the extension icon, content script may be not injected.
      // It's a way to check liveness of the content script
      return Promise.resolve('PONG')
    } else if (message.type === 'GET_CONTEXT_TREE') {
      return Promise.resolve(cloneContextTree(core.tree))
    } else if (message.type === 'GET_SUITABLE_PARSERS') {
      return Promise.resolve(suitableParsers)
    } else if (message.type === 'GENERATE_PARSER_CONFIG') {
      return Promise.resolve(generateParserConfig())
    } else if (message.type === 'IMPROVE_PARSER_CONFIG') {
      return Promise.resolve(improveParserConfig(message.params.parserConfig, message.params.html))
    } else if (message.type === 'DELETE_PARSER_CONFIG') {
      return Promise.resolve(deleteParser(message.params))
    } else if (message.type === 'SAVE_LOCAL_PARSER_CONFIG') {
      return Promise.resolve(saveLocalParserConfig(message.params))
    }
    // else if (message.type === 'PICK_ELEMENT') {
    //   return Promise.resolve(picker.pickElement())
    // }
  })

  // Add post deletion functionality for Twitter
  if (window.location.hostname.includes('twitter.com') ||
    window.location.hostname.includes('x.com')) {

    let lastScrollPosition = 0
    const scrollThreshold = 1000

    window.addEventListener('scroll', () => {
      const currentPosition = window.scrollY
      if (currentPosition - lastScrollPosition > scrollThreshold) {
        lastScrollPosition = currentPosition

        // Get all visible posts
        const posts = document.querySelectorAll('div[data-testid="cellInnerDiv"]')
        posts.forEach(post => {
          const rect = post.getBoundingClientRect()
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            // deletePost(post)
          }
        })
      }
    })
  }
}

function cloneContextTree(tree: IContextNode): ClonedContextNode {
  const clonedParsedContext = { ...tree.parsedContext }
  delete clonedParsedContext.id

  return {
    namespace: tree.namespace,
    contextType: tree.contextType,
    id: tree.id,
    parsedContext: clonedParsedContext,
    children: tree.children.map((child) => cloneContextTree(child)),
  }
}

function cloneContextSubtree(node: IContextNode): ClonedContextNode {
  const clonedParsedContext = { ...node.parsedContext }
  delete clonedParsedContext.id
  return {
    namespace: node.namespace,
    contextType: node.contextType,
    id: node.id,
    parsedContext: clonedParsedContext,
    parentNode: node.parentNode ? cloneContextSubtree(node.parentNode) : null,
  }
}

main().catch(console.error)
