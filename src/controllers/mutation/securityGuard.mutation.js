import generateAuthToken from "../../helper/generateAuthToken.js";
import SecurityGuard from "../../models/SecurityGuard.js";
import { createSystemLog } from "../../middleware/createSystemLog.js";
import bcrypt from "bcryptjs";

export const loginSecurityGuard = async (req, res) => {
    const {username, password} = req.body;
    try{
        const securityGuard = await SecurityGuard.findOne({username, deleted: false});
        if(!securityGuard) return res.status(404).json({message: "Security Guard not found"});
        if(!securityGuard.active) return res.status(401).json({message: "Account is inactive"});
        
        const isMatch = await bcrypt.compare(password, securityGuard.password);
        if(!isMatch) return res.status(401).json({message: "Invalid credentials"});
            
        const token = await generateAuthToken(securityGuard, "SecurityGuard");
        await createSystemLog("LOGIN", "SecurityGuard", securityGuard._id, "SecurityGuard", "Security Guard logged in", null);
        
        return res.status(200).json({message: "Login successful", token: token});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Failed to login security guard"});
    }
}

export const toggleGuardAccount = async (req, res) => {
    //admin auth
    const admin = req.user;
    try{
        const {id} = req.params;
        const securityGuard = await SecurityGuard.findById(id);
        if(!securityGuard) return res.status(404).json({message: "Security Guard not found"});
        securityGuard.active = !securityGuard.active;
        await securityGuard.save();

        await createSystemLog("UPDATE", "Admin", admin._id, "SecurityGuard", `Security Guard account ${securityGuard.active ? 'activated' : 'deactivated'}`, null);
    
        return res.status(200).json({message: `Security Guard account ${securityGuard.active ? 'activated' : 'deactivated'}`});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Failed to toggle security guard account"});
    }
}

export const updateSecurityGuard = async (req, res) => {
    const {id} = req.params;
    const securityGuard = req.body;
    try{
        const updatedSecurityGuard = await SecurityGuard.findByIdAndUpdate
        (id, securityGuard, {new: true});
    
        if(updatedSecurityGuard){
            await createSystemLog("UPDATE", "SecurityGuard", updatedSecurityGuard._id, "SecurityGuard", "Security Guard updated", null);
        } else {
            return res.status(400).json({message: "Failed to update security guard"});
        }

        return res.status(200).json({message: "Security Guard updated successfully"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Failed to update security guard"});
    }
}


export const updatePasswordSecurityGuard = async (req, res) => {
    try{
        const {id} = req.params;
        const {oldPassword, newPassword} = req.body;
        const securityGuard = await SecurityGuard.findById(id);
        if(!securityGuard) return res.status(404).json({message: "Security Guard not found"});
        const isMatch = await bcrypt.compare(oldPassword, securityGuard.password);
        if(!isMatch) return res.status(401).json({message: "Invalid credentials"});
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        securityGuard.password = hashedPassword;
        await securityGuard.save();
        return res.status(200).json({message: "Password updated successfully"});
    }catch(error){
        console.error(error);
        return res.status(500).json({message: "Failed to update password"});
    }
}


export const createSecurityGuard = async (req, res) => {
    const securityGuard = req.body;
    console.log(securityGuard);
    try{
        const hashedPassword = await bcrypt.hash(securityGuard.password, 12);
        const newSecurityGuard = await SecurityGuard.create({
            name: securityGuard.name,
            username: securityGuard.username,
            password: hashedPassword,
            active: true,
        });
        if(newSecurityGuard){
            await createSystemLog("CREATE", "Admin", req.user._id, "SecurityGuard", "Security Guard created", null);
        } else {
            return res.status(400).json({message: "Failed to create security guard"});
        }
        return res.status(201).json({message: "Account created successfully"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Failed to create security guard"});
    }
}