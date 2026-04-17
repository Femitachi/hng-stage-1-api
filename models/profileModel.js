import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    gender: String,
    gender_probability: Number,
    sample_size: Number,
    age: Number,
    age_group: String,
    country_id: String,
    country_probability: Number,
    processed_at: String
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);