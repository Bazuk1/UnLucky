import { Schema, model } from "mongoose";

const caseOpeningSchema = new Schema({
  case: {
    type: Schema.Types.ObjectId,
    ref: 'Case'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  itemWon: {
    type: Schema.Types.ObjectId,
    ref: 'Item'
  },
  nonce: {
    type: Number,
    unique: true,
    default: 0,
  },
  roll: {
    type: Number,
  }
}, { timestamps: true });


export const CaseOpening = model("CaseOpening", caseOpeningSchema);
