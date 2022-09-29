// Frameworks
var express = require('express');
const mysql = require("mysql2/promise");
var bodyParser = require('body-parser');
const urlencodedParser = express.urlencoded({ extended: false });
const session = require('express-session');
const { UNECON, SFEDU } = require('./Parser/parser');
const parser = require('./Parser/parser');
const parsers = require(__dirname + '/Parser/parser.js');
require('dotenv').config();

(async () => {
    // MySQL DataBase with users
    const connection = await mysql.createConnection({
        connectionLimit: 5,
        host: "localhost",
        user: "root",
        database: "userid",
        password: process.env.DATABASE_PASSWORD
    });

    var app = express();

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(express.static(__dirname + '/Static'));

    app.use(session({
        secret: 'asghhga%123sa@dakbndAsd',
        resave: true,
        saveUninitialized: true
    }));

    var port = 9000;

    app.get('/', (req, res) => {

        if (req.session.loggedin) res.redirect('/snilsSearch');
        else res.sendFile(__dirname + '/Templates/auth.html')
    })

    app.get('/snilsSearch', (req,res)=> {
        if (!req.session.loggedin) return res.redirect('/')
        
        res.sendFile(__dirname + '/Templates/snilsSearch.html')
    })

    app.get('/result', (req,res)=> {
        if (!req.session.loggedin) return res.redirect('/')
        
        res.sendFile(__dirname + '/Templates/result.html')
    })

    app.post('/', async function (req, res) {
        let email = req.body.email
        let password = req.body.auth_pass

        if (email && password) {
            try {
                const results = await connection.query('SELECT * FROM users WHERE mail = ? AND pass = ?', [email, password]);

                if (results[0].length > 0) {
                    req.session.loggedin = true;
                    req.session.email = email;
                    res.redirect('/snilsSearch');
                }
                else res.send('<script>alert("Неверные почта и/или пароль"); window.location.href = "/"</script>');

                res.end();
            } catch (err) {
                console.error(err);
                res.status(500).send();
            }
        } else {
            res.send('<script>alert("Пожалуйста, введите почту и пароль"); window.location.href = "/"</script>');
            res.end()
        }
        
    })

    app.get('/getResult', async function (req, res) {

        if (!req.session.loggedin) return res.sendStatus(401);

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

        //TODO: Одна ошибка кидает ошибки на всё, обсудить/Обработать.
        var promises = [];
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
})();