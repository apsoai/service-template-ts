import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { getIdentityAttributes, getServiceName } from './service-metadata';

describe('service identity', () => {
  const cwd = process.cwd();
  const saved = { ...process.env };

  beforeEach(() => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'apsorc-'));
    fs.writeFileSync(
      path.join(dir, '.apsorc'),
      JSON.stringify({ serviceName: 'from-file', serviceId: '1', workspaceId: '9' }),
    );
    process.chdir(dir);
    for (const v of ['APP_NAME', 'APSO_SERVICE_ID', 'SERVICE_ID', 'APSO_WORKSPACE_ID', 'APSO_ENVIRONMENT', 'ENV']) {
      delete process.env[v];
    }
  });

  afterEach(() => {
    process.chdir(cwd);
    process.env = { ...saved };
  });

  it('reads name and ids from .apsorc', () => {
    expect(getServiceName()).toBe('from-file');
    expect(getIdentityAttributes()).toEqual({ 'apso.service.id': '1', 'apso.workspace.id': '9' });
  });

  it('lets deploy env override the file', () => {
    process.env.APSO_SERVICE_ID = '42';
    process.env.APSO_ENVIRONMENT = 'production';
    expect(getIdentityAttributes()).toEqual({
      'apso.service.id': '42',
      'apso.workspace.id': '9',
      'deployment.environment': 'production',
    });
  });
});
