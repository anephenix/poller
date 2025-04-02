/*
	This function is used to identify the values that do not exist in all of 
	the passed arrays.
*/
export function difference<T>(array: T[], ...others: T[][]): T[] {
	const otherValues = new Set(others.flat());
	return array.filter(item => !otherValues.has(item));
}