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
user1>> hubot add-user <user1.email> password <password>
hubot>> Your user was successfully added to my database.
```

If another user2 tries to add in credentials for other people.
```
user2>> hubot add-user <user1.email> password <password>
hubot>> Stop trying to use other people\'s usernames, bro!
```

Logging hours on JIRA.
```
user1>> hubot log <hours> on <task>
hubot>> Yay! You logged <hours> on <task>
```

## Checklist
- [x] Find a way to add users to hubot
- [x] Create command to log hours
- [ ] Modularize initial script code
- [ ] Add possibility of including comments to hour logs
- [ ] Create command to move task status
- [ ] Create command to assign task to other people
- [ ] Create command to comment on task directly

## NPM Module

https://www.npmjs.com/package/hubot-jira-logger
