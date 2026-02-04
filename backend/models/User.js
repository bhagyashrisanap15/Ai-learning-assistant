import mongoose, { Mongoose } from "mongoose";
import bcrypt from 'bcryptjs';
import { PasswordException } from "pdf-parse";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'please provide a username'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 character long']
    },
    email: {
        type: String,
        required: [true, 'please provide an email'],
        unique: true,
        lowercase: true,
        match: [/^\s+@\s+\.\s+$/, 'please provide a valid email']
    },
    Password: {
        type: String,
        required: [true, 'please provide a password'],
        minlength: [3, 'Password must be at least 6 character long'],
        select: false
    },
    profileImage: {
         type: String,
         default: null
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next){
    if (!this.isModified('Password')){
        next();
    }

    const salt = await bcrypt.gettSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchpassword = async function(enteredpassword){
    return await bcrypt.compare(enteredpassword, this.password);

};

const User = mongoose.model('User', userSchema);

export default User;