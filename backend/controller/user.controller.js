const User = require("../models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// signup
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


// login
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


// logout
exports.logout = async (req, res) => {
    res.clearCookie("token")

    res.json({
        success: true,
        message: "Logged out successfully"
    })
}