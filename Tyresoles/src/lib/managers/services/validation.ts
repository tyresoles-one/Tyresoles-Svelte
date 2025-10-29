import type { InputProps } from '$lib/components/custom/types';

export type Rule<T> = (value: T, fieldName?: string) => string | null;

export interface Schema<T> {
	[key: string]: Rule<T>[];
}

export const required =
	<T>(fieldName: string) =>
	(value: T): string | null =>
		value ? null : `${fieldName} is required.`;
export const minLength =
	(min: number) =>
	(value: string): string | null =>
		value.length >= min ? null : `Minimum length is ${min}.`;
export const maxLength =
	(max: number) =>
	(value: string): string | null =>
		value.length <= max ? null : `Maximum length is ${max}.`;
export const withinRange =
	(min: number, max: number) =>
	(value: unknown): string | null =>
		Number.parseFloat(value as string) >= min && Number.parseFloat(value as string) <= max ? null : `Value must be between ${min} and ${max}.`;	

export const pattern =
	(regex: RegExp) =>
	(value: string): string | null =>
		regex.test(value) ? null : 'Invalid format.';

export const email = (value: string): string | null =>
	/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Invalid email address.';

export const mobileNo =
<T>() =>
	(value: T): string | null =>
		/^(?:\+91|0)?[6-9]\d{9}$/.test(value as string) ? null : 'Invalid mobile number.';

export const vehicleNo =
<T>() =>
	(value: T): string | null =>
		/^[A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{1,2}\s?[0-9]{4}$/.test(value as string) ? null : 'Invalid vehicle number.';

export interface ValidationResult {
	[key: string]: string[];
}

export function validate<T>(obj: { [key: string]: T }, schema: Schema<T>): ValidationResult {
	const errors: ValidationResult = {};
	for (const key in schema) {
		errors[key] = [];
		for (const rule of schema[key]) {
			const error = rule(obj[key], key);
			if (error) {
				errors[key].push(error);
			}
		}
	}
	return errors;
}

export function buildSchema(fields: Array<InputProps>): Schema<unknown> {	
	const schema: Schema<unknown> = {};

	for (const field of fields) {
		if (field.name && field.rules) {
			// Only add rules if they are defined for the field
			schema[field.name] = field.rules as Rule<unknown>[]; // Casting to Rule type
		}
	}

	return schema;
}

export const prepareValidationResult = (obj: Record<string, unknown>): ValidationResult => {
	if (!obj) return {};
	const result: ValidationResult = {};
	for (const key in obj) {
		result[key] = [];
	}
	return result;
};
