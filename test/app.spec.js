'use strict';


const app = require('../src/app');

describe('App', () => {
  it('GET / responds with 200 containing "Running WEkend-Api!"', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'Running WEkend-Api!');
  });
});