import { TargetService } from './target/target.service'

export const utils = {
  isTargetMet: TargetService.isTargetMet.bind(TargetService),
}

export const capitalizeWords = (str: string) => str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())

export const getNameFromId = (id: string) => {
  const parts = id.split('/')
  return capitalizeWords(parts[parts.length - 1])
}

export const getUserDataIid = (topic: string, address: string) => {
  const slice = address.slice(-10)

  return `${topic}-${slice}`
}
