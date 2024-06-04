var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/sqlite.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('已連接至 SQLite 資料庫。');
});

db.run('CREATE TABLE IF NOT EXISTS BeefPrices (Year INTEGER, BeefFlankPrice REAL, BeefTendonPrice REAL)');

app.get('/search', (req, res) => {
    const { startYear, endYear, beefType } = req.query;
    const query = `SELECT Year, ${beefType} AS Price FROM BeefPrices WHERE Year BETWEEN ? AND ? ORDER BY Year`;
    db.all(query, [startYear, endYear], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(rows);
        }
    });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


module.exports = app;
