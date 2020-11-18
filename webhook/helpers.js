const { MessageEmbed } = require('discord.js');
const {
  getProjectCardCol,
  getIssue,
  getIssueState,
} = require('./api');

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
  const newColName = (await getProjectCardCol(project_card.column_id)).data;


  // NOTE: Prev Column is only Available for Action == Moved
  if(action == 'moved') {
    prevColName = (await getProjectCardCol(changes.column_id.from)).data;
  }
  if(!description) {
    const issueUrl = project_card.content_url.split('/');
    const issue = (await getIssue(owner.login, repoName, issueUrl[issueUrl.length - 1])).data;
    issueState = getIssueState(owner, repoName, issue, issueUrl);
    description = '';
    title = issue.title;
  }

  const color = getColor(action);
  const thumbnail = getThumbnail(issueState);


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

  const embedFields = {
    prevColName: prevColName.name,
    newColName: newColName.name,
    cardName,
    action: payload.action,
  };
  embed = setEmbedFields(embed, embedFields);

  return embed;
}

function setEmbedFields(embed, payload) {
  if(payload.action == 'moved') {
    embed = embed.addFields(
      { name: 'Moved From', value: `${payload.prevColName}`, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Moved To', value: `${payload.newColName}`, inline: true },
    )
      .addFields(
        { name: 'Project Name', value: `${payload.cardName}`, inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: 'Action', value: `${payload.action}`, inline: true },
      )
      .addFields(
        { name: '\u200B', value: '\u200B' },
      );
  }
  else {
    embed = embed.addFields(
      { name: 'Column', value: `${payload.newColName}`, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
    )
      .addFields(
        { name: 'Project Name', value: `${payload.cardName}`, inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: 'Action', value: `${payload.action}`, inline: true },
      )
      .addFields(
        { name: '\u200B', value: '\u200B' },
      );
  }

  return embed;
}


function getThumbnail(issueState) {
  let thumbnail;
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

  return thumbnail;
}

function getColor(action) {
  let color;
  switch(action) {
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

  return color;
}


module.exports = {
  prepareMessage,
};
