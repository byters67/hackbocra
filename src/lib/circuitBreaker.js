/**
 * circuitBreaker.js — Circuit Breaker Pattern for External Service Calls
 *
 * Prevents hammering a dead service by tracking consecutive failures.
 *
 * States:
 *   CLOSED    → normal, requests pass through
 *   OPEN      → service down, return fallback immediately (skip network call)
 *   HALF_OPEN → one test request allowed to check if service recovered
 *
 * Brief alignment: Fault tolerance — prevents cascade failures when
 * external APIs (Anthropic, Google Translate) are down.
 *
 * @see src/lib/complaintAnalysis.js — wraps AI classification
 * @see src/App.jsx — React Query handles client-side retries
 */

const circuits = new Map();

function getCircuit(name) {
  if (!circuits.has(name)) {
    circuits.set(name, {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: null,
      failureThreshold: 3,   // 3 consecutive failures → open
      resetTimeout: 30000,   // try again after 30s
    });
  }
  return circuits.get(name);
}

export async function withCircuitBreaker(name, fn, fallback) {
  const circuit = getCircuit(name);

  // OPEN → check if enough time passed to try again
  if (circuit.state === 'OPEN') {
    const elapsed = Date.now() - circuit.lastFailureTime;
    if (elapsed >= circuit.resetTimeout) {
      circuit.state = 'HALF_OPEN';
    } else {
      console.warn(`[CircuitBreaker] ${name}: OPEN → serving fallback`);
      return fallback();
    }
  }

  try {
    const result = await fn();
    // Success → reset
    circuit.state = 'CLOSED';
    circuit.failureCount = 0;
    return result;
  } catch (error) {
    circuit.failureCount++;
    circuit.lastFailureTime = Date.now();

    if (circuit.failureCount >= circuit.failureThreshold) {
      circuit.state = 'OPEN';
      console.error(
        `[CircuitBreaker] ${name}: ${circuit.failureCount} failures → OPEN`,
      );
    }

    return fallback();
  }
}

export function getCircuitStates() {
  const states = {};
  circuits.forEach((circuit, name) => {
    states[name] = {
      state: circuit.state,
      failureCount: circuit.failureCount,
    };
  });
  return states;
}
