'use strict';

const crypto = require('crypto');

module.exports.encryptText = (text, secret) => {
  const cipher = crypto.createCipher('aes-256-ctr', secret);
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
};

module.exports.decryptText = (text, secret) => {
  const decipher = crypto.createDecipher('aes-256-ctr', secret);
  let dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
};
