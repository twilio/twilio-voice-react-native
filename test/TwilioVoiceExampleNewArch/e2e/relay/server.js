// @ts-check

'use strict';

const ngrok = require('@ngrok/ngrok');
const axios = require('axios').default;
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

/** @type {Map<string, any[]>} */
const receivedMessages = new Map();

/**
 * @param {string} envVarKey
 * @returns {string}
 */
const getEnvVar = (envVarKey) => {
  const envVarVal = process.env[envVarKey];
  if (typeof envVarVal !== 'string' || envVarKey.length === 0) {
    throw new Error(`"${envVarKey}" env var not defined.`);
  }
  return envVarVal;
};

/**
 * @returns {{
 *    apiKeySid: string;
 *    apiKeySecret: string;
 *    accountSid: string;
 *    authToken: string;
 * }}
 */
const getEnvVars = () => {
  const apiKeySid = getEnvVar('API_KEY_SID');
  const apiKeySecret = getEnvVar('API_KEY_SECRET');
  const accountSid = getEnvVar('ACCOUNT_SID');
  const authToken = getEnvVar('AUTH_TOKEN');
  return { apiKeySid, apiKeySecret, accountSid, authToken };
};

/**
 * @typedef {(
 *   callSid: string,
 *   callbackUrl: string,
 * ) => Promise<import('axios').AxiosResponse>} CreateSubscription
 */

/**
 * @typedef {(
 *   callSid: string,
 * ) => Promise<import('axios').AxiosResponse>} SendMessage
 */

/**
 * @param {string} accountSid
 * @param {string} apiKeySid
 * @param {string} apiKeySecret
 */
const createTwilioUserDefinedMessageActions = (
  accountSid,
  apiKeySid,
  apiKeySecret,
) => {
  const baseUrl = 'https://api.twilio.com/2010-04-01';
  const extendedUrl = `${baseUrl}/Accounts/${accountSid}/Calls`;

  /**
   * @type {CreateSubscription}
   */
  const createSubscription = (callSid, callbackUrl) => {
    const url =
      `${extendedUrl}/${callSid}/UserDefinedMessageSubscriptions.json`;

    const params = new URLSearchParams();
    params.append('Method', 'POST');
    params.append('Callback', callbackUrl);

    return axios.post(url, params, {
      auth: {
        username: apiKeySid,
        password: apiKeySecret,
      },
    });
  };

  /**
   * @type {SendMessage}
   */
  const sendMessage = (callSid) => {
    const url =
      `${extendedUrl}/${callSid}/UserDefinedMessages.json`;

    const params = new URLSearchParams();
    params.append('Content', JSON.stringify({ message: 'ahoy, world!' }));

    return axios.post(url, params, {
      auth: {
        username: apiKeySid,
        password: apiKeySecret,
      },
    });
  };

  return { createSubscription, sendMessage };
}

/**
 * @param {string} authToken
 * @param {CreateSubscription} createSubscription
 * @param {SendMessage} sendMessage
 */
const createExpressApp = (authToken, createSubscription, sendMessage) => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.set('trust proxy', 1);

  app.post('/create-subscription', async (req, res) => {
    const { CallSid } = req.body;
    if (typeof CallSid !== 'string') {
      res.sendStatus(400);
      throw new Error('CallSid is not of type string');
    }
    const callbackUrl = `${app.listener.url()}/receive-message`;
    console.log('creating a subscription', { CallSid, callbackUrl });

    const subscription = await createSubscription(CallSid, callbackUrl);
    console.log(subscription.data);

    res.json(subscription.data);
  });

  app.post('/receive-message', (req, res) => {
    const isValidTwilioRequest = twilio.validateExpressRequest(req, authToken);
    if (!isValidTwilioRequest) {
      res.sendStatus(400);
      console.warn('Incoming request is not from Twliio');
      return;
    }

    console.log('received message', req.body);

    const { CallSid } = req.body;
    if (typeof CallSid !== 'string') {
      res.sendStatus(400);
      throw new Error('CallSid is not of type string');
    }

    const existingMessages = receivedMessages.get(CallSid) || [];
    receivedMessages.set(CallSid, [...existingMessages, req.body]);

    res.sendStatus(200);
  });

  app.get('/get-received-messages/:CallSid', (req, res) => {
    console.log('sending received messages', req.params);

    const { CallSid } = req.params;
    if (typeof CallSid !== 'string') {
      res.sendStatus(400);
      throw new Error('CallSid is not of type string');
    }

    res.setHeader("Cache-Control", "no-cache");
    res.json(receivedMessages.get(CallSid));
  });

  app.post('/send-message', async (req, res) => {
    const { CallSid } = req.body;
    if (typeof CallSid !== 'string') {
      res.sendStatus(400);
      throw new Error('CallSid is not of type string');
    }

    const sendMessageResponse = await sendMessage(CallSid);
    console.log('sent message', sendMessageResponse.data);

    res.json(sendMessageResponse.data);
  });

  return app;
};

const start = async () => {
  const envVars = getEnvVars();

  const { createSubscription, sendMessage } =
    createTwilioUserDefinedMessageActions(
      envVars.accountSid,
      envVars.apiKeySid,
      envVars.apiKeySecret,
    );

  const app = createExpressApp(
    envVars.authToken,
    createSubscription,
    sendMessage,
  );

  await ngrok.listen(app);

  console.log(`listening on ${app.listener.url()}`);

  app.listen(4040, () => {
    console.log('listening on 4040');
  });
};

start();
