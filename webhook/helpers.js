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

async function prepareMessage({ payload, githubProject }) {
  const { action, changes, project_card, sender, repository } = payload;
  const { login: userName, avatar_url: userAvatar, html_url: userUrl } = sender;
  const { html_url: githubProjectUrl, name: cardName } = githubProject;
  const { name: repoName } = repository;
  let description = project_card.note;
  let prevColName = { name: '-' };
  let thumbnail = 'https://cdn.iconscout.com/icon/free/png-512/issue-4-433271.png';
  const prevColId = changes.column_id;
  const newColName = (await getProjectCardCol(project_card.column_id)).data;
  // NOTE: Prev Column is only Available for Action == Moved
  if(prevColId) {
    prevColName = (await getProjectCardCol(changes.column_id.from)).data;
  }
  if(!description) {
    description = 'No Description';
  }
  let color = '#ecf0f1';

  if (action === 'moved' && !changes) {
    // Ignore card moves within the same column
    return null;
  }

  switch (action) {
  case 'created':
    color = '#ecf0f1';
    thumbnail = 'https://cdn.iconscout.com/icon/free/png-512/issue-4-433271.png';
    break;
  case 'edited':
    color = '#3498db';
    thumbnail = 'https://cdn.iconscout.com/icon/free/png-512/issue-4-433271.png';
    break;
  case 'moved':
    color = '#2ecc71';
    thumbnail = 'https://cdn.iconscout.com/icon/free/png-512/issue-4-433271.png';
    break;
  case 'converted':
    color = '#e67e22';
    thumbnail = 'https://cdn.iconscout.com/icon/free/png-512/issue-4-433271.png';
    break;
  case 'deleted':
    color = '#e74c3c';
    thumbnail = 'https://cdn.iconscout.com/icon/free/png-512/issue-4-433271.png';
    break;
  }


  const embed = new MessageEmbed()
    .setTitle(`${repoName}`)
    .setURL(`${githubProjectUrl}#card-${project_card.id}`)
    .setColor(color)
    .setThumbnail(thumbnail)
    .setAuthor(userName, userAvatar, userUrl)
    .addFields(
      { name: '\u200B', value: '\u200B' },
    )
    .addFields(
      { name: 'Moved From', value: `${prevColName.name}`, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Moved To', value: `${newColName.name}`, inline: true },
    )
    .addFields(
      { name: 'Card Name', value: `${cardName}`, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Action', value: `${payload.action}`, inline: true },
    )
    .addFields(
      { name: '\u200B', value: '\u200B' },
    )
    .setDescription(`${description}`)
    .setTimestamp();

  return embed;
}

module.exports = {
  getGitHubProject,
  prepareMessage,
};
