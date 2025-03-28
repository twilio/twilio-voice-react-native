import type { EventLogItem } from '../../src/type';

export const getLog = async (): Promise<Array<EventLogItem>> => {
  const eventLogAttr = await element(by.id('event_log')).getAttributes();
  if (!('label' in eventLogAttr) || !eventLogAttr.label) {
    throw new Error('cannot parse event log label');
  }

  const log: string = eventLogAttr.label;

  return JSON.parse(log);
};

export const pollValidateLog = async (
  validator: (log: Array<EventLogItem>) => boolean,
  loops: number = 5,
) => {
  let wasValid = false;
  for (let i = 0; i < loops; i++) {
    const log = await getLog();
    if (validator(log)) {
      wasValid = true;
      break;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  return wasValid;
};

export const getRegExpMatch = async (regExp: RegExp) => {
  let log = await getLog();
  let regExpMatchGroup;
  for (const entry of [...log].reverse()) {
    const m = entry.content.match(regExp);
    if (m) {
      regExpMatchGroup = m[1];
      break;
    }
  }
  return regExpMatchGroup;
};
