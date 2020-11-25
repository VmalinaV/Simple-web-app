const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000; // bardzo istotna linijka - port zostaje przydzielony przez Heroku

let loggedIn = false, userId = 4, lastSortType = 'increasing';
let users = [
    { id: 1, login: 'aaa', password: 'aaa', age: '16', student: 'checked', sex: 'man', },
    { id: 2, login: 'bbb', password: '333', age: '19', student: '', sex: 'woman', },
    { id: 3, login: 'ccc', password: '333', age: '17', student: '', sex: 'man', }
];


app.listen(PORT, () => {
    console.log('START SERWERA NA PORCIE', PORT);
});

app.use(express.static('static'));
app.use(bodyParser.urlencoded({ extended: true }));

/* REGISTRATION */

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/static/pages/register.html');
});

app.post('/register', (req, res) => {
    let alreadyExists = false;
    req.body.login = escape(req.body.login);
    req.body.password = escape(req.body.password);
    users.forEach((element) => {
        if (element.login == req.body.login)
            alreadyExists = true;
    });

    if (alreadyExists)
        res.send('User ' + req.body.login + ' already exists!');
    else {
        users.push (
            { id: userId, login: req.body.login, password: req.body.password, age: req.body.age, student: req.body.student, sex: req.body.sex, }
        );
        userId++;
        res.send('User ' + req.body.login + ' has been registred!');
    }
});

/* LOGIN AND LOGOUT */

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/static/pages/login.html');
});

app.post('/login', (req, res) => {
    let access = false;
    req.body.login = escape(req.body.login);
    req.body.password = escape(req.body.password);
    users.forEach((element) => {
        if (element.login == req.body.login && element.password == req.body.password)
            access = true;
    });
    if (access) {
        loggedIn = true;
        res.redirect('/admin');
    }
    else
        res.send('Wrong login or password!');
});

app.get('/logout', (req, res) => {
    loggedIn = false;
    res.redirect('/');
});

/* ADMIN */

app.get('/admin', (req, res) => {
    if (loggedIn)
        res.sendFile(__dirname + '/static/pages/admin.html');
    else
        res.sendFile(__dirname + '/static/pages/loggedout.html');
});

app.get('/sort', (req, res) => {
    if (loggedIn)
        res.send(sort('increasing'));
    else
        res.sendFile(__dirname + '/static/pages/loggedout.html');
});

app.post('/sort', (req, res) => {
    if (loggedIn) {
        lastSortType = req.body.sortType;
        res.send(sort(req.body.sortType));
    }
    else
        res.sendFile(__dirname + '/static/pages/loggedout.html');
});

app.get('/gender', (req, res) => {
    if (loggedIn)
        res.send(gender());
    else
        res.sendFile(__dirname + '/static/pages/loggedout.html');
});

app.get('/show', (req, res) => {
    if (loggedIn)
        res.send(show());
    else
        res.sendFile(__dirname + '/static/pages/loggedout.html');
});

function sort(type) {
    let string = '<body style="background-color: #222;">' + getHeader() + 
    `<form action="/sort" method="POST" onchange="this.submit()">
        <label style="color: white; margin-left: 20px;" for="increasing">increasing</label>
        <input type="radio" name="sortType" value="increasing" id="increasing"` + (lastSortType == 'increasing' ? 'checked' : '') + `>
        <label style="color: white; margin-left: 20px;" for="decreasing">decreasing</label>
        <input type="radio" name="sortType" value="decreasing" id="decreasing"` + (lastSortType == 'increasing' ? '' : 'checked') + `>
    </form>`
    + '<table style="width: 100%; color: white;  padding: 20px;">';
    let sortedUsers = [...users];   //copying array
    sortedUsers.sort((a, b) => {
        if (type == 'increasing')
            return parseInt(a.age) - parseInt(b.age);
        else
            return parseInt(b.age) - parseInt(a.age);
    })
    sortedUsers.forEach((element) => {
        string += `<tr><td style="color: white; padding: 10px; border: 2px solid yellow;">id: ${element.id}</td>
        <td style="color: white; padding: 10px; border: 2px solid yellow;">user: ${element.login} - ${element.password}</td>
        <td style="color: white; padding: 10px; border: 2px solid yellow;">age: ${element.age}</td></tr>`
    });
    string += '</table></body>';
    return string;
}

function gender() {
    let string = '<body style="background-color: #222;">' + getHeader() + '<table style="width: 100%; color: white; padding: 20px;">';
    users.forEach((element) => {
        if (element.sex == 'woman')
            string += `<tr><td style="color: white; padding: 10px; border: 2px solid yellow;">id: ${element.id}</td>
            <td style="color: white; padding: 10px; border: 2px solid yellow;">sex: ${element.sex}</td><tr>`
    });
    string += '</table><table style="width: 100%; color: white; padding: 20px;">';
    users.forEach((element) => {
        if (element.sex == 'man')
            string += `<tr><td style="color: white; padding: 10px; border: 2px solid yellow;">id: ${element.id}</td>
            <td style="color: white; padding: 10px; border: 2px solid yellow;">sex: ${element.sex}</td><tr>`
    });
    string += '</table></body>';
    return string;
}

function show() {
    let string = '<body style="background-color: #222;">' + getHeader() + '<table style="width: 100%; color: white;  padding: 20px;">';
    users.forEach((element) => {
        string += `<tr><td style="color: white; padding: 10px; border: 2px solid yellow;">id: ${element.id}</td>
        <td style="color: white; padding: 10px; border: 2px solid yellow;">user: ${element.login} - ${element.password}</td>
        <td style="color: white; padding: 10px; border: 2px solid yellow;">student: <input style="margin: 0;" type="checkbox" disabled ${element.student}></td>
        <td style="color: white; padding: 10px; border: 2px solid yellow;">age: ${element.age}</td>
        <td style="color: white; padding: 10px; border: 2px solid yellow;">sex: ${element.sex}</td><tr>`
    });
    string += '</table></body>';
    return string;
}

function getHeader() {
    return `<nav style="background-color: #222;">
                <ul class="list-navbar">
                    <li>
                        <a style="color: white;" href="/sort">sort</a>
                    </li>
                    <li>
                        <a style="color: white;" href="/gender">gender</a>
                    </li>
                    <li>
                        <a style="color: white;" href="/show">show</a>
                    </li>
                </ul>
            </nav>
            <style>
            nav {
                background-color: #000f9b;
            }
            
            .list-navbar {
                display: flex;
                justify-content: flex-start;
                list-style-type: none;
                margin: 0;
                padding: 0 4rem;
            }
            
            .list-navbar li {
                float: left;
                padding: 1rem;
            }
            
            .list-navbar li a {
                display: block;
                color: white;
                font-size: 1.25rem;
            }
            </style>`
}

const escape = (html) => {
    return String(html)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/'/g, '&#39;')
      .replace(/"/g, '&quot;')
}