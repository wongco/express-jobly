process.env.NODE_ENV = 'test';

const User = require('../../models/User');
const db = require('../../db');

beforeEach(async () => {
  // delete any data created by test
  await db.query('DELETE FROM users');

  await User.addUser({
    username: 'bob',
    password: '123456',
    first_name: 'bobby',
    last_name: 'wow',
    email: 'bobbbby@goodboy.com',
    photo_url: 'https://www.wow.com/pic.jpg',
    is_admin: true
  });
});

describe('addUser method', async () => {
  it('adding user succeeded with hashed password', async () => {
    const user2 = await User.addUser({
      username: 'jeremy',
      password: '123456',
      first_name: 'jj',
      last_name: 'kk',
      email: 'jjkk@goodboy.com',
      photo_url: 'https://www.wow.com/pic.jpg',
      is_admin: false
    });

    expect(user2).toHaveProperty('username', 'jeremy');
    expect(user2.password).not.toEqual('password', '123456');
  });

  it('adding user failed due to missing param', async () => {
    try {
      await User.addUser({
        username: 'jeremy',
        first_name: 'jj',
        last_name: 'kk',
        email: 'jjkk@goodboy.com',
        photo_url: 'https://www.wow.com/pic.jpg',
        is_admin: false
      });
    } catch (error) {
      expect(error).toHaveProperty('message');
    }
  });

  it('adding user failed due to existing username', async () => {
    try {
      await User.addUser({
        username: 'bob',
        password: '123456',
        first_name: 'bobby',
        last_name: 'wow',
        email: 'bobbbby@goodboy.com',
        photo_url: 'https://www.wow.com/pic.jpg',
        is_admin: true
      });
    } catch (error) {
      expect(error).toHaveProperty('message', 'User already exists.');
    }
  });
});

describe('getUsers method', async () => {
  it('get all users successfully', async () => {
    const users = await User.getUsers();

    expect(users).toHaveLength(1);
    expect(Array.isArray(users)).toBe(true);
  });
});

describe('getUser method', async () => {
  it('get specific user successfully', async () => {
    const user = await User.getUser('bob');
    expect(user).toHaveProperty('username', 'bob');
  });

  it('fails to get non existing user', async () => {
    try {
      await User.getUser('jeffrey');
    } catch (error) {
      expect(error).toHaveProperty('message', 'User does not exist.');
    }
  });
});

describe('patchUser method', async () => {
  it('patching user succeeded', async () => {
    await User.patchUser('bob', {
      first_name: 'billybob'
    });
    const user = await User.getUser('bob');
    expect(user).toHaveProperty('first_name', 'billybob');
  });

  it('failed to patch because invalid user', async () => {
    try {
      await User.patchUser('joey', {
        first_name: 'billybob'
      });
    } catch (error) {
      expect(error).toHaveProperty('message', 'User does not exist.');
    }
  });

  it('failed to patch because invalid parameter', async () => {
    try {
      await User.patchUser('bob', {
        fav_quote: 'billybob'
      });
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        'column "fav_quote" of relation "users" does not exist'
      );
    }
  });
});

describe('deleteUser method', async () => {
  it('deleting user succeeded', async () => {
    await User.deleteUser('bob');
    try {
      await User.getUser('bob');
    } catch (error) {
      expect(error).toHaveProperty('message', 'User does not exist.');
    }
  });

  it('failed to delete non existing user', async () => {
    try {
      await User.deleteUser('jeremy');
    } catch (error) {
      expect(error).toHaveProperty('message', 'User does not exist.');
    }
  });
});

describe('checkValidUser method', async () => {
  it('user validated successfully', async () => {
    const isValid = await User.checkValidUser('bob', '123456');

    expect(isValid).toBe(true);
  });

  it('failed to validate due to bad username', async () => {
    try {
      await User.checkValidUser('jeremy', '123456');
    } catch (error) {
      expect(error).toHaveProperty('message', 'User does not exist.');
    }
  });

  it('failed to validate due to bad password', async () => {
    try {
      await User.checkValidUser('bob', '777777');
    } catch (error) {
      expect(error).toHaveProperty('message', 'Invalid Password');
    }
  });
});

describe('isUserAdmin method', async () => {
  it('checked user is admin successfully', async () => {
    const isValid = await User.isUserAdmin('bob');

    expect(isValid).toBe(true);
  });

  it('fails because user is not admin', async () => {
    await User.addUser({
      username: 'jeremy',
      password: '123456',
      first_name: 'jj',
      last_name: 'kk',
      email: 'jjkk@goodboy.com',
      photo_url: 'https://www.wow.com/pic.jpg',
      is_admin: false
    });
    try {
      await User.isUserAdmin('jeremy');
    } catch (error) {
      expect(error).toHaveProperty('message', 'Not Admin');
    }
  });

  it('fails because user does not exist', async () => {
    try {
      await User.isUserAdmin('karen');
    } catch (error) {
      expect(error).toHaveProperty('message', 'User does not exist.');
    }
  });
});

afterEach(async function() {
  // delete any data created by test
  await db.query('DELETE FROM users');
});

afterAll(async function() {
  // close db connection
  await db.end();
});
