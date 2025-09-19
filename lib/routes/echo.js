const service = ({logger, makeService}) => {
    const svc = makeService({path: '/echo'});

    svc.on('session:new', (session) => {
        session.locals = {logger: logger.child({call_sid: session.call_sid})};
        logger.info({session}, `new incoming call: ${session.call_sid}`);
        try {
            session
                .on('close', onClose.bind(null, session))
                .on('error', onError.bind(null, session))
                .on('/echo', onSpeechEvent.bind(null, session));

            session.answer();

            // set the notifyEvents at the beginning of the call
            // session
            //     .config({
            //         notifyEvents: true,
            //     })
            //     .send({execImmediate: false})

            session
                .pause({length: 2})
                .gather({
                    actionHook: '/echo',
                    // partialResultHook: '/echo',
                    id: "08832cbf-d137-4f75-a1c8-1a7cfc0c395c",
                    input: ['speech', "digits"],
                    timeout: 10,
                    listenDuringPrompt: true,
                    bargein: true,
                    minBargeinWordCount: 1,
                    recognizer: {
                        vendor: "default",
                        language: "en-US",
                        interim: true,
                        separateRecognitionPerChannel: true
                    },
                    say: {
                        text: 'Hello Admin. Its always a pleasure to see you. How may i help you ?',
                        synthesizer: {
                            vendor: "default",
                            language: "en-US",
                            voice: "default"
                        }
                    },
                    actionHookDelayAction: {
                        enabled: true,
                        noResponseTimeout: 0.25,
                        noResponseGiveUpTimeout: 100,
                        retries: 100,
                        actions: [
                            {
                                verb: "play",
                                url: "file:///home/ec2-user/typingSound.wav"
                            }
                        ]
                    },
                    interDigitTimeout: 2,
                    minDigits: 0,
                    dtmfBargein: true
                })
                .send({execImmediate: false});
        } catch (err) {
            session.locals.logger.info({err}, `Error to responding to incoming call: ${session.call_sid}`);
            session.close();
        }
    });
};

const onSpeechEvent = async (session, evt) => {
    const {logger} = session.locals;
    logger.info(`got speech evt: ${JSON.stringify(evt)}`);

    switch (evt.reason) {
        case 'speechDetected':
            echoSpeech(session, evt);
            break;
        case 'timeout':
            reprompt(session);
            break;
        default:
            session.reply();
            break;
    }
};

const echoSpeech = async (session, evt) => {
    const {transcript, confidence} = evt.speech.alternatives[0];
    const {logger} = session.locals;
    logger.info({session}, `Result: ${transcript}`);

    if (transcript.toLowerCase().includes("pay my last bill.")) {
        session
            .say({
                text: 'Understood, let me look into that for you.',
                id: "019953d4-b7fc-7426-b3e6-dce4211474dd",
                synthesizer: {
                    vendor: "default",
                    language: "en-US",
                    voice: "default"
                }
            })
            .send({execImmediate: false});

        //Simulate delay
        await new Promise(r => setTimeout(r, 4000));
        session
            .say({
                text: 'Thank you for your patience, the bill payment process is underway now.',
                id: "019953d4-b7fc-7426-b3e6-dce4211474dd",
                synthesizer: {
                    vendor: "default",
                    language: "en-US",
                    voice: "default"
                }
            })
            .send({execImmediate: false});

        //Simulate delay
        // await new Promise(r => setTimeout(r, 4000));

        session
            .config({
                id: "4792be6e-62bf-4615-a1f3-cba51ec9448c",
                bargeIn: {
                    enable: true,
                    interDigitTimeout: 2,
                    minDigits: 0,
                    sticky: true,
                    actionHook: "/echo",
                    input: [
                        "speech",
                        "digits"
                    ]
                },
                actionHookDelayAction: {
                    enabled: true,
                    noResponseTimeout: 2,
                    noResponseGiveUpTimeout: 100,
                    retries: 100,
                    actions: [
                        {
                            verb: "play",
                            url: "file:///home/ec2-user/typingSound.wav"
                        }
                    ]
                },
                recognizer: {
                    vendor: "default",
                    language: "en-US",
                    interim: true,
                    separateRecognitionPerChannel: true
                }

            })
            .send({execImmediate: false});

        session
            .say({
                text: 'The total amount due for your August 2025 bill is 87 dollars.',
                id: "019953d4-df38-741c-bd77-6208b8f10f0d",
                synthesizer: {
                    vendor: "default",
                    language: "en-US",
                    voice: "default"
                }
            })
            .send({execImmediate: false});

        session
            .say({
                text: ' Taxes and fees come to 10 dollars.',
                id: "019953d4-df38-741c-bd77-6208b8f10f0d",
                synthesizer: {
                    vendor: "default",
                    language: "en-US",
                    voice: "default"
                }
            })
            .send({execImmediate: false});

        session
            .say({
                text: ' Would you like to go ahead and make this payment now?',
                id: "019953d4-df38-741c-bd77-6208b8f10f0d",
                synthesizer: {
                    vendor: "default",
                    language: "en-US",
                    voice: "default"
                }
            })
            .send({execImmediate: false});

    } else if (transcript.toLowerCase().includes("yes")) {
        session
            .say({
                text: 'Understood, let me handle this for you.',
                id: "019953d5-0797-787e-994f-59c436e53b94",
                synthesizer: {
                    vendor: "default",
                    language: "en-US",
                    voice: "default"
                }
            })
            .send({execImmediate: false});

        //Simulate delay
        // await new Promise(r => setTimeout(r, 3500));
        // disabling the background listen
        session
            .config({
                notifyEvents: true,
                bargeIn: {
                    enable: false,
                    interDigitTimeout: 0,
                    minDigits: 0
                }
            })
            .pause({length: 2})
            .send({execImmediate: false});

        // send a gather with nested say
        session
            .gather({
                actionHook: '/echo',
                // partialResultHook: '/echo',
                id: "06ca8ad0-5f27-497d-a780-3044bd2a3189",
                input: ['speech', "digits"],
                timeout: 10,
                listenDuringPrompt: true,
                bargein: true,
                minBargeinWordCount: 1,
                recognizer: {
                    vendor: "default",
                    language: "en-US",
                    interim: true,
                    separateRecognitionPerChannel: true
                },
                say: {
                    text: 'Background listening stopped, do you want to proceed further ?',
                    synthesizer: {
                        vendor: "default",
                        language: "en-US",
                        voice: "default"
                    }
                },
                actionHookDelayAction: {
                    enabled: true,
                    noResponseTimeout: 0.25,
                    noResponseGiveUpTimeout: 100,
                    retries: 100,
                    actions: [
                        {
                            verb: "play",
                            url: "file:///home/ec2-user/typingSound.wav"
                        }
                    ]
                },
                interDigitTimeout: 2,
                minDigits: 0,
                dtmfBargein: true
            })
            .send({execImmediate: false});
    } else {

        session
            .say({text: `You said: ${transcript}.  The confident score was ${confidence.toFixed(2)}`})
            .gather({
              say: {text: 'Say something else.'},
              input: ['speech'],
              actionHook: '/echo'
            })
            .reply();
    }
};

const reprompt = async (session, evt) => {
    session
        .gather({
            say: {text: 'Are you still there?  I didn\'t hear anything.'},
            input: ['speech'],
            actionHook: '/echo'
        })
        .reply();
};

const onClose = (session, code, reason) => {
    const {logger} = session.locals;
    logger.info({session, code, reason}, `session ${session.call_sid} closed`);
};

const onError = (session, err) => {
    const {logger} = session.locals;
    logger.info({err}, `session ${session.call_sid} received error`);
};

module.exports = service;
