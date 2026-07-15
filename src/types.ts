export type Gender = 'female' | 'male'

export interface User {
  name: string
  email: string
  dob: string
  gender: Gender
}

export interface Character {
  id: string
  name: string
  gender: string
  height: string
  dress: string
  dressColor: string
  age: string
  description: string
  imageUrl?: string
}

export interface Dialogue {
  id: string
  characterId: string
  text: string
  emotion: string
  expression: string
}

export interface Situation {
  id: string
  location: string
  description: string
  emotion: string
  time: string
  weather: string
  dialogues: Dialogue[]
}

export interface TikTik {
  date: string
  time: string
  year: string
}

export interface ComicProject {
  id: string
  title: string
  createdAt: string
  language: string
  emotion: string
  pages: number
  characters: Character[]
  situations: Situation[]
  tikTik: TikTik
  thumbnail?: string
  status: 'draft' | 'generated'
  frontCover?: FrontCover
  backCover?: BackCover
}

export interface FrontCover {
  title: string
  authorName: string
  characterArrangement: string
  comicStyle: string
  coverTheme: string
  backgroundColor: string
  typography: string
  characterImageUrl?: string
}

export interface BackCover {
  authorName: string
  authorDescription: string
  signatureDataUrl?: string
}
