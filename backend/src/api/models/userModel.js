import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    status: { type: String, enum: ["online", "offline"], default: "offline" },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// remove password from the returned user object
userSchema.methods.toJSON = function(){
    const user = this.toObject();
    delete user.password;
    return user;
}

const UserModel = mongoose.model('User', userSchema);

export default UserModel;