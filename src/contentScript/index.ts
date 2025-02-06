import { Core, IContextNode, ParserConfig } from '../core'
import browser from 'webextension-polyfill'
import Background from '../common/background'
import { ClonedContextNode } from '../common/types'
import { utils } from '../utils'

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

  async function deletePost(postElement: Element) {
    try {
      // Simply remove the post element from the DOM
      postElement.remove()
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

      // Find all visible posts and remove them
      const posts = document.querySelectorAll('article[data-testid="tweet"]')
      posts.forEach(post => {
        const rect = post.getBoundingClientRect()
        // If post is visible in viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          deletePost(post)
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
            deletePost(post)
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
