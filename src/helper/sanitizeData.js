/**
 * Sanitizes input data by trimming white spaces and replacing empty strings with null
 * @param {string} str - The input string to sanitize
 * @returns {string|null} - The sanitized string or null if the input is empty
 */
export const sanitizeString = (str) => {
    const trimmedStr = str.trim();
  
    if (trimmedStr === '') {
        return null;
    }
  
    const words = trimmedStr.split(/\s+/);
  
    return words.join(' ');
}

/**
 * Recursively sanitizes all string properties in an object or array,
 * but ensures arrays of strings are not split into individual characters.
 * @param {Object|Array} obj - The object or array to sanitize
 * @returns {Object|Array} - The sanitized object or array
 */
export const sanitizeObjectWithTrim = (obj) => {
    if (Array.isArray(obj)) {
        // Check if the array contains strings
        if (obj.every(item => typeof item === 'string')) {
            // Return the array as-is but with sanitized strings
            return obj.map(item => sanitizeString(item));
        } else {
            // Recursively sanitize objects in the array
            return obj.map(item => sanitizeObjectWithTrim(item));
        }
    }

    const sanitizedObj = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'string') {
                sanitizedObj[key] = sanitizeString(obj[key]);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitizedObj[key] = sanitizeObjectWithTrim(obj[key]);
            } else {
                sanitizedObj[key] = obj[key];
            }
        }
    }
    return sanitizedObj;
};


/**
 * Middleware to sanitize request body
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
export const sanitizeObjectWithTrimMiddleware = (req, res, next) => {
    if (req.body) {
        // console.log("Sanitizing request body");
        // console.log(req.body);
        req.body = sanitizeObjectWithTrim(req.body);
        //console.log("Sanitized request body: ", req.body);
    }
    next();
}
