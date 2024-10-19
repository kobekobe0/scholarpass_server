import Config from "../models/Config.js"

const currentYear = new Date().getFullYear()

const defaultConfig = {
    SY: {
        start: parseInt(currentYear),
        end: parseInt(currentYear) + 1,
        semester: "1st"
    }, 
    violationTypes: [
        {
            name: "Improper Attire",
            severity: "MINOR"
        },
        {
            name: "Smoking in School Premises",
            severity: "MAJOR"
        }
    ]
}
export const createDefaultConfig = async () => {
    try{
        const configExists = await Config.find();
        if(configExists.length > 0) return;
        const config = await Config.create(defaultConfig);
        console.log('Default config created:', config);
    } catch (error) {
        console.error('Error creating default config:', error);
    }
}
