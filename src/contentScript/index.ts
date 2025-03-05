import { Core, IContextNode, ParserConfig } from '../core'
import browser from 'webextension-polyfill'
import Background from '../common/background'
import { ClonedContextNode } from '../common/types'
import { utils } from '../utils'
import schemaObj from "../parserSchema/all.json"
import { markPost } from './twitter'

async function main() {
  const core = new Core()

  core.tree.on('childContextAdded', handleNewContext)

  const parsers = schemaObj

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
          markPost(post)
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
