# WEkend Api

WEkend is a social planning app for friends.

This is the backend for `WEkend`. A live version of the app can be found at [wekend-client-ozharb.vercel.app/]

The front end client can be found at [https://github.com/ozharb/wekend-client].

## Introduction

Connect with friends, post events, and see what everyone's up to this weekend.

## How to use Api

- API_ENDPOINT: `https://wekend-api.herokuapp.com/api`,

- For testing use: `http://localhost:8000/api`,
- Bearer token required: TOKEN_KEY: 'WEkend-client-auth-token',

#### Base URL

The Base URL is the root URL for all of the API, if you ever make a request get back a 404 NOT FOUND response then check the Base URL first.

The Base URL is https://wekend-api.herokuapp.com/api

#### Authentication

Requires bearer token. You may use the front end client to login and create a token using demo account.

https://wekend-client-ozharb.vercel.app/login

- user name: Demo
- password: Demo2021!

#### CRUD requests

API supports Get, Post, Delete, and Patch requests.

#### Endpoints

- `/attendance ` post, patch, and delete attendance for user
- `/events` post and patch events
- `/events/all` get all events posted by user and user's friends. Each event object contains details about the event, the user, the host, and attendees
- `/friends` get all user friends including confirmed and not confirmed i.e. pending
- `/friends/request` post friend request, send patch to confirm friend request, and delete friend request
- `/users` post users and get all users. Saves bcryped passwords.

#### Back End

- Node and Express
  - Authentication via JWT
  - RESTful Api
- Testing
  - Supertest (integration)
  - Mocha and Chai (unit)
- Database
  - Postgres
  - ElephantSQL
  - Knex.js - SQL wrapper

#### Production

Deployed via Heroku

## Set up

Major dependencies for this repo include Postgres and Node.

To get setup locally, do the following:

1. Clone this repository to your machine, `cd` into the directory and run `npm install`
2. Create the dev and test databases: `createdb -U postgres -d wekend` and `createdb -U postgres -d wekend-test`

3. Create a `.env` file in the project root

Inside these files you'll need the following:

```
NODE_ENV=development
PORT=8000

DATABASE_URL="postgresql://@localhost/wekend"
TEST_DATABASE_URL="postgresql://postgres@localhost/wekend-test"
JWT_SECRET="oz-special-jwt-secret"

```

4. Run the migrations for dev - `npm run migrate`
5. Run the migrations for test - `npm run migrate:test`
6. Seed the database for dev

- `psql -U <db-user> -d wekend -f ./seeds/seed.WEkend_tables.sql`

Now, run those three commands above again for the test database as well.

7. Run the tests - `npm t`
8. Start the app - `npm run dev`
