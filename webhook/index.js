const datastore = require('../datastore');
const { getGitHubProject } = require('./api');
const { prepareMessage } = require('./helpers');

// TODO Performance improvements using `Promise.all`
module.exports = client => async (request, reply) => {
  if (request.headers['x-github-event'] !== 'project_card') {
    reply.type('application/json').code(400);
    return { status: 'bad request' };
  }

  const payload = request.body;

  const githubProject = await getGitHubProject(payload);
  const { html_url: githubProjectUrl } = githubProject || {};
  if (!githubProject || !githubProjectUrl) {
    return { status: 'not found', message: 'GitHub project not found' };
  }

  const messageEmbed = await prepareMessage({ payload, githubProject });
  if (!messageEmbed) {
    return { status: 'ok' };
  }

  const subscribedChannels = await datastore.query({ githubProjectUrl });
  (process.env.DEBUG_CHANNEL || '').split(',').forEach(
    channelId => subscribedChannels.push({ channelId, githubProjectUrl }),
  );

  for (const { channelId } of subscribedChannels) {
    const channel = await client.channels.fetch(channelId);
    await channel.send(messageEmbed);
  }

  reply.type('application/json').code(200);
  return { status: 'ok' };
};
