const { MessageEmbed } = require('discord.js');
const {
  getProjectCardColumn,
  getIssue,
  getPull,
  getCardState,
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
  let prevColumn = null;
  let cardState = 'card';
  const firstLine = description.split(/\n+/)[0];
  let title = `[${toPascalCase(action)}] ${firstLine}`;
  description = description.replace(firstLine, '').trim();
  const column = await getProjectCardColumn(project_card.column_id);
  let issue = null;
  let pullRequest = null;

  if (changes && changes.column_id) {
    prevColumn = await getProjectCardColumn(changes.column_id.from);
  }

  const detectedIssue = detectProjectCardIssue(project_card);
  if (detectedIssue) {
    issue = await getIssue(detectedIssue.owner, detectedIssue.repo, detectedIssue.number);
    if (issue) {
      pullRequest = issue.pull_request ? await getPull(detectedIssue.owner, detectedIssue.repo, detectedIssue.number) : null;
      cardState = await getCardState(issue, pullRequest);
      const issueRepo = `${detectedIssue.owner}/${detectedIssue.repo}`;
      const repoPrefix = issueRepo !== repoFullName ? issueRepo : '';
      title = `[${toPascalCase(action)}] ${repoPrefix}#${issue.number}\n${issue.title}`;
      description = project_card.note || '';
      if (!description) {
        description = (issue.body || '').trim();

        if (description.length > 350) {
          description = `${description.substring(0, 350)}... [(Read more)](${issue.html_url})`;
        }
      }
    }
  }

  let embed = new MessageEmbed()
    .setTitle(title)
    .setDescription(description)
    .setURL(`${githubProjectUrl}#card-${project_card.id}`)
    .setColor(getColor(action))
    .setThumbnail(getThumbnail(cardState))
    .setAuthor(userName, userAvatar, userUrl)
    .addFields(
      { name: '\u200B', value: '\u200B' },
    )
    .setFooter(`${repoFullName} • ${projectName}`, 'https://user-images.githubusercontent.com/5880908/99613426-888b1d00-29e5-11eb-981e-029a23b84763.png')
    .setTimestamp();

  const embedFields = {
    prevColName: prevColumn ? `[${prevColumn.name}](${githubProjectUrl}#column-${prevColumn.id})` : undefined,
    colName: column ? `[${column.name}](${githubProjectUrl}#column-${column.id})` : '-',
    created: project_card.creator
      ? `[@${project_card.creator.login}](https://github.com/${project_card.creator.login}) on ${project_card.created_at.substr(0, 10)}` : '-',
    assignees: (issue && issue.assignees || []).map(a => `[@${a.login}](https://github.com/${a.login})`).join('\n'),
    reviewers: (pullRequest && pullRequest.requested_reviewers || []).map(r => `[@${r.login}](https://github.com/${r.login})`).join('\n'),
    labels: (issue && issue.labels || []).map(l => `\`${l.name}\``).join(' '),
  };
  embed = setEmbedFields(embed, embedFields);

  return embed;
}

function setEmbedFields(embed, { prevColName, colName, created, assignees, reviewers, labels }) {
  if (prevColName) {
    embed = embed
      .addFields(
        { name: 'Moved To', value: colName, inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: 'Moved From', value: prevColName, inline: true },
      );
  }
  else {
    embed = embed
      .addFields(
        { name: 'Column', value: colName },
      );
  }

  if (assignees || reviewers) {
    embed = embed
      .addFields(
        { name: 'Reviewers', value: reviewers || '-', inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: 'Assignees', value: assignees || '-', inline: true },
      );
  }

  if (labels) {
    embed = embed
      .addFields(
        { name: 'Labels', value: labels },
      );
  }

  embed = embed
    .addFields(
      { name: 'Created', value: created },
    )
    .addFields(
      { name: '\u200B', value: '\u200B' },
    );

  return embed;
}


function getThumbnail(name = 'card') {
  return `https://gist.github.com/wei/49bcf5309a964fdd39f2d23d04c3a992/raw/${name}-128x128.png`;
}

function getColor(action) {
  switch (action) {
  case 'created': return 'GREEN';
  case 'edited': return 'GOLD';
  case 'moved': return 'BLUE';
  case 'converted': return 'ORANGE';
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
