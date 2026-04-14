const express = require("express")
const router = express.Router()

const {
    signup,
    login,
    logout,
    allUsers,
    me
} = require("../controller/user.controller")
const { isAuth } = require("../middleware/isAuth")


router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)
router.get("/me", isAuth, me)
router.get('/',isAuth,allUsers)

module.exports = router