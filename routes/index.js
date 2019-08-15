var express = require('express');
var sqlite3 = require('sqlite3').verbose();

var router = express.Router();

var db = new sqlite3.Database('./aws_question (2).sqlite');


/* GET home page. */
router.get('/', function (req, res, next) {
	// let data = [];
	// db.each('SELECT id FROM tbl_question', (err, row) => {
	// 	if (err) {
	// 		return console.log(err.message);
	// 	}
	db.all('SELECT tbl_answer.is_correct isCorrect, tbl_question.id quesID, tbl_answer.id ansID, tbl_question.content questionContent, tbl_answer.content answerContent FROM tbl_answer, tbl_question WHERE tbl_question.id = tbl_answer.question_id AND question_id=?', [20], (err, row) => {
		if (err) {
			return console.log(err.message);
		}
		res.render('index', { data: row });
	})
	// })
});

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
