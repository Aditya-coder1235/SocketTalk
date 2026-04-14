const express = require("express");
const router = express.Router();

const { isAuth } = require("../middleware/isAuth");
const { accessChat, fetchChats } = require("../controller/chat.controller");

router.post("/", isAuth, accessChat);
router.get("/", isAuth, fetchChats);

module.exports = router;
