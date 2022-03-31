export type Note = {
  id: number
  title: string
  content: string
}

export type Mind = {
  notes: Note[]
  block: boolean
  unlock: () => Promise<void>
}
