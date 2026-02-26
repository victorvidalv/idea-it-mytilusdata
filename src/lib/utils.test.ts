import { describe, it, expect } from 'vitest';
import {
	cn,
	type WithoutChild,
	type WithoutChildren,
	type WithoutChildrenOrChild,
	type WithElementRef
} from './utils';

describe('utils module', () => {
	describe('cn function', () => {
		describe('Casos normales/exitosos', () => {
			it('should combine multiple class strings', () => {
				const result = cn('class1', 'class2', 'class3');
				expect(result).toBe('class1 class2 class3');
			});

			it('should handle single class string', () => {
				const result = cn('single-class');
				expect(result).toBe('single-class');
			});

			it('should merge tailwind classes correctly (last one wins)', () => {
				// twMerge should keep the last conflicting class
				const result = cn('p-4', 'p-8');
				expect(result).toBe('p-8');
			});

			it('should handle conditional classes with objects', () => {
				const result = cn('base', { active: true, disabled: false });
				expect(result).toBe('base active');
			});

			it('should handle array of classes', () => {
				const result = cn(['class1', 'class2'], 'class3');
				expect(result).toContain('class1');
				expect(result).toContain('class2');
				expect(result).toContain('class3');
			});

			it('should combine objects, arrays and strings', () => {
				const result = cn('base', ['arr1', 'arr2'], { obj1: true, obj2: false });
				expect(result).toContain('base');
				expect(result).toContain('arr1');
				expect(result).toContain('arr2');
				expect(result).toContain('obj1');
				expect(result).not.toContain('obj2');
			});
		});

		describe('Casos borde', () => {
			it('should return empty string when no arguments provided', () => {
				const result = cn();
				expect(result).toBe('');
			});

			it('should handle undefined values', () => {
				const result = cn('class1', undefined, 'class2');
				expect(result).toBe('class1 class2');
			});

			it('should handle null values', () => {
				const result = cn('class1', null, 'class2');
				expect(result).toBe('class1 class2');
			});

			it('should handle empty strings', () => {
				const result = cn('', 'class1', '');
				expect(result).toBe('class1');
			});

			it('should handle empty objects', () => {
				const result = cn('class1', {});
				expect(result).toBe('class1');
			});

			it('should handle empty arrays', () => {
				const result = cn('class1', []);
				expect(result).toBe('class1');
			});

			it('should handle all falsy values', () => {
				const result = cn(null, undefined, '', false, {});
				expect(result).toBe('');
			});

			it('should handle nested arrays', () => {
				const result = cn(['nested', ['deep']]);
				expect(result).toContain('nested');
			});
		});

		describe('Manejo de errores', () => {
			it('should not throw with mixed types of arguments', () => {
				expect(() => cn('string', 123 as unknown as string, { obj: true })).not.toThrow();
			});
		});

		describe('Tailwind merge behavior', () => {
			it('should merge conflicting padding classes', () => {
				expect(cn('p-2', 'p-4')).toBe('p-4');
				expect(cn('px-2', 'px-4')).toBe('px-4');
				expect(cn('pt-2', 'pt-4')).toBe('pt-4');
			});

			it('should merge conflicting margin classes', () => {
				expect(cn('m-2', 'm-4')).toBe('m-4');
				expect(cn('mx-2', 'mx-4')).toBe('mx-4');
				expect(cn('mt-2', 'mt-4')).toBe('mt-4');
			});

			it('should merge conflicting display classes', () => {
				expect(cn('block', 'flex')).toBe('flex');
				expect(cn('hidden', 'block')).toBe('block');
			});

			it('should merge conflicting text classes', () => {
				expect(cn('text-sm', 'text-lg')).toBe('text-lg');
				expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
			});

			it('should merge conflicting background classes', () => {
				expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
			});

			it('should keep non-conflicting classes', () => {
				const result = cn('p-4', 'm-2', 'text-lg', 'bg-blue-500');
				expect(result).toContain('p-4');
				expect(result).toContain('m-2');
				expect(result).toContain('text-lg');
				expect(result).toContain('bg-blue-500');
			});

			it('should handle responsive prefixes correctly', () => {
				const result = cn('md:p-4', 'lg:p-8');
				expect(result).toContain('md:p-4');
				expect(result).toContain('lg:p-8');
			});

			it('should handle hover/focus/active states', () => {
				const result = cn('hover:bg-red-500', 'hover:bg-blue-500');
				expect(result).toBe('hover:bg-blue-500');
			});
		});
	});

	describe('TypeScript Types', () => {
		describe('WithoutChild type', () => {
			it('should be defined and usable', () => {
				// Type test - verify the type exists and can be used
				type TestType = { child?: string; other: number };
				type Result = WithoutChild<TestType>;

				// Runtime verification that the type is exported
				const test: Result = { other: 42 };
				expect(test.other).toBe(42);
			});

			it('should return original type when child does not exist', () => {
				type TestType = { value: string };
				type Result = WithoutChild<TestType>;

				const test: Result = { value: 'test' };
				expect(test.value).toBe('test');
			});
		});

		describe('WithoutChildren type', () => {
			it('should be defined and usable', () => {
				type TestType = { children?: string; other: number };
				type Result = WithoutChildren<TestType>;

				const test: Result = { other: 42 };
				expect(test.other).toBe(42);
			});

			it('should return original type when children does not exist', () => {
				type TestType = { value: string };
				type Result = WithoutChildren<TestType>;

				const test: Result = { value: 'test' };
				expect(test.value).toBe('test');
			});
		});

		describe('WithoutChildrenOrChild type', () => {
			it('should be defined and usable', () => {
				type TestType = { children?: string; child?: number; other: boolean };
				type Result = WithoutChildrenOrChild<TestType>;

				const test: Result = { other: true };
				expect(test.other).toBe(true);
			});
		});

		describe('WithElementRef type', () => {
			it('should be defined and usable', () => {
				type TestProps = { value: string };
				type Result = WithElementRef<TestProps>;

				const test: Result = { value: 'test', ref: null };
				expect(test.value).toBe('test');
				expect(test.ref).toBeNull();
			});

			it('should accept HTML element ref', () => {
				type TestProps = { value: string };
				type Result = WithElementRef<TestProps, HTMLInputElement>;

				const mockRef = { current: null };
				const test: Result = { value: 'test', ref: mockRef as unknown as HTMLInputElement };
				expect(test.value).toBe('test');
			});

			it('should work with undefined ref', () => {
				type TestProps = { count: number };
				type Result = WithElementRef<TestProps>;

				const test: Result = { count: 5 };
				expect(test.count).toBe(5);
				expect(test.ref).toBeUndefined();
			});
		});
	});
});
