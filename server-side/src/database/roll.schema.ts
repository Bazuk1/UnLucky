import { Schema, model } from "mongoose";

const rollSchema = new Schema({
  status: {
    type: String,
    enum: ['CREATED', 'FINISHED', 'STARTED'],
    default: "CREATED",
  },
  scheduledAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
  },
  rollValue: {
    type: null || Number,
    default: null,
  },
  nonce: {
    type: Number,
    unique: true,
    default: 0,
  },
  bets: {
    type: [
      {
        bet: {
          betType: String,
          amount: Number,
          payoutMultiplier: {
            type: Number,
            enum: [2, 14, 7],
            default: 2
          }
        },
        user: {
          user_id: String,
          username: String,
          avatar: String,
          accountLvl: Number,
        }
      }
    ],
    default: []
  }
}, { capped: { max: 100 } });


export const Roll = model("Roll", rollSchema);
