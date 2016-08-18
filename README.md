# hubot-jira-logger

Hubot script for logging hours on Jira.

See [`src/jira-logger.coffee`](src/jira-logger.coffee) for full documentation.

## Installation

In hubot project repo, run:

`npm install hubot-jira-logger --save`

Then add **hubot-jira-logger** to your `external-scripts.json`:

```json
[
  "hubot-jira-logger"
]
```

## Sample Interaction

Privately, user1 sends a message to hubot.
```
user1>> hubot auth <user1.email> <password>
hubot>> Your user was successfully added to my database.
```

If another user2 tries to add in credentials for other people.
```
user2>> hubot auth <user1.email> <password>
hubot>> <user1.email> is not your username. You can only log work with your username.
```

_It's important to notice that currently, the verification between different users is made by e-mail. So the Jira Account e-mail must match the Slack Account e-mail in order to add credentials._

Logging hours on JIRA.
```
user1>> hubot log <time> on <task> [optional-comment]
hubot>> Logged <time> on <task>.
```

## NPM Module

https://www.npmjs.com/package/hubot-jira-logger
