import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canManageProjectMembers,
  canWriteProjectContent,
} from '../utils/permissions.js';

test('content write permissions allow project contributors', () => {
  for (const role of ['owner', 'admin', 'manager', 'developer']) {
    assert.equal(canWriteProjectContent(role), true);
  }
});

test('content write permissions block viewers and unknown roles', () => {
  for (const role of ['viewer', undefined, null, 'guest']) {
    assert.equal(canWriteProjectContent(role), false);
  }
});

test('member management permissions are restricted to elevated roles', () => {
  assert.equal(canManageProjectMembers('owner'), true);
  assert.equal(canManageProjectMembers('admin'), true);
  assert.equal(canManageProjectMembers('manager'), true);
  assert.equal(canManageProjectMembers('developer'), false);
  assert.equal(canManageProjectMembers('viewer'), false);
});
