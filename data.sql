DROP TABLE IF EXISTS companies;

CREATE TABLE companies
(
    handle text PRIMARY KEY,
    name text UNIQUE,
    num_employees INTEGER,
    description text,
    logo_url text
);


INSERT INTO companies
(handle, name, num_employees)
VALUES ('apple', 'Apple Inc', 300),
       ('ibm', 'IBM', 100),
       ('google', 'Google', 1000),
       ('roni', 'Roni Inc', 150);