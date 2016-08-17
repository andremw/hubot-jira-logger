// Description
//   Hubot script for logging hours on Jira.
//
// Configuration:
//   HUBOT_JIRA_PROJECT_TOKEN - Access Token for JIRA API Requests.
//   HUBOT_JIRA_API_URL - JIRA API Url, it needs to be added in, or else requests won't work properly.
//
// Commands:
//  hubot auth <username> <password> - Authenticate on JIRA to be able to log work.
//  hubot log <hours> on <task> - Logs hours on JIRA.

'use strict';

const JIRA_API_URL = process.env.HUBOT_JIRA_API_URL;
const JIRA_PROJECT_TOKEN = process.env.HUBOT_JIRA_PROJECT_TOKEN;

const crypto = require('./crypto');

module.exports = robot => {
  if (!JIRA_API_URL || !JIRA_PROJECT_TOKEN) {
    robot.logger.error(`Please make sure the required environment variables are all set.`);
    throw new Error(`Please make sure the required environment variables are all set.`);
  }

  robot.respond(/auth (.+)\s(.[^\s]+)/, response => {
    authenticate(robot, response);
  });

  robot.respond(/log (.+) on ([^\s]+)(.*)?/i, response => {
    logWork(robot, response);
  });
};

function logWork(robot, response) {
  const hubotUserID = response.message.user.id;
  const encryptedUserpass = robot.brain.get(hubotUserID);

  if (!encryptedUserpass) {
    response.send(`Couldn't find your credentials. Add them running the command _auth <username> <password>_ and try again.`);
    return;
  }

  const config = {
    time: response.match[1],
    jiraNumber: response.match[2],
    comment: response.match[3],
    projectToken: JIRA_PROJECT_TOKEN,
    userpass: crypto.decryptText(encryptedUserpass, hubotUserID)
  };

  sendLog(robot, config)
      .then(successMessage => response.send(successMessage))
      .catch(err => response.send(err));
}

function sendLog(robot, config) {
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
          reject(`Got error: ${err}`);
        }

        if (res.statusCode === 400) {
          reject(`Bad request.`);
        }

        if (res.statusCode === 401) {
          reject('Unauthorized. Check if your credentials are correct and try again.');
        }

        resolve(`Logged ${config.time} on ${config.jiraNumber}.`);
      });
  });
}

function authenticate(robot, response) {
  const username = response.match[1];
  const password = response.match[2];
  // try getting unique trait from slack user, in this case: Slack ID
  // encrypt based on Slack ID, robot should only be accessible through Slack
  const hubotUserID = response.message.user.id;

  if (response.message.user.profile.email !== username) {
    response.send(`${username} is not your username. You can only log work with your username.`);
    return;
  }

  try {
    const userpassBase64 = new Buffer(`${username}:${password}`).toString('base64');
    const encryptedUserpass = crypto.encryptText(userpassBase64, hubotUserID);

    robot.brain.set(hubotUserID, encryptedUserpass);

    response.send('Your user was successfully added to my database.');
  } catch (err) {
    response.send(`Couldn't authenticate: ${err}`);
  }
}
