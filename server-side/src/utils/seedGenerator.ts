import { randomBytes, createHash, createHmac } from 'crypto';

// Generates serverSeed or publicSeed
export function generateRandomSeed() {
    const seedLength = 32;
    const seed = randomBytes(seedLength).toString('hex');
    return seed;
}

// inputString is a string that the user enters or his user_id
export function generateClientSeed(inputString: string) {
    const hash = createHash('sha256');
    const seed = hash.update(inputString).digest('hex');
    return seed;
}


export function getCombinedSeed(game: "ROLL" | "CASEPVP" | "CASEOPENING" , serverSeed: string, otherSeed: string, nonce: number) {
    const seedParameters = [serverSeed, otherSeed, nonce];
    if (game) seedParameters.unshift(game);
    return seedParameters.join('-')
}

export function getRandomInt({ max, seed }: { max: number, seed: string }) {
    const hash = createHmac('sha256', seed).digest('hex');
    const subHash = hash.slice(0, 13);
    const valueFromHash = Number.parseInt(subHash, 16);
    const e = Math.pow(2, 52);
    const result = valueFromHash / e;
    return Math.floor(result * max);
}