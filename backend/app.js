const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const cookieParser = require("cookie-parser")
require("dotenv").config()
const port=process.env.PORT;

const authRoutes = require("./routes/user.routes")

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err))

app.use("/api/auth", authRoutes)

app.listen(port, () => {
    console.log("Server running on port 5000")
})