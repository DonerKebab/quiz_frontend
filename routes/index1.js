var express = require('express');
var router = express.Router();
var utils = require("./utils")



/* GET home page. */
router.use('/quiz/:testId/:setId/:questionId?', async (req, res, next) => {
	console.log('method: ' + req.method)
	let setId = req.params.setId
	let testId = req.params.testId
	let reqQuestionId = req.params.questionId;
	if (req.method === 'GET') {
		if (reqQuestionId === undefined) {
			var queryFirstQuestion = `select * from tbl_question where question_set = ${setId} LIMIT 1`
			var firstQuestion = await utils.selectDB(queryFirstQuestion)
			var questionId = parseInt(firstQuestion[0]['id'])
			var prevQuestionId = undefined;
			// load the 1st question and answer in set
			let getListAnswers = `select * from tbl_answer where question_id = ${questionId}`
			let answersBelong = await utils.selectDB(getListAnswers);
			res.render('index', { prevQuestionId: prevQuestionId, testId: testId, questionSet: setId, question: firstQuestion[0], answers: answersBelong });
		} else {
			// get distinct question from choice with test_id
			var questionId = parseInt(reqQuestionId)
			var queryAllQuestionInChoice = `select min(question_id) as id from tbl_choice where test_id=${testId} group by question_id`
			var allQuestionInChoice = await utils.selectDB(queryAllQuestionInChoice)
			// get prev question
			for (let i = 1; i < allQuestionInChoice.length; i++) {
				if (questionId == allQuestionInChoice[i].id) {
					var prevQuestionId = allQuestionInChoice[i - 1].id;
					break;
				}
			}
			// get in4 of prev question
			var queryPrevQuestion = `select * from tbl_question where id = ${questionId}`
			var prevQuestion = await utils.selectDB(queryPrevQuestion)
			console.log(JSON.stringify(prevQuestion))
			// load the 1st question and answer in set
			let getListAnswers = `select * from tbl_answer where question_id = ${questionId}`
			let answersBelong = await utils.selectDB(getListAnswers);
			res.render('index', { prevQuestionId: prevQuestionId, testId: testId, questionSet: setId, question: prevQuestion[0], answers: answersBelong });
		}

	}
	if (req.method === 'POST') {
		// get list answer after student choose
		let answerPicked1 = req.body.ans;
		let answerPicked = [];
		if (typeof (answerPicked1) === 'string') {
			answerPicked.push(parseInt(answerPicked1));
		} else {
			answerPicked = answerPicked1;
		}
		// get list is_correct of list answer
		let isTrue = [];
		let currentQuestionId = req.body.questionId;
		let getCurrentListAnswers = `select * from tbl_answer where question_id = ${currentQuestionId}`
		let currentAnswersBelong = await utils.selectDB(getCurrentListAnswers);
		for (let i = 0; i < currentAnswersBelong.length; i++) {
			isTrue.push(currentAnswersBelong[i].is_correct);
		}
		// save student's answer to tbl_choice
		for (let i = 0; i < answerPicked.length; i++) {
			let queryChoice = `insert into tbl_choice (test_id, question_id, answer_id, is_correct) values(${testId}, ${currentQuestionId}, ${answerPicked[i]}, ${isTrue[i]})`;
			await utils.runDB(queryChoice);
		}
		// return next unanswer question
		let queryNextQuestion =
			`select *
				from tbl_question
				where question_set = ${setId}  
				and id not in (select question_id from tbl_choice where test_id=${testId})
			limit 1`
		let nextQuestion = await utils.selectDB(queryNextQuestion);
		if (nextQuestion.length != 0) {
			let nextQuestionId = parseInt(nextQuestion[0]['id'])
			let getNextListAnswers = `select * from tbl_answer where question_id = ${nextQuestionId}`
			let nextAnswersBelong = await utils.selectDB(getNextListAnswers)
			res.render('index', { prevQuestionId: currentQuestionId, testId: testId, questionSet: setId, question: nextQuestion[0], answers: nextAnswersBelong });
		} else {
			// if the current question is end of set, then calculate score
			let queryCountFalseQuestion = `SELECT COUNT(question_id) as num_wrong_ans
											FROM (SELECT DISTINCT question_id FROM tbl_choice WHERE is_correct = 0 and test_id=${testId})`;
			let countFalseQuestion = await utils.selectDB(queryCountFalseQuestion);
			let queryTotalQuestion = `select count(id) as total_question from tbl_question where question_set=${setId}`
			let totalQuestion = await utils.selectDB(queryTotalQuestion);
			let countTrueQuestion = totalQuestion[0].total_question - countFalseQuestion[0].num_wrong_ans;
			let truePercent = (countTrueQuestion / totalQuestion[0].total_question).toFixed(4) * 100;
			if (truePercent >= 70) {
				let queryUpdateTest = `update tbl_test set status='true', score=${truePercent}, result='passed' where id=${testId}`;
				await utils.runDB(queryUpdateTest);
				res.send('passed: ' + truePercent + '%');
			} else {
				let queryUpdateTest = `update tbl_test set status='false', score=${truePercent}, result='failed' where id=${testId}`;
				await utils.runDB(queryUpdateTest);
				res.send('failed: ' + truePercent + '%');
			}
		}
	}

});

router.use('/take-quiz/:setId', async (req, res, next) => {
	// create a new record in table tbl_test
	let setId = req.params.setId
	// get test_id just created
	let queryTest = `insert into tbl_test (user_id, status, score, result, start_time) values(1, 'false', 0, 0, DATETIME())`;
	let testId = await utils.runDB(queryTest);
	console.log('testId: ' + testId);
	res.redirect("/quiz/" + testId + "/" + setId)
})

router.use('/', async (req, res, next) => {
	let querySet = 'select distinct question_set from tbl_question order by question_set';
	let listSet = await utils.selectDB(querySet);
	let htmlRender = "";
	for (let i = 0; i < listSet.length; i++) {
		htmlRender += `<a href="/take-quiz/${listSet[i].question_set}">set ${listSet[i].question_set}</a><br>`;
	}
	res.send(htmlRender);

})

module.exports = router;
