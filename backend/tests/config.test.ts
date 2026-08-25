import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseConfig } from '../src/config/env';

describe('Environment Configuration', () => {
  it('should load default configuration when environment variables are unset', () => {
    const config = parseConfig({});

    assert.strictEqual(config.port, 3000);
    assert.strictEqual(config.nodeEnv, 'development');
    assert.strictEqual(config.isProduction, false);
    assert.strictEqual(config.isTest, false);
    assert.strictEqual(config.publicBackendOrigin, 'http://localhost:3000');
    assert.strictEqual(config.sessionSecret, 'dev_session_secret_goldenhour_local_only');
    assert.strictEqual(config.openaiApiKey, undefined);
    assert.strictEqual(config.openaiModel, 'gpt-4o');
  });

  it('should parse custom environment variables accurately', () => {
    const config = parseConfig({
      PORT: '8080',
      NODE_ENV: 'test',
      PUBLIC_BACKEND_ORIGIN: 'https://goldenhour.example.com',
      SESSION_SECRET: 'super-secure-custom-session-secret-key-12345',
      OPENAI_API_KEY: 'sk-test-real-key-123',
      OPENAI_MODEL: 'gpt-4-turbo',
    });

    assert.strictEqual(config.port, 8080);
    assert.strictEqual(config.nodeEnv, 'test');
    assert.strictEqual(config.isTest, true);
    assert.strictEqual(config.isProduction, false);
    assert.strictEqual(config.publicBackendOrigin, 'https://goldenhour.example.com');
    assert.strictEqual(config.sessionSecret, 'super-secure-custom-session-secret-key-12345');
    assert.strictEqual(config.openaiApiKey, 'sk-test-real-key-123');
    assert.strictEqual(config.openaiModel, 'gpt-4-turbo');
  });

  it('should treat placeholder OpenAI key "replace_me" as undefined', () => {
    const config = parseConfig({
      OPENAI_API_KEY: 'replace_me',
    });

    assert.strictEqual(config.openaiApiKey, undefined);
  });

  it('should throw an error if PORT is invalid', () => {
    assert.throws(() => parseConfig({ PORT: 'invalid-port' }), /Configuration validation error/);
    assert.throws(() => parseConfig({ PORT: '99999' }), /Configuration validation error/);
    assert.throws(() => parseConfig({ PORT: '-1' }), /Configuration validation error/);
  });

  it('should throw an error in production if SESSION_SECRET is insecure or default', () => {
    assert.throws(
      () =>
        parseConfig({
          NODE_ENV: 'production',
          SESSION_SECRET: 'short',
        }),
      /SESSION_SECRET must be set to a secure string/
    );

    assert.throws(
      () =>
        parseConfig({
          NODE_ENV: 'production',
          SESSION_SECRET: 'replace_me_with_a_long_random_string',
        }),
      /SESSION_SECRET must be set to a secure string/
    );
  });
});
