import express from "express";
const app = express();
const port = process.env.PORT || 3000;
// Middleware to parse JSON bodies
app.use(express.json());
// Simple GET endpoint
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the API!" });
});
// Simple POST endpoint
app.post("/api/data", (req, res) => {
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
