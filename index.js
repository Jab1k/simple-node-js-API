const express = require('express');
const path = require('path');
const mysql = require('mysql');
const { createHash } = require('crypto');

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
    console.log(`Connected to database`);
});

app.set('view engine', 'jade');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, '/view/'));

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.render('user');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'password') {
        connection.query('SELECT * FROM users', (err, rows) => {
            if (err) throw err;
            res.render('homepage', { users: rows, isAdmin: true });
        });
    } else {
        const passwordHash = createHash('sha256').update(password).digest('hex');
        const query = 'SELECT username, password FROM users WHERE username = ? OR email = ? AND password = ?';
        connection.query(query, [username, username, passwordHash], (err, rows) => {
            if (err) throw err;
            res.render('homepage', { user: rows[0], isAdmin: false });
        });
    }
});

function checkUser(username, email, callback) {
    const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
    connection.query(query, [username, email], (error, results) => {
        if (error) return callback(error, null);
        callback(null, results.length > 0);
    });
}

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    if (password === confirmPassword) {
        checkUser(username, email, (error, exists) => {
            if (error) console.error('Error:', error);
            else if (exists) {
                res.render('error', { title: 'Error', error: "Username or Email already used!", url: "/register", button: "Try Again!" });
            } else {
                const passwordHash = createHash('sha256').update(password).digest('hex');
                const newUser = { username, email, password: passwordHash };
                connection.query('INSERT INTO users SET ?', newUser, (err) => {
                    if (err) throw err;
                    res.render('error', { title: 'Completed', error: "Registration complete!", url: "/login", button: "Login" });
                });
            }
        });
    } else {
        res.send('Passwords do not match. Please try again.');
    }
});

// Update user information
app.post('/change', (req, res) => {
    const { username, email, password } = req.body;
    const passwordHash = createHash('sha256').update(password).digest('hex');
    const updateQuery = 'UPDATE users SET username = ?, email = ?, password = ? WHERE username = ?';
    connection.query(updateQuery, [username, email, passwordHash, username], (err, result) => {
        if (err) return res.status(500).send({ error: 'Failed to update user' });
        res.send({ success: true, message: 'User updated successfully' });
    });
});

// Delete user
app.post('/delete', (req, res) => {
    const { userId } = req.body;
    const deleteQuery = 'DELETE FROM users WHERE id = ?';
    connection.query(deleteQuery, [userId], (err, result) => {
        if (err) return res.status(500).send({ error: 'Failed to delete user' });
        res.send({ success: true, message: 'User deleted successfully' });
    });
});

app.listen(port, () => console.log(`Listening on port ${port}...`));