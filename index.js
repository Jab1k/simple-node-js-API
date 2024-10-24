const express = require('express');
const path = require('path');

const app = express();

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
        res.send('Login successful!');
    } else {
        res.send('Invalid credentials!');
    }
});


// REGISTER

app.get('/register', (req, res) => {
    res.render('register');
});
app.post('/register', (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    
    // Simple validation
    if (password === confirmPassword) {
      res.send(`Welcome, ${username}! Registration successful.`);
    } else {
      res.send('Passwords do not match. Please try again.');
    }
  });
  


app.listen(port, () => console.log(`Listening on port ${port}...`));
