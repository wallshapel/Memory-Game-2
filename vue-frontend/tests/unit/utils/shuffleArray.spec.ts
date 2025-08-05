// tests/unit/utils/shuffleArray.spec.ts
import { describe, it, expect } from 'vitest'
import { shuffleArray } from '../../../src/utils/shuffleArray'

describe('shuffleArray', () => {
  it('debe devolver un array con los mismos elementos, aunque el orden pueda cambiar', () => {
    const arr = [1, 2, 3, 4, 5]
    const shuffled = shuffleArray([...arr])
    // Mismos elementos, distinto orden posible
    expect(shuffled.sort()).toEqual(arr.sort())
  })

  it('no debe modificar el array original', () => {
    const arr = [10, 20, 30]
    const copy = [...arr]
    shuffleArray(arr)
    expect(arr).toEqual(copy)
  })

  it('debe funcionar con array vacío', () => {
    expect(shuffleArray([])).toEqual([])
  })

  it('debe funcionar con un solo elemento', () => {
    expect(shuffleArray([99])).toEqual([99])
  })
})
