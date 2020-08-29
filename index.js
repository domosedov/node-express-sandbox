const path = require('path');
const express = require('express');
const expressHandlebars = require('express-handlebars');

const app = express();

const PORT = process.env.PORT || 3000;

app.engine('.hbs', expressHandlebars({
    defaultLayout: 'main.hbs',
    extname: '.hbs'
}))

app.set('view engine', '.hbs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.render('home'));
app.get('/about', (req, res) => res.render('about', {text: 'Hello Express'}));


app.use((req, res) => {
    res.status(404);
    res.render('404');
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500);
    res.render('500');
});


app.listen(PORT, () => {
    console.log(`Server run on htpp://localhost:${PORT}`);
});