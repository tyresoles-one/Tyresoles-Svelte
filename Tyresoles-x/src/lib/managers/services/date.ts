import { parseDate, type DateValue, parseAbsoluteToLocal } from '@internationalized/date';
import { DATE_FORMAT } from '$lib/system';
import dayjs from 'dayjs';

export const parseStringToDateValue = (value: string): DateValue => {
	return parseAbsoluteToLocal(dayjs(value, DATE_FORMAT).toISOString());
};
export const parseDateToDateValue = (value: Date): DateValue => {
	return parseDate(value.toISOString());
};
export const parseDateValue = (value: Date | string): DateValue | DateValue[] | undefined => {
	if (typeof value === 'string') {
		if (value.includes(',')) {
			return value.split(',').map((v) => {
				const date = dayjs(v, DATE_FORMAT).toISOString();
				return parseDate(date);
			});
			//return value.split(',').map((v) => parseDate(dayjs(v).toISOString().split('T')[0]));
		}
		const date =
			value !== ''
				? dayjs(value).toISOString().split('T')[0]
				: new Date().toISOString().split('T')[0];
		return parseDate(date);
	}
	if (value instanceof Date) {
		return parseDate(value.toISOString().split('T')[0]);
	}
	return undefined;
};
export const formatDate = (value: string | Date, format: string = DATE_FORMAT) => {
	if (typeof value === 'string') {
		return dayjs(value, DATE_FORMAT).format(format);
	}
	if (value instanceof Date) {
		return dayjs(value).format(format);
	}
};

export function getQuarter(date: dayjs.Dayjs = dayjs()): number {
	const month = date.month() + 1; // Month is 0-indexed in Day.js
	if (month >= 4 && month <= 6) {
		return 1;
	} else if (month >= 7 && month <= 9) {
		return 2;
	} else if (month >= 10 && month <= 12) {
		return 3;
	} else {
		return 4;
	}
}
export function getLastQuarter(date: dayjs.Dayjs = dayjs()): number {
	return getQuarter(date.subtract(3, 'month'));
}

export function getQuarters(
	year: number = new Date().getFullYear()
): { start: dayjs.Dayjs; end: dayjs.Dayjs }[] {
	const quarters = [
		{ start: dayjs(`${year}-04-01`), end: dayjs(`${year}-06-30`) },
		{ start: dayjs(`${year}-07-01`), end: dayjs(`${year}-09-30`) },
		{ start: dayjs(`${year}-10-01`), end: dayjs(`${year}-12-31`) },
		{ start: dayjs(`${year + 1}-01-01`), end: dayjs(`${year + 1}-03-31`) }
	];	
	return quarters;
}

export function getWeekOfMonth(date: dayjs.Dayjs = dayjs()): number {
	const firstDayOfMonth = date.startOf('month'); // Get the first day of the month
	const firstDayOfWeek = firstDayOfMonth.day(); // Get the day of the week for the first day
	const currentDay = date.date(); // Get the current day of the month

	// Calculate the week number
	return Math.ceil((currentDay + firstDayOfWeek) / 7);
}

// Function to get fiscal year range
export function getFiscalYearRange(date: dayjs.Dayjs = dayjs()): { start: Date; end: Date } {
	const month = dayjs(date).month(); // Month is zero-indexed (0 = January, 3 = April)
	const year = dayjs(date).year();

	let startYear, endYear;

	// Determine the start and end years based on the month
	if (month < 3) {
		// January, February, March
		startYear = year - 1;
		endYear = year;
	} else {
		// April, May, June, July, August, September, October, November, December
		startYear = year;
		endYear = year + 1;
	}

	return { start: dayjs(`${startYear}-04-01`).toDate(), end: dayjs(`${endYear}-03-31`).toDate() };
}

export const presets: Array<{ key: string; name: string; label: string; from: Date; to: Date }> = [
	{
		key: 'today',
		name: 'Today',
		label: formatDate(new Date()) as string,
		from: new Date(),
		to: new Date()
	},
	{
		key: 'yesterday',
		name: 'Yesterday',
		label: formatDate(dayjs().subtract(1, 'day').toDate()) as string,
		from: dayjs().subtract(1, 'day').toDate(),
		to: dayjs().subtract(1, 'day').toDate()
	},
	{
		key: 'tillDate',
		name: 'Till Date',
		label: `${formatDate(dayjs().startOf('month').toDate(), 'DD-MMM-YY') as string} - ${formatDate(dayjs().toDate(), 'DD-MMM-YY') as string}`,
		from: dayjs().startOf('month').toDate(),
		to: dayjs().toDate()
	},
	{
		key: 'thisWeek',
		name: 'This Week',
		label: `${getWeekOfMonth(dayjs())} week ${formatDate(dayjs().startOf('week').toDate(), 'MMM-YY') as string}`,
		from: dayjs().startOf('week').toDate(),
		to: dayjs().endOf('week').toDate()
	},
	{
		key: 'thisMonth',
		name: 'This Month',
		label: formatDate(dayjs().startOf('month').toDate(), 'MMMM YY') as string,
		from: dayjs().startOf('month').toDate(),
		to: dayjs().endOf('month').toDate()
	},
	{
		key: 'lastMonth',
		name: 'Last Month',
		label: formatDate(dayjs().subtract(1, 'month').startOf('month').toDate(), 'MMMM YY') as string,
		from: dayjs().subtract(1, 'month').startOf('month').toDate(),
		to: dayjs().subtract(1, 'month').endOf('month').toDate()
	},
	{
		key: 'thisQuarter',
		name: 'This Quarter',
		label: `${formatDate(getQuarters()[getQuarter() - 1].start.toDate(), 'MMM-YY') as string} - ${formatDate(getQuarters()[getQuarter() - 1].end.toDate(), 'MMM-YY') as string} (Q ${getQuarter(dayjs())})`,
		from: getQuarters()[getQuarter() - 1].start.toDate(),
		to: getQuarters()[getQuarter() - 1].end.toDate()
	},
	{
		key: 'lastQuarter',
		name: 'Last Quarter',
		label: `${formatDate(getQuarters(getQuarter() === 1 ? new Date().getFullYear() - 1 : new Date().getFullYear())[getLastQuarter() - 1].start.toDate(), 'MMM-YY') as string} - ${formatDate(getQuarters(getQuarter() === 1 ? new Date().getFullYear() - 1 : new Date().getFullYear())[getLastQuarter() - 1].end.toDate(), 'MMM-YY') as string} (Q ${getLastQuarter(dayjs())})`,
		from: getQuarters(getQuarter() === 1 ? new Date().getFullYear() - 1 : new Date().getFullYear())[getLastQuarter() - 1].start.toDate(),
		to: getQuarters(getQuarter() === 1 ? new Date().getFullYear() - 1 : new Date().getFullYear())[getLastQuarter() - 1].end.toDate()
	},
	{
		key: 'thisYear',
		name: 'This Year',
		label: `${formatDate(getFiscalYearRange().start, 'MMM-YYYY') as string} - ${formatDate(getFiscalYearRange().end, 'MMM-YYYY') as string}`,
		from: getFiscalYearRange().start,
		to: getFiscalYearRange().end
	},
	{
		key: 'lastYear',
		name: 'Last Year',
		label: `${formatDate(getFiscalYearRange(dayjs().subtract(1, 'year')).start, 'MMM-YYYY') as string} - ${formatDate(getFiscalYearRange(dayjs().subtract(1, 'year')).end, 'MMM-YYYY') as string}`,
		from: getFiscalYearRange(dayjs().subtract(1, 'year')).start,
		to: getFiscalYearRange(dayjs().subtract(1, 'year')).end
	},
	{
		key: 'custom',
		name: 'Let me choose',
		label: '..',
		from: new Date(),
		to: new Date()
	}
];
