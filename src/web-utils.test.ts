
import { canSendNotification } from './web-utils';

test('canSendNotification is a function', () => {
    expect(canSendNotification instanceof Function).toBe(true);
});

test('canSendNotification with rowPK undefined', () => {
    expect(canSendNotification({})).toBe(true);
});

test('canSendNotification case ({}, {})', () => {
    expect(canSendNotification({}, {})).toBe(true);
})

test('canSendNotification filterPK = {}, rowPK = Object', () => {
    expect(canSendNotification({}, { ID: 4 })).toBe(true);
});

test('canSendNotification filterPK, rowPK - positive case', () => {
    const filterPK = { ID: 4 };
    const rowPK = { ID: 4 };
    expect(canSendNotification(filterPK, rowPK)).toBe(true);
});

test('canSendNotification filterPK, rowPK - different IDs = false', () => {
    const filterPK = { ID: 5 };
    const rowPK = { ID: 4 };
    expect(canSendNotification(filterPK, rowPK)).toBe(false);
});

test('canSendNotification filterPK, rowPK - both values are null -> true', () => {
    const filterPK = { ID: null };
    const rowPK = { ID: null };
    expect(canSendNotification(filterPK, rowPK)).toBe(true);
});

test('canSendNotification filterPK, rowPK - both values are empty strings -> true', () => {
    const filterPK = { ID: '' };
    const rowPK = { ID: '' };
    expect(canSendNotification(filterPK, rowPK)).toBe(true);
});

test('canSendNotification filterPK, rowPK - both values are empty true -> true', () => {
    const filterPK = { ID: true };
    const rowPK = { ID: true };
    expect(canSendNotification(filterPK, rowPK)).toBe(true);
});

test('canSendNotification filterPK, rowPK containt different boolean values -> false', () => {
    const filterPK = { ID: false };
    const rowPK = { ID: true };
    expect(canSendNotification(filterPK, rowPK)).toBe(false);
});

test('canSendNotification filterPK, rowPK - both values are non-empty strings -> true', () => {
    const filterPK = { ID: 'string' };
    const rowPK = { ID: 'string' };
    expect(canSendNotification(filterPK, rowPK)).toBe(true);
});

test('canSendNotification filterPK has one key, rowPK has more than one key -> true', () => {
    const filterPK = { ID: 'string' };
    const rowPK = { ID: 'string', Key: 'something else' };
    expect(canSendNotification(filterPK, rowPK)).toBe(true);
});

test('canSendNotification filterPK and rowPK have more than one key -> true', () => {
    const filterPK = { ID: 'string', Key: 'something else' };
    const rowPK = { ID: 'string', Key: 'something else' };
    expect(canSendNotification(filterPK, rowPK)).toBe(true);
});

test('canSendNotification rowPK has one key, filterPK has more than one key -> false', () => {
    const rowPK = { ID: 'string' };
    const filterPK = { ID: 'string', Key: 'something else' };
    expect(canSendNotification(filterPK, rowPK)).toBe(false);
});
