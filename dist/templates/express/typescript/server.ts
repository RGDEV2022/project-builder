import express, { Request, Response } from "express";

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Simple GET endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the API!" });
});

// Simple POST endpoint
app.post("/api/data", (req: Request, res: Response) => {
  const data = req.body;
  res.status(201).json({
    message: "Data received successfully",
    data,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default app;
