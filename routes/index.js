var express = require('express');
var sqlite3 = require('sqlite3').verbose();

var router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'Quiz' });
	let db = new sqlite3.Database('./aws_question.sqlite');
	db.each('SELECT * FROM tbl_question', (err, row) => {
		if (err) {
			return console.log(err.message);
		}
		res.render('index', row);
		// console.log(row.content);
	})

});

module.exports = router;
