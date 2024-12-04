import Config from "../../models/Config.js";
import Admin from "../../models/Admin.js";
import bcrypt from 'bcryptjs';
import Student from "../../models/Student.js";
import ViolationLog from "../../models/ViolationLog.js";
import { sendEmail } from "../../helper/emailer.js";

export const updateSY = async (req, res) => {
    const { start, end, semester, password } = req.body;
    try {
      const admin = await Admin.findById(req.user._id);
      if (!admin) return res.status(404).json({ message: 'Admin not found' });
  
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });
  
      const config = await Config.findOne();
      if (!config) return res.status(404).json({ message: 'Config not found' });
  
      if (config.SY.start === start && config.SY.end === end && config.SY.semester === semester) {
        return res.status(400).json({ message: 'No changes made' });
      }
  
      // Update config
      if (start) config.SY.start = start;
      if (end) config.SY.end = end;
      if (semester) config.SY.semester = semester;
      await config.save();
  
      // Mark students and violations as obsolete
      await Student.updateMany({}, { valid: false });
      await ViolationLog.updateMany({}, { current: false });
  
      res.status(200).json({ message: 'School year updated successfully' }); // Send response early
  
      // Get all students and send emails concurrently
      const students = await Student.find({}, 'email'); // Select only email to reduce load
      const emailPromises = students.map((student) => {
        const emailOption = {
          to: student.email,
          subject: 'School Year Update',
          text: `School year has been updated. Please log in to your account to and update your COR to continue using the service.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9;">
              <h2 style="font-size: 20px; color: #333; text-align: center; margin-bottom: 20px;">School Year Update</h2>
              <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 20px; text-align: center;">
                The school year has been updated. Please log in to your Scholarpass account and update your Certificate of Registration (COR) to continue using our services.
              </p>
              <div style="text-align: center; margin-top: 20px;">
                <a href="${process.env.FRONTEND_URL}/signin" target="_blank" style="display: inline-block; text-decoration: none; background: #006618; color: #fff; padding: 10px 20px; border-radius: 4px; font-size: 16px;">
                  Log In to Scholarpass
                </a>
              </div>
              <p style="font-size: 14px; color: #999; text-align: center; margin-top: 20px;">
                If you have any questions, contact our support team at <a href="mailto:scholarpassnotif@gmail.com" style="color: #006618;">scholarpassnotif@gmail.com</a>.
              </p>
            </div>
          `,
        };
  
        return sendEmail(emailOption).catch((error) => {
          console.error(`Failed to send email to ${student.email}:`, error);
        });
      });
  
      // Wait for all emails to be sent
      await Promise.all(emailPromises);
      console.log('All emails processed.');
  
    } catch (error) {
      console.error('Error updating school year:', error);
      res.status(500).json({ message: 'Failed to update school year' });
    }
  };
  

export const addViolation = async (req, res) => {
    const {violations} = req.body;

    try {
        const config = await Config.findOne();
        if(!config) return res.status(404).json({ message: 'Config not found' });
        for(const violation of violations){
            config.violations.push(violation);
        }
        await config.save();

        return res.status(200).json({ message: 'Violation added successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to add violation' });
    }
}

export const updateViolation = async (req, res) => {
    const {id} = req.params;
    const violations = req.body;

    try {
        const config = await Config.findOne();
        if(!config) return res.status(404).json({ message: 'Config not found' });
        
        config.violationTypes = violations;
        const newConfig = await config.save();



        console.log(newConfig);
        return res.status(200).json({ message: 'Violation updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update violation' });
    }
}

export const deleteViolation = async (req, res) => {
    const {id} = req.params;

    try {
        const config = await Config.findOne();
        if(!config) return res.status(404).json({ message: 'Config not found' });
        const index = config.violations.findIndex(v => v._id == id);
        if(index === -1) return res.status(404).json({ message: 'Violation not found' });

        config.violations.splice(index, 1);
        await config.save();

        return res.status(200).json({ message: 'Violation deleted successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to delete violation' });
    }
}

