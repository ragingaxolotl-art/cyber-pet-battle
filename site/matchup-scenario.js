import {defaultStats, STATS} from './shared/combat-model.js?v=20261110-defense-report-arena';

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function validateMatchupStats(stats) {
  if (!isRecord(stats) || STATS.some(stat => !Number.isInteger(stats[stat]) || stats[stat] < 0 || stats[stat] > 99)) {
    throw Error('Use whole training stats from 0 to 99 for both fighters.');
  }
}

// Normalize older saves before changing any controls. Never coerce damaged values
// (for example null or numeric strings) into a different, apparently valid setup.
export function normalizeMatchupScenario(saved, attacks) {
  if (!saved) throw Error('No saved scenario.');
  if (saved.version !== 1) throw Error('This saved scenario version is not supported.');
  if (!isRecord(saved.options)) throw Error('The saved scenario settings are incomplete.');
  const options = {
    distance:50, offset:0, frames:900, heightA:0, heightB:0,
    energyA:100, energyB:100, statsA:defaultStats(), statsB:defaultStats(),
    placement:'center', actionB:'attack', followupId:'', followupFrame:12,
    movementA:null, recoveryBFrame:null, ...saved.options,
  };
  for (const side of ['A', 'B']) validateMatchupStats(options['stats'+side]);
  if (!Number.isInteger(options.frames) || options.frames < 1 || options.frames > 900) {
    throw Error('Use a test duration from 1 to 900 frames.');
  }
  if (!Number.isInteger(options.followupFrame) || options.followupFrame < 0 || options.followupFrame > 899) {
    throw Error('Use a follow-up frame from 0 to 899.');
  }
  if (typeof options.followupId !== 'string') throw Error('Choose a supported follow-up attack.');
  if (options.movementA !== null) {
    if (!isRecord(options.movementA)) throw Error('Choose a supported movement attempt.');
    options.movementA = {direction:-1, ...options.movementA};
    if (![-1, 1].includes(options.movementA.direction)) throw Error('Choose a left or right movement direction.');
  }
  const first = attacks.find(attack => attack.id === saved.a);
  const second = attacks.find(attack => attack.id === saved.b);
  if (!first || !second) throw Error('A saved attack is unavailable. Import its project or tree first.');
  const followup = options.followupId ? attacks.find(attack => attack.id === options.followupId) : null;
  if (options.followupId && !followup) throw Error('The saved follow-up is unavailable. Import its project or tree first.');
  return {scenario:{version:1, a:first.id, b:second.id, options}, first, second, followup};
}
