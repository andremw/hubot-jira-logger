// Description
//   Hubot script for logging hours on Jira.
//
// Configuration:
//   JIRA_PROJECT_TOKEN - Access Token for JIRA API Requests.
//   JIRA_API_URL - JIRA API Url, it needs to be added in, or else requests won't work properly.
//
// Commands:
//  hubot log <hours> on <task> - Logs hours on JIRA.
//  hubot add-user <username> password <password> - Adds JIRA user to Android 18's database.

'use strict';
const crypto = require('crypto');

const JIRA_API_URL = process.env.HUBOT_JIRA_API_URL;
const JIRA_PROJECT_TOKEN = process.env.HUBOT_JIRA_PROJECT_TOKEN;

module.exports = robot => {
  function encryptText(text, secret) {
    const cipher = crypto.createCipher('aes-256-ctr', secret);
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  }

  function decryptText(text, secret) {
    const decipher = crypto.createDecipher('aes-256-ctr', secret);
    let dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  }

  function logHours(config) {
    const worklog = {
      comment: config.comment,
      timeSpent: config.time
    };

    const url = `${JIRA_API_URL}/issue/${config.jiraNumber}/worklog`;

    return new Promise((resolve, reject) => {
      robot.http(url, {rejectUnauthorized: false, muteHttpExceptions: false})
        .header('Content-Type', 'application/json')
        .header('Authorization', `Basic ${config.userpass}`)
        .header('app_token', config.projectToken)
        .post(JSON.stringify(worklog))((err, res) => {
          if (err) {
            reject(err);
          }
          if (res.statusCode === 400) {
            reject('I received a Bad Request from JIRA. :|');
          }

          if (res.status === 401) {
            reject('Your password is definitely wrong. Change it.');
          }

          resolve(`Yay! You logged ${config.time} on ${config.jiraNumber}`);
        });
    });
  }

  robot.respond(/log (.+) on ([^\s]+)(.*)?/i, response => {
    const hubotUserID = response.message.user.id;
    const encryptedUserpass = robot.brain.get(hubotUserID);

    if (!encryptedUserpass) {
      response.send('You have ABSOLUTELY no credentials! Please add them with: add-user <username> password <password>');
      return;
    }

    const config = {
      time: response.match[1],
      jiraNumber: response.match[2],
      comment: response.match[3],
      projectToken: JIRA_PROJECT_TOKEN,
      userpass: decryptText(encryptedUserpass, hubotUserID)
    };

    logHours(config)
        .then(successMessage => response.send(successMessage))
        .catch(err => response.send(err));
  });

  robot.respond(/add-user (.+) password (.[^\s]+)/, response => {
    const username = response.match[1];
    const password = response.match[2];
    // try getting unique trait from slack user, in this case: Slack ID
    // encrypt based on Slack ID, robot should only be accessible through Slack
    const hubotUserID = response.message.user.id;

    if (response.message.user.profile.email !== username) {
      response.send('Stop trying to use other people\'s usernames, bro!');
      return;
    }

    try {
      const userpassBase64 = new Buffer(`${username}':'${password}`).toString('base64');
      const encryptedUserpass = encryptText(userpassBase64, hubotUserID);

      robot.brain.set(hubotUserID, encryptedUserpass);

      response.send('Your user was successfully added to my database.');
    } catch (err) {
      response.send(err);
    }
  });
};
