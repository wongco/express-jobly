DROP TABLE IF EXISTS jobs;
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
VALUES
    ('apple', 'Apple Inc', 300),
    ('ibm', 'IBM', 100),
    ('google', 'Google', 1000),
    ('roni', 'Roni Inc', 150);

CREATE TABLE jobs
(
    id serial PRIMARY KEY,
    title text NOT NULL,
    salary float NOT NULL,
    equity float NOT NULL CHECK (equity <=1 and equity >=0),
    company_handle text NOT NULL REFERENCES companies ON DELETE CASCADE,
    date_posted date DEFAULT CURRENT_DATE NOT NULL
);
INSERT INTO jobs
    (title, salary, equity, company_handle)
VALUES
    ('SE', 1000000, 0.5, 'apple' ),
    ('accounting', 100, 0.1, 'ibm' ),
    ('IT', 148598, 0.2, 'google' ),
    ('HR', 3740, 0.01, 'roni' );

CREATE TABLE users
(
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name float NOT NULL,
    equity float NOT NULL CHECK (equity <=1 and equity >=0),
    company_handle text NOT NULL REFERENCES companies ON DELETE CASCADE,
    date_posted date DEFAULT CURRENT_DATE NOT NULL
);

-- username: a primary key that is text
-- password: a non-nullable column
-- first_name: a non-nullable column
-- last_name: a non-nullable column
-- email: a non-nullable column that is and unique
-- photo_url: a column that is text
-- is_admin: a column that is not null, boolean and defaults to false










INSERT INTO jobs
    (title, salary, equity, company_handle)
VALUES
    ('SE', 1000000, 0.5, 'apple' ),
    ('accounting', 100, 0.1, 'ibm' ),
    ('IT', 148598, 0.2, 'google' ),
    ('HR', 3740, 0.01, 'roni' );