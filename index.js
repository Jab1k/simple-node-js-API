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
            if (rows.length > 0) {
                res.render('homepage', { users: rows, isAdmin: false });
            } else {
                res.send('Invalid credentials');
            }
        });
    }
});

app.post('/change', (req, res) => {
    const { userId, username, email, password } = req.body; // Get userId from request
    const passwordHash = createHash('sha256').update(password).digest('hex');
    const updateQuery = 'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?'; // Use ID in the WHERE clause
    connection.query(updateQuery, [username, email, passwordHash, userId], (err, result) => { // Pass userId
        if (err) return res.status(500).send({ error: 'Failed to update user' });
        res.send({ success: true, message: 'User updated successfully' });
    });
});

app.post('/delete', (req, res) => {
    const { userId } = req.body;
    connection.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) return res.status(500).send({ error: 'Failed to delete user' });
        res.send({ success: true, message: 'User deleted successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
