export function generateRandomID() {
	return Math.random().toString(36).substr(2, 9);
}
export function incrementAlphanumeric(str: string) {
    // Split the string into its alphabetic and numeric parts
    const match = str.match(/([A-Za-z]*)(\d+)$/);
    if (!match) return str; // Return original if no match

    const alphaPart = match[1]; // Alphabetic part
    const numPart = match[2]; // Numeric part

    // Increment the numeric part
    let incrementedNum = (parseInt(numPart, 10) + 1).toString();

    // Pad the incremented number with leading zeros if necessary
    while (incrementedNum.length < numPart.length) {
        incrementedNum = '0' + incrementedNum;
    }

    // Return the concatenated result
    return alphaPart + incrementedNum;
}