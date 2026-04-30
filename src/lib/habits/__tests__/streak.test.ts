import { calcularStreakAtual, calcularStreakMaximo, calcularProgressoDesafio } from '../streak'

describe('streak module', () => {
  it('can be imported without errors', () => {
    expect(typeof calcularStreakAtual).toBe('function')
    expect(typeof calcularStreakMaximo).toBe('function')
    expect(typeof calcularProgressoDesafio).toBe('function')
  })
})
