import express from 'express';
import { z } from 'zod';
import { Account, User } from '../db.js';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import bcrypt from "bcrypt";
import { authMiddleware } from '../middlewares/middleware.js';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const userRouter = express.Router();

const signupSchema = z.object({
    username: z.string().email(),
    password: z.string().min(8,"Password must contain 8 characters").refine(
        (password) => /[A-Z]/.test(password),{
            message: "Password must contain atleast one captial letter"
        }
    ).refine(
        (password)=> /[!@#$%^&*(),.?":{}|<>]/.test(password),{
            message: "Password must contain atleast one special character"
        }
    ),
    firstname: z.string(),
    lastname: z.string()
});
userRouter.post("/signup",async (req,res)=> {
    const {success} = signupSchema.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message:"Incorrect credentials"
        })
    }
    const existingUser = await User.findOne({
        username: req.body.username
    })
    console.log("Checking user for:", req.body.username);
    if(existingUser){
        return res.status(411).json({
            message: "User already exist"
        })
    }
    const password = req.body.password;
    const hashedPassoword = await bcrypt.hash(password,5);
    const user = await User.create({
        username: req.body.username,
        password: hashedPassoword,
        firstname: req.body.firstname,
        lastname: req.body.lastname
    })

    const userId = user._id;
    await Account.create({
        userId,
        balance: 1 + Math.random()*10000
    })

    res.json({
        message: "User created successfully"
    })
})

userRouter.post("/signin", async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;

    const user = await User.findOne({
        username
    })
    if(!user){
        res.status(411).json({
            message: "Incorrect credentials"
        })
        return;
    }
    const passwordMatch = await bcrypt.compare(password,user.password);
    const userId = user._id;
    if(passwordMatch){
        const token = jwt.sign({
            userId
        },JWT_SECRET)
        res.json({
            token: token
        })
    }else{
        res.status(411).json({
            message: "Inncorrect Credentials`"
        })
    }
})

const updateSchema = z.object({
    password: z.string().min(8,"Password must contain 8 characters").refine(
        (password) => /[A-Z]/.test(password),{
            message: "Password must contain atleast one captial letter"
        }
    ).refine(
        (password)=> /[!@#$%^&*(),.?":{}|<>]/.test(password),{
            message: "Password must contain atleast one special character"
        }
    ).optional(),
    firstname: z.string().optional(),
    lastname: z.string().optional()
});

userRouter.put("/", authMiddleware, async (req, res) => {
    const { success } = updateSchema.safeParse(req.body);
    
    if (!success) {
        return res.status(411).json({
            message: "Something went wrong"
        });
    }

    if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 5);
    }

    const result = await User.updateOne({ _id: req.userId }, req.body);

    res.json({
        message: "Data updated successfully"
    });
});

userRouter.get("/bulk", async (req,res) => {
    const filter = req.query.filter||"";
    const users = await User.find({
        $or:[{
            firstname: {
                "$regex": filter
            }
        },{
            lastname:{
                "$regex": filter
            }
        }]
    })
    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstname,
            lastName: user.lastname,
            _id: user._id
        }))
    })
})

export{userRouter};