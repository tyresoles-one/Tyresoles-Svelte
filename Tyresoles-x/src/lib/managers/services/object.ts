import type { TableColumn, InputProps } from '$lib/components';
import { keys, startCase, map, uniq, cloneDeep, sortBy, isNumber, mergeWith } from 'lodash-es';

export function pluckUnique(array: object[], key: string | undefined): object[] {
	return sortBy(uniq(map(array, key))).map((item) => ({ code: item }));
}

const specialChars = ['=', '<>', '>=', '<=', '>', '<', '$'];

export const extractColumns = (data: Array<object>): Array<TableColumn> => {
	const columns: Array<TableColumn> = [];
	if (data && data.length)
		return keys(data[0]).map((k: string) => ({ name: k, label: startCase(k) }));
	return columns;
};

export const updateArray = (
	data: Array<object>,
	value: object,
	originalData: Array<object> = []
) => {
	const index = data.indexOf(value);
	if (index === -1) {
		if (!originalData.length) return [...data, value];
		{
			const indexOriginal = originalData.indexOf(value);
			data.splice(indexOriginal, 0, value);
			return [...data];
		}
	} else {
		data.splice(index, 1);
		return [...data];
	}
};

export const getObjectValues = (obj: object, columns: string) => {
	let result = '';
	if (obj && columns) {
		const cols = String(columns).includes(',') ? String(columns).split(',') : [columns];
		if (typeof obj === 'object') {
			cols.forEach((col, index) => {
				result += Object(obj)[col];
				if (index !== cols.length - 1) result += ',';
			});
		}
	}
	return result;
};
export function extractSpecialChar(input: string) {
	for (const char of specialChars) {
		if (input.startsWith(char)) {
			return [char, input.slice(char.length)];
		}
	}

	return [null, input];
}
const conditionalFilter = (char: string | null, itemValue: any, newValue: string) => {
	if (char) {
		switch (char) {
			case '=': {
				if (typeof itemValue === 'string') {
					return String(itemValue).toLowerCase() === newValue.toLowerCase();
				}
				break;
			}
			case '<=': {
				return itemValue <= parseFloat(newValue);
				break;
			}
			case '<': {
				return itemValue < parseFloat(newValue);
				break;
			}
			case '>=': {
				return itemValue >= parseFloat(newValue);
				break;
			}
			case '>': {
				return itemValue > parseFloat(newValue);
				break;
			}
			case '<>': {
				if (typeof itemValue === 'number') {
					return itemValue !== parseFloat(newValue);
				}
				if (typeof itemValue === 'string') {
					return itemValue.toString().toLowerCase() !== newValue.toLowerCase();
				}
				break;
			}
			default:
				return itemValue.toString().toLowerCase().includes(newValue.toLowerCase());
		}
	}
};
export const filterMultiple = (
	data: Array<object>,
	filters: Array<{ column: string; value: any }>
): Array<object> => {
	if (!data || !filters || !filters.length) {
		return data;
	}

	return data.filter((item) => {
		return filters.every(({ column, value }) => {
			if (!column || !value) return true; //if no column or value, skip the filter

			const itemValue = Object(item)[column];
			const [char, newValue] = extractSpecialChar(value);

			if (!newValue) return true;

			if (char) {
				return conditionalFilter(char, itemValue, newValue);
			}
			return itemValue.toString().toLowerCase().includes(value.toLowerCase());
		});
	});
};
export const filter = (
	data: Array<object>,
	visibleColumns: string[],
	value: string
): Array<object> => {
	// If no data or value is provided, return the original data
	if (!data || !value) {
		return data;
	}

	const [char, newValue] = extractSpecialChar(value);

	// If no new value after extracting special characters, return the original data
	if (!newValue) return data;

	return data.filter((item) => {
		// Check each visible column for a match
		return visibleColumns.some((column) => {
			const itemValue = Object(item)[column];

			// Only proceed if the itemValue is defined
			if (itemValue !== undefined && itemValue !== null) {
				// If a special character is present, use conditional filtering
				if (char) {
					return conditionalFilter(char, itemValue, newValue);
				}
				// Otherwise, check for inclusion
				return itemValue.toString().toLowerCase().includes(newValue.toLowerCase());
			}
			return false; // If the column does not exist in the item
		});
	});
};
export const getSelectionForData = (
	data: Array<object>,
	values: string,
	columns: string
): Set<string> => {
	const selectedRows = new Set<string>();
	if (data && values && columns) {
		const valuesArray = values.split(',').map((value) => value.trim());
		data.forEach((row) => {
			const rowValue = getObjectValues(row, columns);
			if (valuesArray.includes(rowValue)) {
				selectedRows.add(rowValue);
			}
		});
	}
	return selectedRows;
};
export const getSelectionForDataArray = (
	data: Array<object>,
	selectedRows: Set<string>,
	columns: string
): Array<{ key: string; data: object }> => {
	const selectedData: Array<{ key: string; data: object }> = [];
	if (data && selectedRows && columns) {
		selectedRows.forEach((row) => {
			const selectedRow = data.find((item) => getObjectValues(item, columns) === row);
			if (selectedRow) selectedData.push({ key: row, data: selectedRow });
		});
	}
	return selectedData;
};
export function getVisibleColumnNames(visibleColumns: Set<TableColumn>): string[] {
	return Array.from(visibleColumns)
		.map((column) => column.name)
		.filter((name) => name !== undefined) as string[];
}
export const extractObjectKeyColumnName = (data: Array<object>) => {
	if (data && data.length) {
		const possibleKeys = ['code', 'no', 'id'];
		for (const key of possibleKeys) {
			if (data[0][key]) return key;
		}
	}
	return 'code';
};

export const calcAggregation = (
	data: Array<object>,
	column: string,
	aggregation: undefined | 'sum' | 'avg' | 'count'
) => {
	if (data && data.length > 0 && Object.keys(data[0]).includes(column)) {
		switch (aggregation) {
			case 'sum':
				return data.reduce((acc, item) => acc + item[column], 0);
			case 'count':
				return data.length;
			default:
				return '';
		}
	}
};

export const addOnAbsentInputField = (fields: Array<InputProps>, field: InputProps) => {
	if (fields && fields.length && field) {
		var idx = fields.findIndex((f) => f.name === field.name);
		if (idx === -1) {
			return [...fields, field];
		} else {
			fields[idx] = field;
			return [...fields];
		}
	} else {
		return [...fields];
	}
};

type AnyObject = Record<string, any>;

/**
 * Deeply sums numeric properties in an array of objects.
 * Non-numeric values are kept (from the first object).
 */
export function deepSumObjects<T extends AnyObject>(arr: T[]): T {
	if (!arr || arr.length === 0) return {} as T;

	// Custom merge function for _.mergeWith
	const customizer = (objValue: any, srcValue: any) => {
		if (isNumber(objValue) && isNumber(srcValue)) {
			return objValue + srcValue;
		}
		// Let lodash handle arrays/objects by default
	};

	// Start with a clone of the first object
	let result = cloneDeep(arr[0]);

	// Merge each subsequent object
	for (const item of arr.slice(1)) {
		result = mergeWith(result, item, customizer);
	}

	return result;
}

// export const filter = (data: Array<object>, column: string, value: string): Array<Object> => {
// 	const filtered: Array<object> = [];
// 	if (!data || !value) {
// 		return data;
// 	}

// 	const [char, newValue] = extractSpecialChar(value);

// 	if (!newValue) return data;

// 	return data.filter((item) => {
// 		if (column) {
// 			const itemValue = Object(item)[column];
// 			if (char) {
// 				return conditionalFilter(char, itemValue, newValue);
// 			}

// 			return itemValue.toString().toLowerCase().includes(value.toLowerCase());
// 		}
// 		return Object.values(item).some((itemValue) => {
// 			itemValue = itemValue ?? '';

// 			if (char) {
// 				return conditionalFilter(char, itemValue, newValue);
// 			}
// 			return itemValue.toString().toLowerCase().includes(value.toLowerCase());
// 		});
// 	});

// 	return filtered;
// };
