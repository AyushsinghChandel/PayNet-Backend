import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const MongoDbUrl = process.env.DB_URL;
mongoose.connect(MongoDbUrl)
    .then(() => console.log("Connected to Database"))
    .catch((err) => console.error("Database connection error:", err));

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 8, 
        maxLength: 100
    },
    firstname:{
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastname:{
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
});

const accountSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
});

const User = mongoose.model('User', userSchema);
const Account = mongoose.model("Account", accountSchema);
export{ 
    User,
    Account
};