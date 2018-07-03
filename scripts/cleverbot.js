const cs = {};
module.exports = (robot) => {
    robot.catchAll(
        (res) => {
            const room = res.message.room;
            const isDm = res.message.user.roomType === 'd';
            const text = isDm ? res.message.text.substr(res.message.text.indexOf(' ')+1) : res.message.text;


            if (!(isDm || /john/i.test(text) || new RegExp(`/@${process.env.ROCKETCHAT_USER}/`).test(text) )) return;

            const socket = res.robot.adapter.driver.asteroid.ddp._socket;
            const typing = (on) => {
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

            const cleverbot = (input, respond) => {
                const key = process.env.CLEVERBOT_KEY;
                const state = cs[room] || '';
                res.robot.http(`http://www.cleverbot.com/getreply?key=${key}&input=${input}&cs=${state}`)
                    .get()((err, resp, body) => {
                        body = JSON.parse(body);
                        cs[room] = body.cs;
                        respond(body.output);
                    });
            }

            typing(true);
            const timeout = setTimeout(() => typing(false), 10000);
            cleverbot(text, (response) => {
                res.robot.adapter.driver.sendToRoomId(response, room);
                typing(false);
                clearTimeout(timeout);
            });
        }
    )
}
