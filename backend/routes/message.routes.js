const express = require("express");
const router = express.Router();

const { isAuth } = require("../middleware/isAuth");
const { sendMessage, getMessages } = require("../controller/message.controller");

router.post("/", isAuth, sendMessage);
router.get("/:chatId", isAuth, getMessages);

module.exports = router;
