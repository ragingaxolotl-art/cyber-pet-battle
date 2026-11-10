// One message drives visible text, tooltip and accessible name for both decks.
export function attackSlotStatus({attack, reason = '', cooldown = 0, costMultiplier = 1, paused = false, finished = false}) {
 if (!attack) return 'Empty slot';
 if (finished) return 'Round finished · restart to attack';
 if (paused) return 'Paused · resume to attack';
 if (reason === 'Cooling down') return `Cooling down · ${(Math.max(0, cooldown) / 60).toFixed(1)}s`;
 if (reason) return reason;
 return attack.cost === 0 ? 'Ready · free' : `Ready · ${Math.ceil(attack.cost * costMultiplier)} energy`;
}
