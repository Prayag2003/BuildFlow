import * as dotenv from "dotenv";
import { Request, Response } from "express";
const express = require("express");
const httpProxy = require("http-proxy");

dotenv.config();
const app = express();
const PORT = 8000;
const BASE_PATH = `https://output-vercel-clone-bucket.s3.ap-south-1.amazonaws.com/__outputs`

const proxy = httpProxy.createProxyServer()

app.use((req: Request, res: Response) => {
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];
    const resolvesTo = `${BASE_PATH}/${subdomain}`;

    return proxy.web(req, res, { target: resolvesTo, changeOrigin: true });
})

app.listen(PORT, () => {
    console.log(`Reverse Proxy Server is running on port ${PORT}`);
});