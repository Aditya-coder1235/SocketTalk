const express = require("express")
const router = express.Router()

const {
    signup,
    login,
    logout
} = require("../controller/user.controller")


router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)

module.exports = router