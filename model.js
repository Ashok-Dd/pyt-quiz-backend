import mongoose from 'mongoose'
const UserSchema = new mongoose.Schema({
    name: {
        type: String , 
        required: true
    } , 
    marks: {
        type: Number , 
        required: false
    },
    email: { 
        type: String,
        required: true, 
        unique: true 
    },
    otp: { 
        type: String,
        required: true 
    },  
    otpExpires: { 
        type: Date, 
        required: true 
    },  
    isVerified: { 
        type: Boolean,
        default: false 
    },
    isSubmitted: {
        type: Boolean , 
        default: false
    }
})

const User = mongoose.model('User', UserSchema);

export default User;