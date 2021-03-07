'use strict';
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.NODE_ENV = 'test'
const { expect } = require('chai')
const supertest = require('supertest');

global.expect = expect
global.supertest = supertest