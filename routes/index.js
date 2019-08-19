var express = require('express');
var sqlite3 = require('sqlite3').verbose();

var router = express.Router();

var db = new sqlite3.Database('./routes/aws_question (1).sqlite');


/* GET home page. */
router.get('/', function (req, res, next) {
	db.all('SELECT tbl_answer.is_correct isCorrect, tbl_question.id quesID, tbl_answer.id ansID, tbl_question.content questionContent, tbl_answer.content answerContent FROM tbl_answer, tbl_question WHERE tbl_question.id = tbl_answer.question_id AND question_set=?', [20], (err, row) => {
		if (err) {
			return console.log(err.message);
		}
		// res.render('index', { data: row });
	})
});

router.all('/:questionSet', function (req, res, next) {
	let allData=[];
	let getOnlyOneQuestion = [];
	let questionSet = req.params.questionSet;
	let questionPromise = new Promise((resolve, reject)=>{
		db.all('SELECT id, content FROM tbl_question WHERE question_set = ?', [questionSet], (err, rows) => {
			getOnlyOneQuestion=rows;
			resolve(getOnlyOneQuestion);
		})
	})
	let getAllPromise = new Promise((resolve, reject) => {
		db.all('SELECT tbl_answer.is_correct isCorrect, tbl_question.id quesID, tbl_answer.id ansID, tbl_question.content questionContent, tbl_answer.content answerContent FROM tbl_answer, tbl_question WHERE tbl_question.id = tbl_answer.question_id AND question_set=?', [questionSet], (err, rows) => {
			allData=rows;
			resolve(allData);
		})
	})
	getAllPromise.then((result)=>{
		res.render('index', { getOnlyOneQuestion: getOnlyOneQuestion, allData: allData });
	})
})

router.post('/:testId/:questionId/:answerId/:isCorrect', function (req, res, next) {
	let testId = req.params.testId;
	let questionId = req.params.questionId;
	let answerId = req.params.answerId;
	let temp = req.params.isCorrect;
	console.log('temp: ', temp);
	let isCorrect;
	if (temp == 1) {
		isCorrect = true;
	} else {
		isCorrect = false;
	}
	// let data = [];
	// db.each('SELECT id FROM tbl_question', (err, row) => {
	// 	if (err) {
	// 		return console.log(err.message);
	// 	}
	db.run('INSERT INTO tbl_choice (test_id, question_id, answer_id, is_correct)  VALUES(?, ?, ?, ?)', [testId, questionId, answerId, isCorrect], (err) => {
		if (err) {
			return console.log(err.message);
		}
		// res.render('index', { data: row });
	})
	// })
});

module.exports = router;
