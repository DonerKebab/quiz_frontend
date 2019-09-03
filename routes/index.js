var express = require('express')
var router = express.Router()
var utils = require("./utils")


/* GET home page. */
router.use('/quiz/:testId/:setId/:index?', async (req, res, next) => {
	console.log('method: ' + req.method)
	let setId = req.params.setId
	let testId = req.params.testId
	let index = req.params.index

	if (req.method === 'GET') {
		let queryQuestion = `select * from (select ROW_NUMBER() OVER (ORDER BY id) n, * from tbl_question where question_set=${setId}) where n=${index}`
		let question = await utils.selectDB(queryQuestion);
		let questionId = parseInt(question[0]['id']);

		// load the 1st question and answer in set
		let getListAnswers = `select * from tbl_answer where question_id = ${question[0]['id']}`
		let answersBelong = await utils.selectDB(getListAnswers);
		let queryCheckQuestionInChoice = `select answer_id from tbl_choice where question_id=${questionId} and test_id=${testId}`
		let checkQuestionInChoice = await utils.selectDB(queryCheckQuestionInChoice);

		let queryCheckQuestionNotInChoice = `select id
		from tbl_answer 
		where id 
		not in (select answer_id 
				from tbl_choice
				where question_id= ${questionId} and test_id= ${testId})
		and question_id = ${questionId}`
		let checkQuestionNotInChoice = await utils.selectDB(queryCheckQuestionNotInChoice);

		let queryGetNumberOfQuestion = `select count(id) c from tbl_question where question_set = ${setId}`
		let count = await utils.getDB(queryGetNumberOfQuestion)

		let queryGetNumberOfAnswer = `select num_ans from tbl_question where id = ${questionId}`
		let numberOfAnswer = await utils.getDB(queryGetNumberOfAnswer)
		
		// console.log(checkQuestionInChoice);
		// console.log(checkQuestionNotInChoice);
		// console.log(numberOfAnswer.num_ans)

		res.render('test', {
			chosenAnswer: checkQuestionInChoice,
			notChosenAnswer: checkQuestionNotInChoice,
			index: index,
			testId: testId,
			questionSet: setId,
			question: question[0],
			answers: answersBelong,
			count: count.c,
			num_ans: numberOfAnswer.num_ans
		});
	}
	if (req.method === 'POST') {
		let questionId = req.body.questionId;
		let queryCheckQuestionInChoice = `select count(id) as n from tbl_choice where question_id=${questionId} and test_id=${testId}`
		let checkQuestionInChoice = await utils.getDB(queryCheckQuestionInChoice)
		if (checkQuestionInChoice.n !== 0) {
			let queryDeleteQuestionInChoice = `delete from tbl_choice where question_id=${questionId}`
			await utils.runDB(queryDeleteQuestionInChoice)
		}
		// get list answer after student choose
		let answerPickedCheck = req.body.ans; // check ans is radio or checkbox
		let answerPicked = [];
		if (typeof (answerPickedCheck) === 'string') {
			answerPicked.push(parseInt(answerPickedCheck));
		} else {
			answerPicked = answerPickedCheck;
		}
		// get list is_correct of list answer
		// save student's answer to tbl_choice
		let isTrue;
		// get index to next question
		let nextQuestion = parseInt(req.body.index);
		let queryGetNumberOfQuestion = `select count(id) c from tbl_question where question_set = ${setId}`
		let count = await utils.getDB(queryGetNumberOfQuestion)

		// console.log(answerPicked)

		for (let i = 0; i < answerPicked.length; i++) {
			let getListAnswers = `select * from tbl_answer where id = ${answerPicked[i]}`
			let answersBelong = await utils.getDB(getListAnswers);
			isTrue = answersBelong.is_correct;
			let queryChoice = `insert into tbl_choice (test_id, question_id, answer_id, is_correct) values(${testId}, ${questionId}, ${answerPicked[i]}, ${isTrue})`;
			await utils.runDB(queryChoice);
		}
		if (nextQuestion != count.c) {
			res.redirect("/quiz/" + testId + "/" + setId + "/" + (nextQuestion + 1));
		} else {
			res.redirect("/quiz/" + testId + "/" + setId + "/" + (nextQuestion));
		}

	}
});


router.use('/result/:testId/:setId', async (req, res, next) => {
	let testId = parseInt(req.params.testId);
	let setId = parseInt(req.params.setId);

	let queryCountFalseQuestion = `SELECT COUNT(question_id) as num_wrong_ans FROM (SELECT DISTINCT question_id FROM tbl_choice WHERE is_correct = 0 and test_id=${testId})`;
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
	// console.log(testId + ' ' + setId)
})

router.use('/take-quiz/:setId', async (req, res, next) => {
	// create a new record in table tbl_test
	let setId = req.params.setId
	// get test_id just created
	let queryTest = `insert into tbl_test (user_id, status, score, result, start_time) values(1, 'false', 0, 0, DATETIME())`;
	let testId = await utils.runDB(queryTest);
	console.log('testId: ' + testId);
	let queryQuestion = `select * from (select ROW_NUMBER() OVER (ORDER BY id) n, * from tbl_question where question_set=${setId})`
	let question = await utils.selectDB(queryQuestion);
	res.redirect("/quiz/" + testId + "/" + setId + "/" + question[0]['n'])
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