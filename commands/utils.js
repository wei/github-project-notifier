module.exports = {
  validateGithubProjectUrl({ githubProjectUrl }) {
    const pattern = /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/projects\/[0-9]+$/;
    return pattern.test(githubProjectUrl);
  },
};
