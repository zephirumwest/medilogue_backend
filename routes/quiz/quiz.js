const express = require("express");
const router = express.Router();

const Quiz = require("../../model/quiz");
const User = require("../../model/user");

const utils = require("../../utils.js");

router.get("/", async (req, res) => {
  //퀴즈 목록을 불러오는 API
  try {
    const quizzes = await Quiz.find();
    console.log(quizzes);
    const quiz_group = quizzes.reduce((acc, quiz) => {
      const quiz_category = quiz.category;
      if (!acc[quiz_category]) {
        acc[quiz_category] = [];
      }
      acc[quiz_category].push({quiz_id: quiz._id, quiz_content: quiz.content, quiz_answer: quiz.answer});
      return acc;
    }, {});

    let quiz_list = new Array();
    for (const category in quiz_group) {
      const quiz = quiz_group[category];
      quiz_list.push({category:category, quiz_cnt: quiz.length});
    }
    
    return res.status(200).json({
      success: true,
      quiz_list: quiz_list,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
});

router.get("/:category", async (req, res) => {
  //해당 카테고리에 속한 문제들을 불러오는 API
  //구현 우선순위 낮음
  try {
    return res.status(200).json({
      success: true,
      quizzes: quizzes,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
});

router.post("/result", async (req, res) => {
  //퀴즈 응시 후, 결과를 저장하는 API
  /*
  성공하면 {
    "success": true
  } 로 응답이 온다.
  */
  try {
    const { uid, category, quiz_results } = req.body;
    let user = await User.findOne({uid: uid});
    if(user != undefined){
      console.log(user.quizResults);
      const existingResultIndex = user.quizResults.findIndex(data => data.category === category);
      if (existingResultIndex !== -1) {
        user.quizResults[existingResultIndex] = { category: category, results: quiz_results };
      } else {
        user.quizResults.push({ category: category, results: quiz_results });
      }
      await user.save(async (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(400).json({
            success: false,
            error: [{ msg: err }],
          });
        }
        return res.status(200).json({
          success: true,
        });
      });        
    }
    else{
        return res.status(404).json({
          success: false,
          message: "user not found",
        });
    }

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
});

router.get("/feedback", async (req, res) => {
  //환자에게 퀴즈에 대한 피드백을 보여주는 API
  //filter를 이용해서 틀린 문제만 가져온다.
  try {
    const token = req.header("Authorization").split(" ")[1];
    const user_data = utils.parseJWTPayload(token);
    let user = await User.findOne({uid: user_data.user.uid});
    if(user != undefined){
      var feedback = new Array();
      for(var i=0; i<user.quizResults.length; i++){
        feedback.push(user.quizResults[i].results.filter((quiz) => quiz.result === false));
      }
      return res.status(200).json({
          success: true,
          feedback: feedback,
      });
    }
    else{
        return res.status(400).json({
          success: false,
          message: "user not found",
        });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
});

module.exports = router;