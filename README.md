# Slackbot PR reminder
Do your PRs sit open for an exceptionally long time? Are you tired of manually nagging people to review them? Nag no more, this slackbot takes care of the nagging for you 

## Setup
Getting the slackbot going it three easy steps:

1. Clone this repository
1. ```npm install```
1. Configure the slackbot

## Configuration
The configuration file exists in ```config/default.yml```. A minimal configuration file is in place for you to extend. You'll want to create a bot account in slack, and put the name you use in the config using the key ```bot_name```, you'll also want to put the slack API token in the key ```slack_api_token```. The last token you need to generate is an API token for github, which you'll store in the ```github_api_token``` key. 

The next thing you want to set is a default channel to announce pull requests to. You should also specify default times in the UTC time zone you want the bot to announce open PRs at. 

Using the ```reminders``` key you can set up which repositories to monitor, and over ride the channel and times. 

A sample config looks like:
```
bot_name: wubwubwub
slack_api_token: ojdfsjdf
github_api_token: kasjfdkafa3

default_channel: general
default_times:
  - hour: 24
    minute: 54

reminders:
  - repo: jjshoe/slackbot-pr-reminder
    channel: dev
    times:
      - hour: 16
        minute:  56
      - hour: 16
        minute:  58
  - repo: jjshoe/example
```
