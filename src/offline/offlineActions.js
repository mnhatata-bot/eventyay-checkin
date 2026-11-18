import { lookupBySecret } from '@/offline/memoryIndex'

export const MISSING_OFFLINE_DATA_MESSAGE =
  'Please connect to the internet to fetch the latest check-in data, then try again.'

export function isBrowserOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

export function evaluateLocalRedeem(index, secret, { listId } = {}) {
  const lookup = lookupBySecret(index, secret)
  if (lookup.status === 'revoked') return { ok: false, reason: 'revoked', message: 'This ticket has been revoked.' }
  if (lookup.status !== 'found') return { ok: false, reason: 'missing', message: MISSING_OFFLINE_DATA_MESSAGE }

  const position = lookup.position
  // Never infer paid entitlement from an empty or pending ('n') order status.
  if (position.orderStatus !== 'p') {
    return { ok: false, reason: 'unpaid', message: 'This ticket is not verified as paid.' }
  }
  const numericList = Number(listId)
  if (!Number.isSafeInteger(numericList) || numericList <= 0 || !Array.isArray(position.listIds) ||
      !position.listIds.some(id => Number(id) === numericList)) {
    return { ok: false, reason: 'list-not-authorized',
      message: 'This ticket has no verified authorization for the selected list.' }
  }
  // Legacy listIds are inferred from past check-ins, not an issuer-signed
  // device/list/zone entitlement. No offline gate-opening decision is safe.
  return { ok: false, reason: 'server-admission-verification-required',
    message: 'Offline admission is unavailable until the ticket and scanner permissions are verified by the server.' }
}

export function applyLocalCheckin() {
  // Never create a successful synthetic check-in from mutable browser state.
  throw new Error('Offline check-in requires authoritative server reconciliation')
}

export function enqueuePendingRedeem(index, entry) {
  index.pendingRedeems = [...(index.pendingRedeems || []), entry]
}

export function enqueuePendingRegistration(index, entry) {
  index.pendingRegistrations = [...(index.pendingRegistrations || []), entry]
}

export async function flushPendingRedeems(index) {
  // An old queued event may be based on unsigned/partial ticket evidence.
  // Retain it for a trusted server-side reconciliation adapter; never POST it.
  const remaining = [...(index.pendingRedeems || [])]
  return { flushed: 0, remaining, requiresServerVerification: remaining.length > 0 }
}

export async function flushPendingRegistrations(index) {
  // Never create orders on a device after uncertain acknowledgement, and
  // never invoke mark_paid: server-verified idempotency/entitlement is required.
  const remaining = [...(index.pendingRegistrations || [])]
  return { flushed: 0, remaining, requiresIdempotentServerFlow: remaining.length > 0 }
}
