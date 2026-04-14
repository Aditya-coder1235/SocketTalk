const User = require("../models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

exports.signup = async (req, res) => {
    try {

        const { name, email, password } = req.body

        const userExist = await User.findOne({ email })

        if (userExist) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        res.status(201).json({
            success: true,
            message: "User registered successfully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Signup failed"
        })
    }
}


exports.login = async (req, res) => {
    // console.log(req.body)
    try {

        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            })
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Login failed"
        })
    }
}

exports.allUsers = async (req, res) => {
    try {
        const keyword = req.query.search ? {
            $or: [
                {name: {$regex: req.query.search, $options:"i"}},
                { email: { $regex: req.query.search, $options: "i" }}
            ]
        } : {};

        const users=await User.find(keyword).find({_id:{$ne:req.user.id}})

        // console.log(keyword);

        res.status(200).json({
            success: true,
            search: users
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

exports.logout = async (req, res) => {
    res.clearCookie("token")

    res.json({
        success: true,
        message: "Logged out successfully"
    })
}

exports.me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("name email pic");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch current user",
        });
    }
};