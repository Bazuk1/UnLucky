import { generateRandomSeed } from "../utils/seedGenerator";
import { Seed } from "./seed.schema";



async function updateServerSeed(check: boolean) {
    try {
        if (check) {
            const serverSeed = await Seed.findOne({ seedType: "SERVER", expiresAt: { $lte : new Date(Date.now() + 86400000) } }).sort({ _id:-1 });
            if (!!serverSeed) return { status: 409, data: {} }
        }
        const newSeed = generateRandomSeed();
        await Seed.create({
            seedType: "SERVER",
            seed: newSeed,
        })
        return { status: 200, data: { serverSeed: newSeed } }
    } catch (e) {
        console.log("Error generating server seed")
        return { status: 500, data: {} }
    }
}

async function updatePublicSeed(check: boolean) {
    try {
        if (check) {
            const publicSeed = await Seed.findOne({ seedType: "PUBLIC", expiresAt: { $lte : new Date(Date.now() + 86400000) } }).sort({ _id:-1 });
            if (!!publicSeed) return { status: 409, data: {} }
        }
        const newSeed = generateRandomSeed();
        await Seed.create({
            seedType: "PUBLIC",
            seed: newSeed,
        })
        return { status: 200, data: { publicSeed: newSeed } }
    } catch (e) {
        console.log("Error generating public seed")
        return { status: 500, data: {} }
    }
}

export async function fetchCurrentSeeds() {
    try {
        const publicSeed = await Seed.findOne({ seedType: "PUBLIC", expiresAt: { $lte : new Date(Date.now() + 86400000) } }).sort({ _id:-1 });
        const serverSeed = await Seed.findOne({ seedType: "SERVER", expiresAt: { $lte : new Date(Date.now() + 86400000) } }).sort({ _id:-1 });

        if (publicSeed) {
            if (serverSeed) {
                return {
                    status: 200,
                    data: {
                        public_seed: publicSeed.seed,
                        server_seed: serverSeed.seed,
                    }
                }
            } else {
                const updatedSeed = await updateServerSeed(false);
                return {
                    status: 200,
                    data: {
                        public_seed: publicSeed.seed,
                        server_seed: updatedSeed.data.serverSeed,
                    }
                }
            }
        } else {
            if (serverSeed) {
                const updatedSeed = await updatePublicSeed(false);
                return {
                    status: 200,
                    data: {
                        public_seed: updatedSeed.data.publicSeed,
                        server_seed: serverSeed.seed,
                    }
                }
            } else {
                const updatedSeedP = await updatePublicSeed(false);
                const updatedSeedS = await updateServerSeed(false);
                return {
                    status: 200,
                    data: {
                        public_seed: updatedSeedP.data.publicSeed,
                        server_seed: updatedSeedS.data.serverSeed,
                    }
                }
            }
        }
    } catch (e) {
        console.log("Error fetching seeds")
        return { status: 500, data: {} }
    }
}