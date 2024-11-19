const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for signing up (saving user data)
app.post('/save', (req, res) => {
    const userData = req.body;
    console.log('Received data:', userData); // Log received data

    // Check if user data is correctly structured
    if (!userData.username || !userData.email || !userData.password) {
        console.log('Invalid input data');
        return res.status(400).send('Invalid input');
    }

    // Read the existing users.json file
    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading data file');
        }

        let users = [];
        if (data) {
            try {
                users = JSON.parse(data);
                console.log('Parsed user data:', users);
            } catch (parseErr) {
                console.error('Error parsing JSON:', parseErr);
                return res.status(500).send('Error parsing data');
            }
        }

        // Add the new user data
        users.push(userData);
        console.log('Updated user data:', users);

        // Write updated user data to users.json
        fs.writeFile('users.json', JSON.stringify(users, null, 2), (err) => {
            if (err) {
                console.error('Error writing to file:', err);
                return res.status(500).send('Error saving data');
            }

            console.log('User data saved successfully');
            res.status(200).send('User data saved successfully');
        });
    });
});

// Route for signing in (verifying user data)
app.post('/signin', (req, res) => {
    const { username, password } = req.body;

    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading data file');
        }

        let users = [];
        if (data) {
            try {
                users = JSON.parse(data);
            } catch (parseErr) {
                console.error('Error parsing JSON:', parseErr);
                return res.status(500).send('Error parsing data');
            }
        }

        // Check if the user exists and the password matches
        const user = users.find(u => u.username === username);
        if (user) {
            if (user.password === password) {
                res.status(200).send('Login successful');
            } else {
                res.status(401).send('Incorrect password');
            }
        } else {
            res.status(404).send('User not found');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
