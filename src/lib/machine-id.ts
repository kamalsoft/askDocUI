/**
 * Generates or retrieves a persistent unique identifier for this browser instance.
 * This ID is used by the SQLite backend to isolate conversation history.
 */
export function getMachineId(): string {
  if (typeof window === 'undefined') return 'server-env';

  let machineId = localStorage.getItem('askdocs_machine_id');
  
  if (!machineId) {
    machineId = `client-${crypto.randomUUID()}`;
    localStorage.setItem('askdocs_machine_id', machineId);
  }

  return machineId;
}