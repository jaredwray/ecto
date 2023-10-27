import {BaseEngine} from '../src/baseEngine';

test('BaseEngine - Default Name should be Blank', () => {
	const be = new BaseEngine();
	expect(be.names.toString()).toBe('');
});

test('BaseEngine - Default Name should be Foo', () => {
	const be = new BaseEngine();
	be.names = ['foo'];
	expect(be.names.toString()).toBe('foo');
});

test('BaseEngine - Opts should be undefined', () => {
	const be = new BaseEngine();
	expect(be.opts).toBe(undefined);
});

test('BaseEngine - Opts should Have Data', () => {
	const be = new BaseEngine();
	const options = {isValid: true};
	be.opts = options;
	expect(be.opts).toBe(options);
});

test('BaseEngine - getExtensions should be 0', () => {
	const be = new BaseEngine();
	expect(be.getExtensions().length).toBe(0);
});

test('BaseEngine - setExtensions should be 2', () => {
	const be = new BaseEngine();
	be.setExtensions(['md', 'markdown']);
	expect(be.getExtensions().length).toBe(2);
});

test('BaseEngine - setExtensions should be 2 with duplicate', () => {
	const be = new BaseEngine();
	be.setExtensions(['md', 'markdown', 'markdown']);
	expect(be.getExtensions().length).toBe(2);
});

test('BaseEngine - deleteExtension should be 1', () => {
	const be = new BaseEngine();
	be.setExtensions(['md', 'markdown']);
	expect(be.getExtensions().length).toBe(2);
	be.deleteExtension('md');
	expect(be.getExtensions().length).toBe(1);
});

test('BaseEngine - deleteExtension should be 1 with case', () => {
	const be = new BaseEngine();
	be.setExtensions(['md', 'markdown']);
	expect(be.getExtensions().length).toBe(2);
	be.deleteExtension('Md ');
	expect(be.getExtensions().length).toBe(1);
});

