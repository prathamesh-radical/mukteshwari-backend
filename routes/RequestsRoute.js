import express from "express";
import {
    AddRequests, InsertRequests, InsertRequestsInBulk, UpdateBulkRequests, UpdateRequests
} from "../controller/RequestsController.js";

const RequestsRoute = express.Router();

RequestsRoute.post("/requests", AddRequests);
RequestsRoute.post("/requests/single", UpdateRequests);
RequestsRoute.post("/requests/bulk", UpdateBulkRequests);
RequestsRoute.post("/register-requests", InsertRequests);
RequestsRoute.post("/register-requests/bulk", InsertRequestsInBulk);

export default RequestsRoute;