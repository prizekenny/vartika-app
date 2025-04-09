import express from "express";
import { prisma } from "../lib/prisma.js";
import { io } from "../server.js"; // WebSocket server

const router = express.Router();

router.post("/karbon", async (req, res) => {
  try {
    const { event, data } = req.body;

    // Handle different event types
    switch (event) {
      case "assignment.updated":
        // Update database
        await prisma.assignment.update({
          where: { karbonId: data.id },
          data: {
            status: data.status,
            updatedAt: new Date(),
          },
        });

        // Push updates via WebSocket
        io.emit("assignment:updated", data);
        break;

      case "assignment.created":
        // Create new assignment
        await prisma.assignment.create({
          data: {
            karbonId: data.id,
            title: data.title,
            status: data.status,
            dueDate: data.dueDate,
            assignedTo: data.assignedTo,
          },
        });

        io.emit("assignment:created", data);
        break;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
