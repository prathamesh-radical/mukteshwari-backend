import express from "express";
import {
    AddRequests, InsertRequests, InsertRequestsInBulk, UpdateBulkRequests, UpdateRequests
} from "../controller/RequestsController.js";

const RequestsRoute = express.Router();

RequestsRoute.post("/requests", AddRequests);
RequestsRoute.put("/requests", UpdateRequests);
RequestsRoute.put("/requests/bulk", UpdateBulkRequests);
RequestsRoute.post("/register-requests", InsertRequests);
RequestsRoute.post("/register-requests/bulk", InsertRequestsInBulk);

export default RequestsRoute;