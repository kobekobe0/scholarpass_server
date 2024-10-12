/**
 * @param {File} file
 * @returns {Promise<string>}
 */
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            resolve(reader.result); // Resolve with Base64 string
        };

        reader.onerror = (error) => {
            reject(error); // Reject in case of an error
        };

        reader.readAsDataURL(file); // Start reading the file as a data URL
    });
};

export default fileToBase64
