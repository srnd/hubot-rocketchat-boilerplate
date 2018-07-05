const greetings = [
    "Hey there,",
    ":wave:",
    "Hi",
    "Great to see you,",
    "Thanks for joining,",
    "Yo!",
    "I can't believe you're here,",
    "Welcome! Welcome!",
    "What's up,",
    "Nice to see you,",
    "Good to see you,",
    "Pleased to meet you,",
];

const ctas = [
    "You should introduce yourself here.",
    "Introduce yourself here.",
    "Let us know a little more about yourself.",
    "Tell us more about yourself.",
];

const questions = [
    "what band have you been listening to most this week?",
    "have you made any cool projects?",
    "what programming languages have you used? What's your favorite?",
    "ever made a game?",
    "play any multiplayer video games? (see also: #multiplayer)",
    "have you been to CodeDay before?",
    "have any ideas for cool projects to make?",
    "do you have any friends here already?",
];

module.exports = (robot) => {
    robot.enter( (res) => {
        const driver = res.robot.adapter.driver;
        const socket = driver.asteroid.ddp._socket;

        if (res.message.room !== process.env.ROCKETCHAT_GENERALID) return;

        const user = res.message.user.name;
        const dmRoom = `${res.message.user.id}${process.env.ROCKETCHAT_UID}`;
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        const cta = ctas[Math.floor(Math.random() * ctas.length)];
        const question = questions[Math.floor(Math.random() * questions.length)];


        // Typing
        const typing = (room, on) => {
            socket.send(JSON.stringify({
                msg: "method",
                id: "9999",
                method: "stream-notify-room",
                params: [
                    `${room}/typing`,
                    process.env.ROCKETCHAT_USER,
                    on
                ]
            }))
        };


        const publicGreeting = `${greeting} @${user}, welcome to our community! ${cta} Here's a question to get you started: ${question}`;
        const privateGreetings = [
            `Hey there, thanks for joining us!`,
            `I'm John, and I'm SRND's official, 100% not-a-robot, authentic human. (If you message me you will get a genuine and useful reply that is definitely not from the Cleverbot API.)`,
            `You're welcome to poke around anywhere in the chat system. Most of our chat happens in #general, but here are a few other rooms which you might find interesting:\n\n- #music (share songs you like)\n- #hacking (learn about cyber security by example)\n- #nice (recognize other community members who did something nice/helpful)\n- #waywo ("what are you working on")\n- #helpdesk (free live coding help!)\n- #multiplayer (video games!)\n- #random (everything else)`,
            `Our community tries to be as friendly and welcoming as possible, but if you have any problems (or other questions) just DM @tylermenezes.`,
        ];


        // Send the public welcome to #intros
        setTimeout(() => driver.sendToRoomId(publicGreeting, process.env.ROCKETCHAT_INTROID), 10000);


        // Send a private DM with more info
        typing(dmRoom, true);
        setTimeout(() => {
            var timeout = 0;
            for (let i in privateGreetings) {
                const msg = privateGreetings[i];
                timeout += 1000 + (msg.length * 10);

                setTimeout(() => {
                    driver.sendDirectToUser(msg, user)
                    typing(dmRoom, true);
                }, timeout);
            }

            setTimeout(() => typing(dmRoom, false), timeout + 100);
        }, 45000);
    });
}
