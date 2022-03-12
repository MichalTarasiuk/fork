export type Note = {
  id: number
  title: string
  content: string
}

export type State = {
  notes: Note[]
  block: boolean
  unlock: () => Promise<unknown>
}
