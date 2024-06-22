const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/redstoreDB');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Customer Schema
const customerSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

const Customer = mongoose.model('Customer', customerSchema);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'account.html'));
});

app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newCustomer = new Customer({ username, email, password });
        await newCustomer.save();
        res.send('Customer registered successfully');
    } catch (err) {
        res.send('Error occurred while registering customer');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const customer = await Customer.findOne({ username, password });
        if (customer) {
            res.send('Login successful');
        } else {
            res.send('Invalid username or password');
        }
    } catch (err) {
        res.send('Error occurred');
    }
});

// Handle port in use error
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is already in use. Trying another port...`);
        app.listen(port + 1, () => {
            console.log(`Server running at http://localhost:${port + 1}`);
        });
    } else {
        console.error(err);
    }
});
