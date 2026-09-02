import { validateIceServers } from '../utility/IceOptions';
import type { IceServer } from '../type/Ice';

/**
 * `validateIceServers` is the only enforcement of the ice server shape. The
 * `IceServer` type describes every member as optional, so a shape that this
 * validator rejects still type checks. These cases pin the validator's
 * behavior for that reason.
 */
describe('validateIceServers', () => {
  it('accepts an ice server with only a server url', () => {
    const iceServer: IceServer = { serverUrl: 'mock-server-url' };
    expect(validateIceServers([iceServer]).status).toBe('ok');
  });

  it('accepts an ice server with a server url and both credentials', () => {
    const iceServer: IceServer = {
      serverUrl: 'mock-server-url',
      username: 'mock-username',
      password: 'mock-password',
    };
    expect(validateIceServers([iceServer]).status).toBe('ok');
  });

  it('rejects an ice server with no server url', () => {
    const iceServer: IceServer = { username: 'mock-username' };
    expect(validateIceServers([iceServer]).status).toBe('error');
  });

  it('rejects an ice server with credentials but no server url', () => {
    const iceServer: IceServer = {
      username: 'mock-username',
      password: 'mock-password',
    };
    expect(validateIceServers([iceServer]).status).toBe('error');
  });

  it('rejects an empty ice server', () => {
    const iceServer: IceServer = {};
    expect(validateIceServers([iceServer]).status).toBe('error');
  });

  it('rejects an ice server with a username but no password', () => {
    const iceServer: IceServer = {
      serverUrl: 'mock-server-url',
      username: 'mock-username',
    };
    expect(validateIceServers([iceServer]).status).toBe('error');
  });

  it('rejects an ice server with a password but no username', () => {
    const iceServer: IceServer = {
      serverUrl: 'mock-server-url',
      password: 'mock-password',
    };
    expect(validateIceServers([iceServer]).status).toBe('error');
  });
});
