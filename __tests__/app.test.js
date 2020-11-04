require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token;

      return done();
    });



    test('returns entire dogs array', async () => {

      const expectation = [
        {
          id: 1,
          owner_id: 1,
          name: 'Marcus',
          age: 6,
          weight: 25,
          good_boy: true,
          img_src: 'https://i.pinimg.com/originals/09/bc/ba/09bcbac03c8723b106b1ae14de3027ed.jpg'
        },
        {
          id: 2,
          owner_id: 1,
          name: 'Paco',
          age: 6,
          weight: 11,
          good_boy: true,
          img_src: 'https://wagspetadoption.org/wp-content/uploads/2018/12/48314211_2418978178173894_3787177238194028544_n.jpg'

        },
        {
          id: 3,
          owner_id: 1,
          name: 'Benjamin',
          age: 10,
          weight: 10,
          good_boy: true,
          img_src: 'https://www.pdsa.org.uk/media/9895/gallery-2-dachshund-standing-outside.jpg'

        }
      ];

      const data = await fakeRequest(app)
        .get('/dogs/')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);
    });

    test('returns single dog object', async () => {

      const expectation =
      {
        id: 2,
        owner_id: 1,
        name: 'Paco',
        age: 6,
        weight: 11,
        good_boy: true,
        img_src: 'https://wagspetadoption.org/wp-content/uploads/2018/12/48314211_2418978178173894_3787177238194028544_n.jpg'

      };

      const data = await fakeRequest(app)
        .get('/dogs/2')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);
    });

    test('tests dog .post, adds data object, checks that it was stored', async () => {

      const newObject = {
        owner_id: 1,
        name: "Old Yeller",
        age: 4,
        weight: 45,
        good_boy: true,
        img_src: 'asdfa'
      };

      const data = await fakeRequest(app)
        .post('/dogs/')
        .send(newObject)
        .expect('Content-Type', /json/)
        .expect(200);

      const returnedDog = await fakeRequest(app)
        .get('/dogs/4')
        .expect('Content-Type', /json/)
        .expect(200)

      expect(data.body.name).toEqual(newObject.name);
      expect(returnedDog.body.name).toEqual(newObject.name);

    })

    test('tests dog .put, changes data object, checks that change was made', async () => {

      const objectId = 1;
      const objectChanges = {
        name: 'Big Ole Marcus',
        age: 25,
        weight: 500,
        good_boy: true,
        img_src: 'asdfasd',
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .put(`/dogs/${objectId}`)
        .send(objectChanges)
        .expect('Content-Type', /json/)
        .expect(200);

      const returnedObject = await fakeRequest(app)
        .get(`/dogs/${objectId}`)
        .expect('Content-Type', /json/)
        .expect(200)

      expect(data.body.name).toEqual(objectChanges.name);
      expect(returnedObject.body.name).toEqual(objectChanges.name)
    })

  });

  afterAll(done => {
    return client.end(done);
  });
});
