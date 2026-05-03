import { ItemsController } from "../src/controllers/items.controller.js";
import { Request, Response } from "express";

async function testDelete() {
    const controller = new ItemsController();
    
    const mockReq = {
        params: { id: "some-uuid" },
        user: { id: "user-id", role: "admin" }
    } as unknown as Request;

    const mockRes = {
        json: (data: any) => console.log("Response:", data)
    } as unknown as Response;

    const mockNext = (err: any) => console.error("Next Error:", err);

    try {
        console.log("Testing delete...");
        await controller.delete(mockReq, mockRes, mockNext);
    } catch (e) {
        console.error("Caught Exception:", e);
    }
}

testDelete();
