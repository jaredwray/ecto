import {expect, it} from 'vitest';
import {BaseEngine} from '../src/base-engine.js';

it('BaseEngine - Default Name should be Blank', () => {
	const be = new BaseEngine();
	expect(be.names.toString()).toBe('');
});

it('BaseEngine - Default Name should be Foo', () => {
	const be = new BaseEngine();
	be.names = ['foo'];
	expect(be.names.toString()).toBe('foo');
});

it('BaseEngine - Opts should be undefined', () => {
	const be = new BaseEngine();
	expect(be.opts).toBe(undefined);
});

it('BaseEngine - Opts should Have Data', () => {
	const be = new BaseEngine();
	const options = {isValid: true};
	be.opts = options;
	expect(be.opts).toBe(options);
});

it('BaseEngine - getExtensions should be 0', () => {
	const be = new BaseEngine();
	expect(be.getExtensions().length).toBe(0);
});

it('BaseEngine - setExtensions should be 2', () => {
	const be = new BaseEngine();
	be.setExtensions(['md', 'markdown']);
	expect(be.getExtensions().length).toBe(2);
});

it('BaseEngine - setExtensions should be 2 with duplicate', () => {
	const be = new BaseEngine();
	be.setExtensions(['md', 'markdown', 'markdown']);
	expect(be.getExtensions().length).toBe(2);
});

it('BaseEngine - deleteExtension should be 1', () => {
	const be = new BaseEngine();
	be.setExtensions(['md', 'markdown']);
	expect(be.getExtensions().length).toBe(2);
	be.deleteExtension('md');
	expect(be.getExtensions().length).toBe(1);
});

it('BaseEngine - deleteExtension should be 1 with case', () => {
	const be = new BaseEngine();
	be.setExtensions(['md', 'markdown']);
	expect(be.getExtensions().length).toBe(2);
	be.deleteExtension('Md ');
	expect(be.getExtensions().length).toBe(1);
});

