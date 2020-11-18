const { Octokit } = require('@octokit/rest');
const { MessageEmbed } = require('discord.js');
const { githubToken } = require('../config');

const octokit = new Octokit({
  userAgent: 'github-project-bot',
  auth: githubToken,
});

async function getGitHubProject(payload) {
  const { project_card } = payload;
  const projectId = project_card.project_url.split('/').pop();

  return (await octokit.projects.get({ project_id: projectId })).data;
}

async function getProjectCardCol(colId) {
  // This will not work for Created/ Edited Etc (Try Catch is)
  if(!colId) {
    return;
  }
  return (await octokit.projects.getColumn({
    column_id: colId,
  }));
}

async function getIssue(owner, repo, issue_number) {
  return (await octokit.issues.get({
    owner,
    repo,
    issue_number,
  }));
}

async function getPull(owner, repo, pull_number) {
  return (await octokit.pulls.get({
    owner,
    repo,
    pull_number,
  }));
}

async function prepareMessage({ payload, githubProject }) {

  const { action, changes, project_card, sender, repository } = payload;

  if (action === 'moved' && !changes) {
    // Ignore card moves within the same column
    return null;
  }
  const { login: userName, avatar_url: userAvatar, html_url: userUrl } = sender;
  const { html_url: githubProjectUrl, name: cardName } = githubProject;
  const { name: repoName, owner, full_name: fullName } = repository;
  let description = project_card.note;
  let prevColName = { name: '-' };
  let issueState = 'card';
  const newlineIndex = (description || '').search('\r');
  let title = (description || '').slice(0, newlineIndex);
  description = (description || '').slice(newlineIndex);
  let thumbnail = 'https://cdn.iconscout.com/icon/free/png-512/issue-4-433271.png';
  const newColName = (await getProjectCardCol(project_card.column_id)).data;
  let pullRequest;


  // NOTE: Prev Column is only Available for Action == Moved
  if(action == 'moved') {
    prevColName = (await getProjectCardCol(changes.column_id.from)).data;
  }
  if(!description) {
    const issueUrl = project_card.content_url.split('/');
    const issue = (await getIssue(owner.login, repoName, issueUrl[issueUrl.length - 1])).data;
    // Set the state and also check whether it's an Issue or a PR
    if(!issue.pull_request) {
      issueState = issue.state;
    }
    else {
      pullRequest = (await getPull(owner.login, repoName, issueUrl[issueUrl.length - 1])).data;
      if(issue.state == 'closed' && pullRequest.merged) {
        issueState = 'merged PR';
      }
      else {
        issueState = issue.state + ' PR';
      }
    }
    description = '';
    title = issue.title;
  }
  let color;

  switch (action) {
  case 'created':
    color = '#ecf0f1';
    break;
  case 'edited':
    color = '#3498db';
    break;
  case 'moved':
    color = '#2ecc71';
    break;
  case 'converted':
    color = '#e67e22';
    break;
  case 'deleted':
    color = '#e74c3c';
    break;
  }

  switch(issueState) {
  case 'card':
    thumbnail = 'https://gist.github.com/wei/49bcf5309a964fdd39f2d23d04c3a992/raw/41d1524e4e2f426bb36507bc0c2e96f91d1cfd8b/card-128x128.png';
    break;
  case 'open':
    thumbnail = 'https://gist.github.com/wei/49bcf5309a964fdd39f2d23d04c3a992/raw/41d1524e4e2f426bb36507bc0c2e96f91d1cfd8b/issue-open-128x128.png';
    break;
  case 'closed':
    thumbnail = 'https://gist.github.com/wei/49bcf5309a964fdd39f2d23d04c3a992/raw/41d1524e4e2f426bb36507bc0c2e96f91d1cfd8b/issue-closed-128x128.png';
    break;
  case 'open PR':
    thumbnail = 'https://gist.github.com/wei/49bcf5309a964fdd39f2d23d04c3a992/raw/41d1524e4e2f426bb36507bc0c2e96f91d1cfd8b/pr-open-128x128.png';
    break;
  case 'closed PR':
    thumbnail = 'https://gist.github.com/wei/49bcf5309a964fdd39f2d23d04c3a992/raw/41d1524e4e2f426bb36507bc0c2e96f91d1cfd8b/pr-closed-h48.png';
    break;
  case 'merged PR':
    thumbnail = 'https://gist.github.com/wei/49bcf5309a964fdd39f2d23d04c3a992/raw/41d1524e4e2f426bb36507bc0c2e96f91d1cfd8b/pr-merged-128x128.png';
    break;
  }


  let embed = new MessageEmbed()
    .setTitle(`${title}`)
    .setURL(`${githubProjectUrl}#card-${project_card.id}`)
    .setColor(color)
    .setThumbnail(thumbnail)
    .setAuthor(userName, userAvatar, userUrl)
    .addFields(
      { name: '\u200B', value: '\u200B' },
    )
    .setDescription(`${description}`)
    .setFooter(`${fullName}`)
    .setTimestamp();

  if(action == 'moved') {
    embed = embed.addFields(
      { name: 'Moved From', value: `${prevColName.name}`, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Moved To', value: `${newColName.name}`, inline: true },
    )
      .addFields(
        { name: 'Project Name', value: `${cardName}`, inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: 'Action', value: `${payload.action}`, inline: true },
      )
      .addFields(
        { name: '\u200B', value: '\u200B' },
      );
  }
  else {
    embed = embed.addFields(
      { name: 'Column', value: `${newColName.name}`, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
    )
      .addFields(
        { name: 'Project Name', value: `${cardName}`, inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: 'Action', value: `${payload.action}`, inline: true },
      )
      .addFields(
        { name: '\u200B', value: '\u200B' },
      );
  }

  return embed;
}

module.exports = {
  getGitHubProject,
  prepareMessage,
};
