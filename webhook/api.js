const { Octokit } = require('@octokit/rest');
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

async function getProjectCardColumn(colId) {
  if (!colId) {
    return null;
  }
  try {
    return (await octokit.projects.getColumn({ column_id: colId })).data;
  }
  catch {
    return null;
  }
}

async function getIssue(owner, repo, issue_number) {
  try {
    return (await octokit.issues.get({
      owner,
      repo,
      issue_number,
    })).data;
  }
  catch {
    return null;
  }
}

async function getPull(owner, repo, pull_number) {
  try {
    return (await octokit.pulls.get({
      owner,
      repo,
      pull_number,
    })).data;
  }
  catch {
    return null;
  }
}

async function getCardState(issue, pullRequest) {
  try {
    if (!pullRequest) {
      return `issue-${issue.state}`;
    }
    else if (issue.state == 'closed' && pullRequest.merged) {
      return 'pr-merged';
    }
    else {
      return `pr-${issue.state}`;
    }
  }
  catch {
    return 'card';
  }
}

module.exports = {
  getGitHubProject,
  getProjectCardColumn,
  getIssue,
  getPull,
  getCardState,
};
