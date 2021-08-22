const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const scrypt = util.promisify(crypto.scrypt);
const Repository = require('./repository');

class UsersRepository extends Repository{

  async create(attrs) {
    attrs.id = this.randomId();
    const salt = crypto.randomBytes(8).toString('hex');
    const hash = await scrypt(attrs.password, salt, 64);
    const records = await this.getAll();
    const record = {...attrs, password: `${hash.toString('hex')}.${salt}`};
    records.push(record);
    await this.writeAll(records);
    return record;
  }

  async comparePasswords(saved, supplied){
    const [hash, salt] = saved.split('.');
    const hashedSupplied = await scrypt(supplied, salt, 64)
    return hashedSupplied.toString('hex') === hash;
  }

}


module.exports = new UsersRepository('users.json');
