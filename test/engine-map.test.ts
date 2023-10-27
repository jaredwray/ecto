import {EngineMap} from '../src/engine-map.js';

test('EngineMap - Default Name should be Blank', () => {
	const mappings = new EngineMap();
	expect(mappings.get('ejs')).toBe(undefined);
});

test('EngineMap - set with extensions', () => {
	const mappings = new EngineMap();
	mappings.set('ejs', ['ejs']);
	expect(mappings.get('ejs')?.toString()).toBe('ejs');
});

test('EngineMap - set with multiple extensions', () => {
	const mappings = new EngineMap();
	mappings.set('ejs', ['ejs', 'md', 'njk']);
	expect(mappings.get('ejs')?.length).toBe(3);
});

test('EngineMap - set with no extensions should be undefined', () => {
	const mappings = new EngineMap();
	mappings.set('ejs', []);
	expect(mappings.get('ejs')?.length).toBe(undefined);
});

test('EngineMap - set with no extensions should be undefined', () => {
	const mappings = new EngineMap();
	mappings.set('', ['md']);
	expect(mappings.get('')?.length).toBe(undefined);
});

test('EngineMap - delete with extensions', () => {
	const mappings = new EngineMap();
	mappings.set('ejs', ['ejs']);
	mappings.set('markdown', ['md']);
	expect(mappings.get('ejs')?.toString()).toBe('ejs');
	mappings.delete('ejs');
	expect(mappings.get('ejs')?.toString()).toBe(undefined);
	expect(mappings.get('markdown')?.toString()).toBe('md');
});

test('EngineMap - deleteExtension with extensions', () => {
	const mappings = new EngineMap();
	mappings.set('ejs', ['ejs', 'md', 'njk']);
	expect(mappings.get('ejs')?.length).toBe(3);
	mappings.deleteExtension('ejs', 'njk');
	expect(mappings.get('ejs')?.toString()).toBe('ejs,md');
});

test('EngineMap - getName with extensions', () => {
	const mappings = new EngineMap();
	mappings.set('ejs', ['ejs', 'md', 'njk']);
	expect(mappings.getName('md')).toBe('ejs');
});

test('EngineMap - getName with bad extensions', () => {
	const mappings = new EngineMap();
	mappings.set('ejs', ['ejs', 'md', 'njk']);
	expect(mappings.getName('md1')).toBe(undefined);
});

