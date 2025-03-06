import express from 'express';
import { BranchLogin, BranchRegister } from '../controller/BranchAuthController.js';

const AuthBranchRoute = express.Router();

AuthBranchRoute.post("/branch-register", BranchRegister);
AuthBranchRoute.post("/branch-login", BranchLogin);

export default AuthBranchRoute;