import { Schema, model } from "mongoose";

const itemSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  iconUrl: {
    type: String,
    required: true,
  },
  value: {
    type: Schema.Types.Decimal128,
    required: true,
  },
}, { timestamps: true });


export const Item = model("Item", itemSchema);
