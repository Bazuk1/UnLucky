import { Schema, model } from "mongoose";

const caseSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  iconUrl: {
    type: String,
    required: true,
  },
  price: {
    type: Schema.Types.Decimal128,
    required: true,
  },
  lvlRequired: {
    type: Number,
    default: 1,
  },
  openable: {
    type: Boolean,
    default: true,
  },
  slots: {
    type: [
        {
            idx: {
                type: Number,
                required: true
            },
            rate: {
                type: Schema.Types.Decimal128,
                required: true
            },
            rollStart: {
              type: Number,
              required: true
            },
            rollEnd: {
              type: Number,
              required: true
            },
            item: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
                required: true
            }
        }
    ],
    required: true
  }
}, { timestamps: true });


export const Case = model("Case", caseSchema);
