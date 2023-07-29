import express from "express";
import FileUpload from "express-fileupload";
import cors from "cors";
import dotenv from "dotenv"; 
import ProductRoute from "./routes/ProductRoute.js";
import UserRoute from "./routes/UserRoute.js";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();

app.use(cors({credentials:true, origin:'http://localhost:3000'}));
//app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(FileUpload());
app.use(express.static("public"));
app.use(ProductRoute);
app.use(UserRoute);

app.listen(5000, ()=> console.log('Server Up and Running...'));