const express = require('express');
const path = require('path');
const mysql = require('mysql');
const { createHash } = require('crypto');

// First you need to create a connection to the db
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'simpleDB',
});
const app = express();

connection.connect((err) => {
    if (err) {
        console.log('Error connecting to Db');
        return;
    }
    console.log(`Complated`);
});

app.set('view engine', 'jade');
app.set('views', path.join(__dirname, '/view/'));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
// Start the server
const port = process.env.PORT || 3000;


app.get('/', (req, res) => {
    res.render('user');
});

// LOGIN

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Simple validation logic (customize this)
    if (username === 'admin' && password === 'password') {
        connection.query('SELECT * FROM users', (err, rows) => {
            if (err) throw err;
            console.log('Data received from Db:\n');
            console.log(rows[0]);
        res.render('homepage', { users: rows, isAdmin: true });

        });
    } else {
        var password2 = createHash('sha256').update(`${password}`).digest('hex');
        console.log(`${password2}`)
        const query = 'SELECT username, password FROM users WHERE username = ? OR email = ? AND password = ?';
        connection.query(query, [username, username, password2], (err, rows) => {
            if (err) throw err;
            console.log('Data received from Db:\n');
            console.log(rows[0].username);
            res.render('homepage', { user: rows[0], isAdmin: false, });

        });
    }
});

function checkUser(username, email, callback) {
    const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
    connection.query(query, [username, email], (error, results) => {
        if (error) {
            callback(error, null);
            return;
        }

        // If results exist, the username or email is already taken
        if (results.length > 0) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
}



// REGISTER

app.get('/register', (req, res) => {
    res.render('register');
});
app.post('/register', (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Simple validation
    if (password === confirmPassword) {

        checkUser(username, email, (error, exists) => {
            if (error) {
                console.error('Error:', error);
            } else if (exists) {
                res.render('error', { title: 'Error', error: "Username or Email already used!", url: "/register", button: "Try Harder!" });
            } else {
                var password2 = createHash('sha256').update(`${password}`).digest('hex');
                const employee = { username: username, email: email, password: password2, };
                connection.query('INSERT INTO users SET ?', employee, (err, data) => {
                    if (err) throw err;
                    // console.log('Last insert ID:', res.insertId);
                    res.render('error', { title: 'Complated', error: "You are complated a registeration!", url: "/login", button: "Login" })
                });
            }
        });




    } else {
        res.send('Passwords do not match. Please try again.');
    }
});



app.listen(port, () => console.log(`Listening on port ${port}...`));
