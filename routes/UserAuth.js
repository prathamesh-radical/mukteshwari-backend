import express from 'express';
import { checkPhoneNumber, UserLogin, UserRegister } from '../controller/UserAuthController.js';

const AuthUserRoute = express.Router();

AuthUserRoute.post("/user-register", UserRegister);
AuthUserRoute.post("/user-login", UserLogin);
AuthUserRoute.post("/check-phone", checkPhoneNumber);

export default AuthUserRoute;