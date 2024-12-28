import { Schema, model } from "mongoose";

const seedSchema = new Schema({
    seedType: {
        type: String,
        required: true
    },
    seed: {
        type: String,
        required: true,
    },
    generatedAt: {
        type: Date,
        default: new Date()
    },
    expiresAt: {
        type: Date,
        default: new Date(Date.now() + 86400000)
    },
}, { timestamps: { createdAt: "generatedAt" }});

export const Seed = model("Seed", seedSchema);
