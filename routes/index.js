const express = require("express");
const router = express.Router();

const register = require("./user/register.js");
const auth = require("./user/auth.js");
const login = require("./user/login.js");
//const logout = require("./user/logout.js")
const chat = require("./chat/chat.js")
const clinic = require("./clinic/index.js")
const mission = require("./mission/index.js")
const quiz = require("./quiz/quiz.js")
const calendar = require("./calendar/index.js")

router.use("/register", register);
router.use("/auth", auth);
router.use("/login", login);
//router.use("/logout", logout);
router.use("/chat", chat);
router.use("/clinic", clinic);
router.use("/mission", mission);
router.use("/quiz", quiz);
router.use("/calendar", calendar);

module.exports = router;