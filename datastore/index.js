module.exports = {
  async add({ channelId, githubProjectUrl }) {
    // TODO save to database
    console.log(`Subscibe ${channelId} to ${githubProjectUrl}`);
  },
  async remove({ channelId, githubProjectUrl }) {
    // TODO remove from database
    console.log(`Unsubscribe ${channelId} to ${githubProjectUrl}`);
  },
  async queryByGitHubProjectUrl(githubProjectUrl) {
    // TODO
    console.log(`Find by githubProjectUrl ${githubProjectUrl}`);
    const results = [];
    if (process.env.DEBUG_CHANNEL) {
      results.push(
        {
          channelId: process.env.DEBUG_CHANNEL,
          githubProjectUrl,
        },
      );
    }
    return results;
  },
  async queryByChannelId(channelId) {
    // TODO
    console.log(`Find by channelId ${channelId}`);
    return [];
  },
};
