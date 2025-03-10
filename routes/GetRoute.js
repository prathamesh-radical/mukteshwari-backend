import express from "express";
import { GetBranches, GetBranchesByCity, GetBranchRequests, GetEvent, GetRequests, GetUsers } from "../controller/GetDataController.js";

const GetRoutes = express.Router();

GetRoutes.get("/users", GetUsers);
GetRoutes.get("/get-branches", GetBranches);
GetRoutes.get("/events", GetEvent);
GetRoutes.get("/requests", GetRequests);
GetRoutes.get("/get-cities", GetBranchesByCity);
GetRoutes.get("/branch-requests", GetBranchRequests);

export default GetRoutes;