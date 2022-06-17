import fork from 'react-fork'

export type Note = {
  id: number
  title: string
  content: string
}

export const { ForkProvider, useFork } = fork(
  { block: true, notes: [] as Note[] },
  (set) => ({
    unlock() {
      set({ block: false })
    },
  })
)
