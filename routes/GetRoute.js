import express from "express";
import { GetBranches, GetBranchesByCity, GetBranchRequests, GetEvent, GetRequests, GetUserByUserId, GetUsersByBranchId } from "../controller/GetDataController.js";

const GetRoutes = express.Router();

GetRoutes.get("/users-by-branch-id", GetUsersByBranchId);
GetRoutes.get("/user-by-user-id", GetUserByUserId);
GetRoutes.get("/get-branches", GetBranches);
GetRoutes.get("/events", GetEvent);
GetRoutes.get("/requests", GetRequests);
GetRoutes.get("/get-cities", GetBranchesByCity);
GetRoutes.get("/branch-requests", GetBranchRequests);

export default GetRoutes;