import { defineStore } from 'pinia'

export const useBaseStore = defineStore('baseStore', {
  state: () => ({
    text: 'helloWorld',
    counter: 0,
  }),
  getters: {
    getText: (state) => state.text,
    getCounter: (state) => state.counter,
  },
  actions: {
    setVariableText(newValue) {
      this.text = newValue
    },
    incrementCounter() {
      this.counter++
    },
  },
})
