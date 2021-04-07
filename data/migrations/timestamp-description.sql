-- Creating a table contains two columns, author id and name.
CREATE TABLE authors (id SERIAL PRIMARY KEY, name VARCHAR(255));
-- Inserting the values for the new table name with unique values from the old table.
INSERT INTO authors(name) SELECT DISTINCT author FROM books;
-- Add a new column into the old table "books", for the ids.
ALTER TABLE books ADD COLUMN author_id INT;
-- Retrieves the primary key on each authors and fills in the author id field in the books table,-- 
UPDATE books SET author_id=author.id FROM (SELECT * FROM authors) AS author WHERE books.author = author.name;
ALTER TABLE books DROP COLUMN author;
-- Set the author_id as the foreign key of the books table 
ALTER TABLE books ADD CONSTRAINT fk_authors FOREIGN KEY (author_id) REFERENCES authors(id);