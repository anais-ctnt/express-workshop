const express = require('express')
const connection = require("./config");

const app = express()
const port = 8080;

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello !')
});

app.get("/api/books", (req, response) => {
  connection.query("SELECT * FROM book", (err, results) => {
    if (err) {
      response.status(500).send("Error retrieving data");
    } else {
      results.length > 0 
      ? response.status(200).json(results) 
      : response.status(404).send("No books found");
    }
  });
});

app.get("/api/booksLight", (req, response) => {
  connection.query("SELECT title, duration FROM book", (err, results) => {
      if (err) {  
        console.log(err);
        response.status(500).send("Error retrieving data");
      } else {
        console.log(req)
        results.length > 0
         ? response.status(200).json(results)
         : response.status(404).send('Book not found');
      }
    }
  );
});

app.get("/api/books/:id", (req, response) => {
  const idBook = req.params.id
  connection.query("SELECT * FROM book WHERE id = ?", [idBook], (err, results) => {
      if (err) {  
        console.log(err);
        response.status(500).send("Error retrieving data");
      } else {
        console.log(req)
        results.length > 0
         ? response.status(200).json(results[0])
         : response.status(404).send('Book not found');
      }
    }
  );
});


app.get("/api/books/search", (request, response) => {
  const keywordTitle = ("%" + request.query.title + "%")
  connection.query(
    "SELECT * FROM book WHERE title LIKE ?", [keywordTitle], (err, results) => {
      if (err){
        console.log(err);
        response.status(500).send("Error retrieving data");
      } else {
        results.length > 0 
        ? response.status(200).json(results)
        : response.status(404).send("No books found for this keyword");
      }
    }
  )
});

app.get("/api/books/startBy", (request, response) => {
  const startTitle = (request.query.startTitle + "%")
  connection.query(
    "SELECT * FROM book WHERE title LIKE ?", [startTitle], (err, results) => {
      if (err){
        console.log(err);
        response.status(500).send("Error retrieving data");
      } else {
        results.length > 0 
        ? response.status(200).json(results)
        : response.status(404).send("No books found for this title");
      }
    }
  )
});

app.get("/api/books/dateCreation", (request, response) => {
  const dateCreation = request.query.creation
  connection.query(
    "SELECT * FROM book WHERE creation > ?", [dateCreation], (err, results) => {
      if (err){
        console.log(err);
        response.status(500).send("Error retrieving data");
      } else {
        results.length > 0 
        ? response.status(200).json(results)
        : response.status(404).send("No books found for this date");
      }
    }
  )
});

app.get("/api/books/order/:order", (req, response) => {
  const bookOrder = (req.params.order)
  let sql = "SELECT * FROM book ORDER BY id"

  if(bookOrder === "desc"){
    sql += " DESC"
  }
  connection.query(sql, (err, results) => {
      if (err) {  
        console.log(err);
        response.status(500).send("Error retrieving data order");
      } else {
        results.length > 0
         ? response.status(200).json(results)
         : response.status(404).send('Book not found');
      }
    }
  );
});

app.post("/api/books", (req, res) => {
  const {title, creation, duration, active} = req.body;
  connection.query("INSERT INTO book (title, creation, duration, active) VALUES (?, ?, ?, ?)",
  [title, creation, duration, active],
  (err, results) => {
    if (err) {
      console.log(err)
      res.status(500).send("Error saving a book");
    } else {
      res.status(201).send("Successfully saved");
    }
  })
});

app.put("/api/books/:id", (req, res) => {
  const idBook = req.params.id;
  const newBook = req.body;

  connection.query(
    "UPDATE book SET ? WHERE id = ?",
    [newBook, idBook],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error updating a book");
      } else {
        res.status(200).send("Book updated successfully 🎉");
      }
    }
  );
});

app.put("/api/books/isActive/:id", (req, res) => {
  const idBook = req.params.id;

  connection.query(
    "UPDATE book SET active = !active WHERE id = ?",
    [idBook],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error updating a book");
      } else {
        res.status(200).send("Book updated successfully 🎉");
      }
    }
  );
})

app.delete("/api/books/:id", (req, res) => {
  const bookID = req.params.id
  connection.query("DELETE FROM book WHERE id = ?",[bookID], (err, results) => {
    if (err){console.log(err)
      res.status(500).send("Error deleting a book");
    } else {
      res.status(200).send("Successfully deleted");
    }
  })
})

app.delete("/api/books/notActive", (req, res) => {
  connection.query("DELETE FROM book WHERE active = 0", (err, results) => {
    if (err){console.log(err)
      res.status(500).send("Error deleting a book");
    } else {
      res.status(200).send("Successfully deleted");
    }
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
