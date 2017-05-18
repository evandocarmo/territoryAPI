var Schema = {
  users: {
    id: {type: 'increments', nullable: false, primary: true},
    password: {type: 'string', maxlength: 250, nullable: false},
    name: {type: 'string', maxlength: 150, nullable: false}
  },
};

module.exports = Schema;