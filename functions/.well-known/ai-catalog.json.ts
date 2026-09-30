// Legacy predecessor path for ARD discovery (§5.1). Consumers MAY consult it.
// Delegates to the canonical /.well-known/ard.json Function so there is one
// source of truth. See functions/.well-known/ard.json.ts for the rationale.
export { onRequestGet } from './ard.json';
