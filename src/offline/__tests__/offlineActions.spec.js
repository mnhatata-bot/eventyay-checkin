import { describe, expect, it, vi } from 'vitest'
import { createEmptySnapshot } from '@/offline/normalize'
import { createMemoryIndex } from '@/offline/memoryIndex'
import {
  applyLocalCheckin,
  enqueuePendingRedeem,
  enqueuePendingRegistration,
  evaluateLocalRedeem,
  flushPendingRedeems,
  flushPendingRegistrations,
  MISSING_OFFLINE_DATA_MESSAGE
} from '@/offline/offlineActions'

describe('offlineActions P0 safety gate', () => {
  function indexWithAttendee(status = 'p', lists = [3]) {
    const snapshot = createEmptySnapshot('org', 'evt')
    snapshot.positionsBySecret['sec-1'] = {
      id: 1, secret: 'sec-1', product: 9, orderStatus: status,
      attendeeName: 'Ada', attendeeEmail: 'ada@example.test', checkins: [],
      listIds: lists, searchText: 'ada ada@example.test sec-1'
    }
    return createMemoryIndex(snapshot)
  }

  it('requires network refresh for unknown ticket', () => {
    const result = evaluateLocalRedeem(indexWithAttendee(), 'unknown', { listId: 3 })
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('missing')
    expect(result.message).toBe(MISSING_OFFLINE_DATA_MESSAGE)
  })

  it('denies revoked tickets', () => {
    const index = indexWithAttendee()
    index.revokedSecrets.add('sec-1')
    expect(evaluateLocalRedeem(index, 'sec-1', { listId: 3 }).reason).toBe('revoked')
  })

  it('rejects nonpaid, missing and pending statuses', () => {
    for (const status of ['n', 'pending', '', null, 'r', 'manual']) {
      expect(evaluateLocalRedeem(indexWithAttendee(status), 'sec-1', { listId: 3 }).reason)
        .toBe('unpaid')
    }
    const index = indexWithAttendee()
    index.positionsBySecret.get('sec-1').orderStatus = undefined
    expect(evaluateLocalRedeem(index, 'sec-1', { listId: 3 }).reason).toBe('unpaid')
  })

  it('rejects unknown list and missing entitlement list', () => {
    expect(evaluateLocalRedeem(indexWithAttendee(), 'sec-1', { listId: 2 }).reason)
      .toBe('list-not-authorized')
    expect(evaluateLocalRedeem(indexWithAttendee('p', []), 'sec-1', { listId: 3 }).reason)
      .toBe('list-not-authorized')
  })

  it('denies even paid legacy snapshots until authoritative server reconciliation', () => {
    const r = evaluateLocalRedeem(indexWithAttendee(), 'sec-1', { listId: 3 })
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('server-admission-verification-required')
    expect(() => applyLocalCheckin()).toThrow('authoritative server reconciliation')
  })

  it('preserves legacy queued scans without posting untrusted admission', async () => {
    const index = indexWithAttendee()
    enqueuePendingRedeem(index, { secret: 'sec-1', nonce: 'abc123', lists: [3] })
    const fakeFetch = vi.spyOn(globalThis, 'fetch')
    try {
      const x = await flushPendingRedeems(index, { url: 'https://example.invalid' })
      expect(x.flushed).toBe(0)
      expect(x.remaining).toHaveLength(1)
      expect(x.requiresServerVerification).toBe(true)
      expect(fakeFetch).not.toHaveBeenCalled()
    } finally { fakeFetch.mockRestore() }
  })

  it('preserves legacy pending orders without recreating or calling mark_paid', async () => {
    const index = indexWithAttendee()
    enqueuePendingRegistration(index, { id: 'pending-1', payload: { email: 'new@example.test' } })
    const fakeFetch = vi.spyOn(globalThis, 'fetch')
    try {
      const x = await flushPendingRegistrations(index, { url: 'https://example.invalid' })
      expect(x.flushed).toBe(0)
      expect(x.remaining).toHaveLength(1)
      expect(x.requiresIdempotentServerFlow).toBe(true)
      expect(fakeFetch).not.toHaveBeenCalled()
    } finally { fakeFetch.mockRestore() }
  })
})
