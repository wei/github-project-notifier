const { MessageEmbed } = require('discord.js');
const {
  getProjectCardColumn,
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
  const { html_url: githubProjectUrl, name: projectName } = githubProject;
  const { full_name: repoFullName } = repository;
  let description = (project_card.note || '').trim();
  let prevColumn = { name: '-' };
  let cardState = 'card';
  const firstLine = description.split(/\n+/)[0];
  let title = `[${toPascalCase(action)}] ${firstLine}`;
  description = description.replace(firstLine, '').trim();
  const column = await getProjectCardColumn(project_card.column_id);

  if (changes && changes.column_id) {
    prevColumn = await getProjectCardColumn(changes.column_id.from);
  }

  const linkedIssue = detectProjectCardIssue(project_card);
  if (linkedIssue) {
    const issue = await getIssue(linkedIssue.owner, linkedIssue.repo, linkedIssue.number);
    if (issue) {
      cardState = await getIssueState(linkedIssue.owner, linkedIssue.repo, issue);
      const issueRepo = `${linkedIssue.owner}/${linkedIssue.repo}`;
      const repoPrefix = issueRepo !== repoFullName ? issueRepo : '';
      title = `[${toPascalCase(action)}] ${repoPrefix}#${issue.number}\n${issue.title}`;
      description = project_card.note || '';
      if (!description) {
        description = issue.body.trim();

        if (description.length > 280) {
          description = `${description.substring(0, 280)}...`;
        }
      }
    }
  }

  const color = getColor(action);
  const thumbnail = getThumbnail(cardState);

  let embed = new MessageEmbed()
    .setTitle(title)
    .setDescription(description)
    .setURL(`${githubProjectUrl}#card-${project_card.id}`)
    .setColor(color)
    .setThumbnail(thumbnail)
    .setAuthor(userName, userAvatar, userUrl)
    .addFields(
      { name: '\u200B', value: '\u200B' },
    )
    .setFooter(`${repoFullName} • ${projectName}`, 'https://user-images.githubusercontent.com/5880908/99613426-888b1d00-29e5-11eb-981e-029a23b84763.png')
    .setTimestamp();

  const embedFields = {
    prevColName: prevColumn ? prevColumn.name : undefined,
    colName: column ? column.name : '-',
    creator: project_card.creator ? `@${project_card.creator.login}` : '-',
  };
  embed = setEmbedFields(embed, embedFields);

  return embed;
}

function setEmbedFields(embed, { prevColName, colName, creator }) {
  if (prevColName) {
    embed = embed
      .addFields(
        { name: 'Moved To', value: colName, inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: 'Moved From', value: prevColName, inline: true },
      )
      .addFields(
        { name: 'Created by', value: creator, inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
      )
      .addFields(
        { name: '\u200B', value: '\u200B' },
      );
  }
  else {
    embed = embed
      .addFields(
        { name: 'Column', value: colName, inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
      )
      .addFields(
        { name: 'Created by', value: creator, inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
      )
      .addFields(
        { name: '\u200B', value: '\u200B' },
      );
  }

  return embed;
}


function getThumbnail(name = 'card') {
  return `https://gist.github.com/wei/49bcf5309a964fdd39f2d23d04c3a992/raw/${name}-128x128.png`;
}

function getColor(action) {
  switch (action) {
  case 'created': return 'GREEN';
  case 'edited': return 'BLUE';
  case 'moved': return 'YELLOW';
  case 'converted': return 'AQUA';
  case 'deleted': return 'RED';
  default: return 'DARK_BUT_NOT_BLACK';
  }
}

function toPascalCase(s) {
  return s.replace(/\w+/g,
    function(w) {return w[0].toUpperCase() + w.slice(1).toLowerCase();});
}

function detectProjectCardIssue(project_card) {
  const string = `${project_card.content_url}\n${project_card.note || ''}`;

  const match = /([^/\s]+)\/([^/\s]+)(?:\/issues\/|\/pull\/|#)(\d+)/.exec(string);
  if (match) {
    const [, owner, repo, number] = match;
    return {
      owner,
      repo,
      number,
    };
  }

  return null;
}

module.exports = {
  prepareMessage,
};
