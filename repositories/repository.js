const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const scrypt = util.promisify(crypto.scrypt);

module.exports = class Repository {
  constructor(filename) {
    if (!filename) {
      throw new Error('Creating a repository requires a filename');
    }

    this.filename = filename;
    try {
      fs.accessSync(this.filename);
    } catch (err) {
      fs.writeFileSync(this.filename, '[]');
    }
  }

  async create(attrs) {
    attrs.id = this.randomId();
    const records = await this.getAll();
    records.push(attrs);
    await this.writeAll(records);
    return records;
  }

  async getAll() {
    return JSON.parse(await fs.promises.readFile(this.filename, {encoding: 'utf8'}));
  }

  async getOne(id){
    const records = await this.getAll();
    return records.find(record => record.id === id);
  }

  async delete(id){
    const records = await this.getAll();
    const filteredRecords = records.filter(record => record.id !== id);
    const filtered = await this.writeAll(filteredRecords);
    return filtered;
  }

  async update(id, attrs){
    const records = await this.getAll();
    const searched = records.find(record => record.id === id);
    if (!searched) {
      throw new Error(`There is no user with id ${id}`);
    }
    Object.assign(searched, attrs);
    await this.writeAll(records);
  }

  async writeAll(records) {
    await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
  }

  randomId(){
    return crypto.randomBytes(4).toString('hex');
  }

  async getOneBy(filters){
    const records = await this.getAll();
    for (let record of records) {
      let filter = true;
      for (let key in filters) {
        if (filters[key] !== record[key]) {
          filter = false;
        }
      }
      if (filter) {
        return record;
      }
    }
  }
}
