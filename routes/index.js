var express = require('express');
var router = express.Router();
var utils = require("./utils")



/* GET home page. */
router.use('/quiz/:testId/:setId/:index?', async (req, res, next) => {
	console.log('method: ' + req.method)
	let setId = req.params.setId
	let testId = req.params.testId
	let index = req.params.index

	let queryQuestion = `select * from (select ROW_NUMBER() OVER (ORDER BY id) n, * from tbl_question where question_set=${setId}) where n=${index}`
	let question = await utils.selectDB(queryQuestion);

	// load the 1st question and answer in set
	let getListAnswers = `select * from tbl_answer where question_id = ${question[0]['id']}`
	let answersBelong = await utils.selectDB(getListAnswers);
	res.render('test', { index: index, testId: testId, questionSet: setId, question: question[0], answers: answersBelong });

});

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
