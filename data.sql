DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS users;

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
    ('apple', 'Apple Inc', 11000),
    ('ibm', 'IBM', 100000),
    ('google', 'Google Inc', 10000),
    ('uber', 'Uber Inc', 15000);

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
    ('SE', 100000, 0.01, 'apple' ),
    ('Accounting', 80000, 0.001, 'ibm' ),
    ('IT', 100000, 0.01, 'google' ),
    ('HR', 70000, 0.01, 'uber' );

CREATE TABLE users
(
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL UNIQUE,
    photo_url text,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL
);
INSERT INTO users
    (username, password, first_name, last_name, email, is_admin)
VALUES
    ('jimmy', '123456', 'jimmy', 'hands', 'jhands@favcomp.com', true),
    ('greg', '123456', 'greg', 'olson', 'golson@tky.net', true),
    ('karen', '123456', 'karen', 'alma', 'katt2@aololdtimers.com', false),
    ('michael', '123456', 'mitch', 'brenson', 'mbrenboy@yesmail.com', false);
