'use strict';

require("dotenv").config();
const PORT = process.env.PORT;

const express = require('express');
const superagent = require('superagent');
const path = require('path');
const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.log('PG Error', err));

const app = express();
app.use(errorHandler);
app.use(express.static(path.join(__dirname, "public/styles")));
app.use(express.urlencoded({
  extended: true
}));

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.post('/books/save', saveData)



app.get('/', (req, res) => {
  const SQL = 'SELECT * FROM books';
  client.query(SQL).then(result => {
    res.render('pages/index', {
      book: result.rows
    });
  });
});

app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new');
});

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  res.render('pages/error', {
    error: err
  });
}

app.post('/searches', getData);

function Book(data) {
  this.title = data.volumeInfo.title;
  this.author = data.volumeInfo.authors.join(', ');
  this.description = data.volumeInfo.description;
  this.image = (data.volumeInfo.imageLinks) ? data.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
  this.isbn = data.volumeInfo.industryIdentifiers[0].identifier;
  this.bookshelf = data.volumeInfo.categories[0];
  //solution 1:
  // if (data.volumeInfo.imageLinks)
  // {const regEx='http';
  //   this.image= data.volumeInfo.imageLinks.replace( regEx, 'https');
  // }else{
  //   this.image= 'https://i.imgur.com/J5LVHEL.jpg';
  //   console.log(this.image);

  // }
  // solution 2:
  //   let Regex = /^(http:\/\/)/g;
  //   this.image_url = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.smallThumbnail.replace(Regex, 'https://') : 'https://i.imgur.com/J5LVHEL.jpg';
}

function getData(req, res) {

  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if (req.body['search-by'] === 'title') {
    url += `+intitle:${req.body['name']}`;
  }
  if (req.body['search-by'] === 'author') {
    url += `+inauthor:${req.body['name']}`;
  }
  superagent.get(url).then(data => {
      return data.body.items.filter(element => {
        return element.volumeInfo.authors && element.volumeInfo.description;
      }).map(elem => {
        let dataEl = new Book(elem);
        console.log(dataEl);
        return dataEl;
      });
    })
    .then(results => res.render('pages/searches/show', {
      searchResults: results
    }));

}

function saveData(req, res) {

  const image = req.body.bookimg;
  const title = req.body.booktitle;
  const author = req.body.bookauther;
  const description = req.body.bookdescription;
  const isbn = req.body.bookisbn;
  const bookshelf = req.body.bookshelf;

  const values = [image, title, author, description, isbn, bookshelf];
  const SQL = `INSERT INTO books (image, title, author, description, isbn, bookshelf) VALUES ($1, $2 ,$3, $4, $5, $6) RETURNING *`;
  client.query(SQL, values).then(() => {
    res.redirect('/');
  });
}





app.get('/books/:id', (req, res) => {
  let unique = req.params.id;
  let SQL = `SELECT * FROM books WHERE id = '${unique}';`;
  client.query(SQL)
    .then(data => {
      res.render('pages/books/detail', {
        details: data.rows[0]
      });
    });
});

app.get('/books', (req, res) => {
  const SQL2 = 'SELECT * from books';
  client.query(SQL2)
    .then(result => {
      res.render('pages/books/show', {
        searchResults: result.rows
      });
    });
});



}

client.connect().then(
  app.listen(PORT, () => {
    console.log('Listeneing on', PORT);
  })
);
app.get('*', (req, res) => {
  res.status(404).send('Page not found');
  console.log('page not found');
});