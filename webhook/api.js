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

async function getIssueState(owner, repoName, issue, issueUrl) {
  if(!issue.pull_request) {
    return issue.state;
  }
  else {
    const pullRequest = (await getPull(owner.login, repoName, issueUrl[issueUrl.length - 1])).data;
    if(issue.state == 'closed' && pullRequest.merged) {
      return 'merged PR';
    }
    else {
      return issue.state + ' PR';
    }
  }
}

module.exports = {
  getGitHubProject,
  getProjectCardCol,
  getIssue,
  getIssueState,
  getPull,
};
