import { describe, expect, it } from 'vitest'

import router from '@/router'

describe('rotas aposentadas', () => {
  it('não registra BlindSpot nem Replay', () => {
    const names = router.getRoutes().map((route) => route.name)

    expect(names).not.toContain('blindspot')
    expect(names).not.toContain('replay')
  })

  it('leva as URLs antigas para o 404', () => {
    expect(router.resolve('/blindspot').name).toBe('not-found')
    expect(router.resolve('/replay').name).toBe('not-found')
  })
})
