import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";

const app = express();
app.use(cors());

// Configure Multer storage
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "public/uploaded-file/");   // ensure folder exists
    },
    filename(req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// API endpoint to upload CSV
app.post("/upload-csv", upload.single("csvFile"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({ 
        message: "File uploaded successfully",
        file: req.file.filename 
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
