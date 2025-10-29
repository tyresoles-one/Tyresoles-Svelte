import * as _ from 'lodash-es';
import { BASE_URL } from '$lib/system';

export const prepareEndpoints = (value: Record<string, any>): Record<string, any> =>
	iterateDeep(value);

const iterateDeep = (obj: Record<string, any>, parentKey: string = ''): Record<string, any> => {
	const newObj: Record<string, any> = {};
	_.forOwn(obj, (value, key) => {
		const newKey = parentKey ? `${parentKey}/${key}` : key;
		if (_.isObject(value) && !_.isArray(value)) {
			newObj[key] = iterateDeep(value, newKey);
		} else {
			newObj[key] = `${BASE_URL}${newKey}`;
		}
	});

	return newObj;
};
