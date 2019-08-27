var sqlite3 = require('sqlite3').verbose();


const selectDB = (query) => {
	let db = new sqlite3.Database('./routes/aws_question_final.sqlite');
	return new Promise((resolve, reject) => {
		db.all(query, (err, rows) => {
			if (err) {
				console.log(err)
			}
			resolve(rows);
		})
		db.close();
	})
}

const getDB = (query) => {
	let db = new sqlite3.Database('./routes/aws_question_final.sqlite');
	return new Promise((resolve, reject) => {
		db.get(query, (err, row) => {
			if (err) {
				console.log(err)
			}
			resolve(row);
		})
		db.close();
	})
}

const runDB = (query) => {
	let db = new sqlite3.Database('./routes/aws_question_final.sqlite');
	return new Promise((resolve, reject) => {
		db.run(query, function (err) {
			if (err) {
				console.log(err)
			}
			resolve(this.lastID);
		})
		db.close();
	})
}

exports.selectDB = selectDB
exports.runDB = runDB
exports.getDB = getDB
