module.exports = {
  validateGithubProjectUrl({ githubProjectUrl }) {
    const pattern = /^https:\/\/github\.com\/[^/]+\/[^/]+\/projects\/[0-9]+$/;
    return pattern.test(githubProjectUrl);
  },
};
