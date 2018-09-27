const Mixer = require('@mixer/client-node');

const client = new Mixer.Client(new Mixer.DefaultRequestRunner());

const channelName = process.argv[2];

client.use(new Mixer.OAuthProvider(client, {
    clientId: 'fb704dbc2d95c1b40adeec2d31c9049ff678f3fa176b2beb',
}));

client.request('GET', `channels/${channelName}`)
.then(res => {
    // console.log(res.body);
    const viewers = res.body.viewersCurrent;
    console.log(`You have ${viewers} total viewers...`);
});