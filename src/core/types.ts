import { JsonParserConfig } from './parsers/json-parser'

export enum ParserType {
  Microdata = 'microdata',
  Json = 'json',
  MWeb = 'mweb',
  Link = 'link',
  Unknown = 'unknown',
}

export type ParserConfig = {
  id: string
  parserType: ParserType
  contexts?: JsonParserConfig | null
}
