import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

interface User extends Document {
  name: string;
  email: string;
  password: string;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

//hashing password before saving the document
UserSchema.pre("save", async function (next) {
  const user = this as User;
  //only hashing the password if it has been modified
  if (!user.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

//method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string) : Promise<boolean>{
    const user = this as User
    return await bcrypt.compare(candidatePassword, user.password)
}

export const User = model<User>('User', UserSchema)