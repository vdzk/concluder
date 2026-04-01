const adjectives = [
  'swift', 'bold', 'quiet', 'bright', 'calm', 'clever', 'fierce',
  'gentle', 'keen', 'lively', 'noble', 'proud', 'rare', 'sharp',
  'silent', 'tender', 'wise', 'brave', 'golden', 'ancient', 'crisp',
  'daring', 'eager', 'fluffy', 'graceful', 'humble', 'icy', 'jolly',
];

const creatures = [
  'fox', 'wolf', 'bear', 'eagle', 'hawk', 'deer', 'otter', 'heron',
  'crane', 'lynx', 'raven', 'oak', 'pine', 'fern', 'rose', 'cedar',
  'willow', 'maple', 'birch', 'lily', 'reed', 'finch', 'vole', 'moth',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateName(): string {
  return `${pick(adjectives)} ${pick(creatures)}`;
}
