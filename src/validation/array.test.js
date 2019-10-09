import v from 'validate.js';
import {addArray} from './array';
import {setValidateJS, transform} from '../validation';

setValidateJS(v);

addArray(v, transform);

describe('Validation - Array', () => {

	it('throws error when plain or object is missing', () => {
		expect.assertions(1);

		try {
			v({}, {
				prop_a: {
					array: {},
				},
			});
		} catch (e) {
			expect(e.message).toBe('Plain or Object option is missing');
		}
	});

	it('throws error when plain and object are specified', () => {
		expect.assertions(1);

		try {
			v({}, {
				prop_a: {
					array: {
						plain: {},
						object: {},
					},
				},
			});
		} catch (e) {
			expect(e.message).toBe('Plain and Object can\'t both be specified');
		}
	});

	it('checks the exact length if it is specified', () => {

		const errors = v({prop_a: []}, {
			prop_a: {
				array: {
					length: { is: 1 },
					plain: {},
				},
			},
		});

		expect(errors).toEqual({
			prop_a: ['does not have 1 element'],
		});
	});

	it('uses elementName when specified', () => {

		const errors = v({prop_a: []}, {
			prop_a: {
				array: {
					elementName: 'Q',
					length: { is: 1 },
					plain: {},
				},
			},
		});

		expect(errors).toEqual({
			prop_a: ['does not have 1 Q'],
		});
	});

	it('uses elementName when specified and pluralises it', () => {

		const errors = v({prop_a: []}, {
			prop_a: {
				array: {
					elementName: 'Z',
					length: { is: 2 },
					plain: {},
				},
			},
		});

		expect(errors).toEqual({
			prop_a: ['does not have 2 Zs'],
		});
	});

	it('checks the min length if it is specified', () => {

		const errors = v({prop_a: []}, {
			prop_a: {
				array: {
					length: { min: 1 },
					plain: {},
				},
			},
		});

		expect(errors).toEqual({
			prop_a: ['does not have at least 1 element'],
		});
	});

	it('checks the length when value is null', () => {

		const errors = v({prop_a: null}, {
			prop_a: {
				array: {
					length: { min: 1 },
					plain: {},
				},
			},
		});

		expect(errors).toEqual({
			prop_a: ['does not have at least 1 element'],
		});
	});

	it('checks the length when value is an empty string', () => {

		const errors = v({prop_a: ''}, {
			prop_a: {
				array: {
					length: { min: 1 },
					plain: {},
				},
			},
		});

		expect(errors).toEqual({
			prop_a: ['does not have at least 1 element'],
		});
	});

	it('checks the max length if it is specified', () => {

		const errors = v({prop_a: [1, 2]}, {
			prop_a: {
				array: {
					length: { max: 1 },
					plain: {},
				},
			},
		});

		expect(errors).toEqual({
			prop_a: ['has more than 1 element'],
		});
	});

	it('checks length while honouring preserveEmptyElements', () => {

		const errors = v({prop_a: [null]}, {
			prop_a: {
				array: {
					length: { is: 1 },
					preserveEmptyElements: true,
					plain: {},
				},
			},
		});

		expect(errors).toBeFalsy();
	});


	it('returns an error if value is not an array', () => {

		const errors = v({prop_a: 'z'}, {
			prop_a: {
				array: {
					plain: {
						presence: true,
					},
				},
			},
		});

		expect(errors).toEqual({
			prop_a: ['is not an array'],
		});
	});

	it('uses isElementEmpty when specified', () => {

		const errors = v({prop_a: [1]}, {
			prop_a: {
				array: {
					length: { min: 1 },
					plain: {},
					isElementEmpty: el => 1/0 && el === 1,
				},
			},
		});

		expect(errors).toEqual({
			prop_a: ['does not have at least 1 element'],
		});
	});

	describe('Plain value', () => {

		it('can validate', () => {

			const errors = v({prop_a: ['a']}, {
				prop_a: {
					array: {
						plain: {
							presence: true,
						},
					},
				},
			});

			expect(errors).toBeFalsy();
		});

		it('can handle null value', () => {

			const errors = v({prop_a: null}, {
				prop_a: {
					array: {
						plain: {
						},
					},
				},
			});

			expect(errors).toBeFalsy();
		});

		it('returns an error if an element is failing validation', () => {

			const errors = v({prop_a: ['b']}, {
				prop_a: {
					array: {
						plain: {
							inclusion: ['c'],
						},
					},
				},
			});

			expect(errors).toEqual({
				"prop_a[0]": ['b is not included in the list'],
			});
		});

		it('returns multiple errors if multiple elements are failing validation', () => {

			const errors = v({prop_a: ['bc', 'c', 'd']}, {
				prop_a: {
					array: {
						plain: {
							presence: true,
							inclusion: ['c'],
						},
					},
				},
			});

			expect(errors).toEqual({
				"prop_a[0]": ['bc is not included in the list'],
				"prop_a[2]": ['d is not included in the list'],
			});
		});

		it('returns an error if an empty element is failing validation when preserveEmptyElements = true', () => {

			const errors = v({prop_a: ['b', null]}, {
				prop_a: {
					array: {
						preserveEmptyElements: true,
						plain: {
							presence: true,
						},
					},
				},
			});

			expect(errors).toEqual({
				"prop_a[1]": ['can\'t be blank'],
			});
		});

		it('ignore empty values by default', () => {

			const errors = v({prop_a: ['b', null]}, {
				prop_a: {
					array: {
						preserveEmptyElements: false,
						plain: {
							presence: true,
						},
					},
				},
			});

			expect(errors).toBeFalsy();
		});

	});

	describe('Object value', () => {

		it('can validate', () => {

			const errors = v({prop_o: [{a: 'b'}]}, {
				prop_o: {
					array: {
						object: {
							a: {
								presence: true,
							},
						},
					},
				},
			});

			expect(errors).toBeFalsy();
		});

		it('ignores empty objects by default', () => {

			const errors = v({prop_o: [{a: 'b'}, {}]}, {
				prop_o: {
					array: {
						object: {
							a: {
								presence: true,
							},
						},
						length: {is: 1},
					},
				},
			});

			expect(errors).toBeFalsy();
		});

		it('returns an error if an empty object is failing validation when preserveEmptyElements = true', () => {

			const errors = v({prop_o: [{a: 'b'}, {}]}, {
				prop_o: {
					array: {
						preserveEmptyElements: true,
						object: {
							a: {
								presence: true,
							},
						},
						length: {is: 2},
					},
				},
			});

			expect(errors).toEqual({
				"prop_o[1].a": ['can\'t be blank'],
			});
		});

		it('can handle a null value', () => {

			const errors = v({prop_o: null}, {
				prop_o: {
					array: {
						object: {
						},
					},
				},
			});

			expect(errors).toBeFalsy();
		});

		it('returns an error if an element is failing validation', () => {

			const errors = v({prop_o: [{a: null}]}, {
				prop_o: {
					array: {
						object: {
							a: {
								presence: true,
							},
						},
					},
				},
			});

			expect(errors).toEqual({
				"prop_o[0].a": ['can\'t be blank'],
			});
		});

		it('returns multiple errors if multiple properties of an element are failing validation', () => {

			const errors = v({prop_o: [{a: null, b: null}]}, {
				prop_o: {
					array: {
						object: {
							a: {
								presence: true,
							},
							b: {
								presence: true,
							},
						},
					},
				},
			});

			expect(errors).toEqual({
				"prop_o[0].a": ['can\'t be blank'],
				"prop_o[0].b": ['can\'t be blank'],
			});
		});

		it('returns multiple errors if multiple elements are failing validation', () => {

			const errors = v({prop_o: [{a: ''}, {a: 'a'}]}, {
				prop_o: {
					array: {
						object: {
							a: {
								// presence: true,
								length: {is: 2},
								inclusion: ['a'],
							},
						},
					},
				},
			});

			expect(errors).toEqual({
				"prop_o[0].a": ['is the wrong length (should be 2 characters)', ' is not included in the list'],
				"prop_o[1].a": ['is the wrong length (should be 2 characters)'],
			});
		});

	});

	describe('Transform', () => {

		it('returns null for null', () => {

			const result = v.validators.array.transform(null);

			expect(result).toBe(null);
		});

		it('returns null for undefined', () => {

			const result = v.validators.array.transform(undefined);

			expect(result).toBe(null);
		});

		it('returns null for empty string', () => {

			const result = v.validators.array.transform('');

			expect(result).toBe(null);
		});

		it('returns empty array for empty array', () => {

			const result = v.validators.array.transform([]);

			expect(result).toEqual([]);
		});

		it('returns empty array for empty values when returnArrayForEmpty = true', () => {

			const result = v.validators.array.transform(null, {returnArrayForEmpty: true});

			expect(result).toEqual([]);
		});

		it('transforms values for plain array', () => {

			v.validators.dummy = () => {};
			v.validators.dummy.transform = () => 'z';

			const result = v.validators.array.transform(['1'], {plain: {dummy: true}});

			expect(result).toEqual(['z']);
		});

		it('transforms values for object array', () => {

			v.validators.dummy = () => {};
			v.validators.dummy.transform = () => 'z';

			const result = v.validators.array.transform([{a: 1}], {object: {a: {dummy: true}}});

			expect(result).toEqual([{a: 'z'}]);
		});

		it('removes null values in object array by default', () => {

			const result = v.validators.array.transform([null], {object: {a: {}}});

			expect(result).toEqual([]);
		});

		it('keeps null values for object array when preserveEmptyElements = true', () => {

			const result = v.validators.array.transform([null], {preserveEmptyElements: true, object: {a: {}}});

			expect(result).toEqual([null]);
		});

		it('removes null values in plain array by default', () => {

			const result = v.validators.array.transform([null], {plain: {}});

			expect(result).toEqual([]);
		});

		it('uses isElementEmpty to check element emptiness', () => {

			const result = v.validators.array.transform([1], {plain: {}, isElementEmpty: el => el === 1});

			expect(result).toEqual([]);
		});

		it('keeps null values for plain array when preserveEmptyElements = true', () => {

			const result = v.validators.array.transform([null], {preserveEmptyElements: true, plain: {}});

			expect(result).toEqual([null]);
		});

	});

});
