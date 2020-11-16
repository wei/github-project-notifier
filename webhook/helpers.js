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

async function prepareMessage(payload, githubProject) {
  const { action, changes, project_card } = payload;
  const { html_url: githubProjectUrl } = githubProject;

  if (action === 'moved' && !changes) {
    // Ignore card moves within the same column
    return null;
  }

  // TODO Convert payload to MessageEmbed based on action

  const embed = new MessageEmbed()
    .setTitle(`Project card ${payload.action}`)
    .setURL(`${githubProjectUrl}#card-${project_card.id}`)
    .setColor(0xff0000)
    .setDescription(`\`\`\`${project_card.note}\n\`\`\``);

  return embed;
}

module.exports = {
  getGitHubProject,
  prepareMessage,
};
