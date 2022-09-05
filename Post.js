// Frameworks проверка 11
var express = require('express');
const mysql = require("mysql2");
var bodyParser = require('body-parser');
const urlencodedParser = express.urlencoded({ extended: false });
const session = require('express-session');
const parsers = require(__dirname + '/Parser/parser.js');

// MySIL DataBase with users
const connection = mysql.createConnection({
    connectionLimit: 5,
    host: "localhost",
    user: "root",
    database: "users",
    password: "TAGANROG"
});

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname + '/Pages'));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

var port = 9000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/Pages/auth.html')
})

app.post('/' || '/auth.html', async function (req, res) {
            let email = req.body.email
            let password = req.body.auth_pass

            if (email && password) {
                connection.query('SELECT * FROM mails WHERE mail = ? AND pass = ?', [email, password], function (err, results, fields) {
                    if (err) throw err  

                    if (results.length > 0) {
                        req.session.loggedin = true;
                        req.session.email = email;
                        res.redirect('/snilsSearch.html')
                    }
                    else res.send('<script>alert("Неверные почта и/или пароль"); window.location.href = "/"; </script>');

                    res.end()
                });
            } else {
                res.send('<script>alert("Пожалуйста, введите почту и пароль"); window.location.href = "/";</script>');
                res.end()
            }

})

app.get('/snilsSearch.html', async function (req, res) {
    // receive parameters
    const snils = (req.query['snils'] || '').toString().trim();
    // validation
    if (!snils) {
        res.status(400);
        res.json({
            error: "snils is required"
        });

        return;
    }

    if (!snils.match(/^\d{3}-\d{3}-\d{3} \d{2}$/)) {
        res.status(400);
        res.json({
            error: "invalid snils format"
        });

        return;
    }

    //TODO: Добавить обработку ошибок с парсеров

    // business logic

    //TODO: Одна ошибка кидает ошибки на всё, обсудить/Обработать.
    const promises = [];
    for (const key of Object.keys(parsers)) {
        promises.push(
            parsers[key](snils)
        );
    }

    const result = await Promise.all(promises);

    // preparing results

    // send result
    res.json(result);
});
// start the server
app.listen(port);
console.log('Server started! At http://localhost:' + port);
// Проверяем пароль при входе в аккаунт
