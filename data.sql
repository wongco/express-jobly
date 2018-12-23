DROP TABLE IF EXISTS users_tech;
DROP TABLE IF EXISTS jobs_tech;
DROP TABLE IF EXISTS tech;
DROP TABLE IF EXISTS applications;
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
    ('IT', 99000, 0.01, 'google' ),
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

-- created enumerated type for appliations table
DROP TYPE state;
CREATE TYPE state AS ENUM ('interested', 'applied', 'accepted', 'rejected');

CREATE TABLE applications 
(
    username text REFERENCES users ON DELETE CASCADE,
    job_id integer REFERENCES jobs ON DELETE CASCADE,
    state state NOT NULL,
    created_at date DEFAULT CURRENT_DATE NOT NULL,
    PRIMARY KEY(username, job_id)
);
INSERT INTO applications
    (username, job_id, state)
VALUES
    ('jimmy', 1, 'interested'),
    ('karen', 2, 'interested'),
    ('greg', 3, 'interested'),
    ('michael', 3, 'interested'),
    ('michael', 1, 'interested');

CREATE TABLE tech
(
    name text PRIMARY KEY
);

INSERT INTO tech VALUES ('python'), ('javascript'), ('node'), ('sql');

CREATE TABLE jobs_tech
(
    job_id integer REFERENCES jobs ON DELETE CASCADE,
    tech_name text REFERENCES tech ON DELETE CASCADE,
    PRIMARY KEY(job_id, tech_name)
);

INSERT INTO jobs_tech
    (job_id, tech_name)
VALUES
    (1, 'python'),
    (2, 'javascript'),
    (3, 'node'),
    (4, 'sql');

CREATE TABLE users_tech
(
    username text REFERENCES users ON DELETE CASCADE,
    tech_name text REFERENCES tech ON DELETE CASCADE,
    PRIMARY KEY(username, tech_name)
);

INSERT INTO users_tech
    (username, tech_name)
VALUES
    ('jimmy', 'python'),
    ('karen', 'javascript'),
    ('greg', 'node'),
    ('michael', 'sql'),
    ('michael', 'node');