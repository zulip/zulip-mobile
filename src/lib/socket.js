type Config = {
  apiUrl: string,
  apiKey: string,
  client: string,
};

export default class Socket {

  config: Config;

  constructor(initialConfig: Config) {
    this.config = initialConfig;

    this.connect();
  }

  connect = () => {
    try {
      this.socket = new WebSocket(this.config.apiUrl);
    } catch (err) {
      // swallow connection error, we can't do anything about it
    } finally {
      this.socket.onopen = this.handleOpen;
      this.socket.onclose = () => this.connect();
      this.socket.onmessage = this.handleMessage;
    }
  }

  disconnect = (): void => {
    this.socket.onclose = () => {};
    this.socket.close();
  }

  isReady = (): boolean =>
    !!this.socket && this.socket.readyState === 1;

  handleOpen = () => {};

  handleMessage = () => {};

  send = (obj: Object) =>
    JSON.stringify([obj]);

  getNewId = () =>
    `${Math.trunc(Date.now() / 1000)}:19:1`;

  auth = () => {
    this.send({
      req_id: '1477821609:19:0',
      type: 'auth',
      request: {
        csrf_token: 'qSUPOTlsAQXJ3WzFqPmeryUmPAFOnlBI',
        queue_id: '1477821609:19',
        status_inquiries: [],
      },
    });
  }

  privateMessage = (content, recipient) => {
    this.message({
      type: 'private',
      content,
      stream: '',
      private_message_recipient: recipient,
    });
  }

  streamMessage = (content, stream) => {
    this.message({
      type: 'stream',
      content,
      stream,
      private_message_recipient: '',
    });
  }

  message = ({ content, type, stream, private_message_recipient }) => {
    const { client } = this.config;
    this.send({
      req_id: this.getNewId(),
      type: 'request',
      request: {
        client,
        type,
        subject: '(no topic)', //     subject: 'feedback',
        stream,
        private_message_recipient: 'bobtester@mailinator.com',
        content,
        sender_id: 284, // ???
        queue_id: '1477821609:19', // ???
        to: ['bobtester@mailinator.com'], //     to: ['redesign'],
        reply_to: 'bobtester@mailinator.com', // not included
        local_id: 47466.01, // ???
      },
    });
  }
}
