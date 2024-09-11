import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { exec } from "child_process";
import fs from "fs";
import mime from "mime-types";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const PROJECT_ID = process.env.PROJECT_ID;

const s3Client = new S3Client({
	region: process.env.AWS_REGION!,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
});

async function init() {
	console.log("Building server...");
	const outDirPath = path.join(__dirname, "output");

	const command = `cd ${outDirPath} && npm install && npm run build`;
	const process = exec(command);

	process.stdout?.on("data", (data: Buffer) => {
		console.log(data.toString());
	});

	process.stdout?.on("error", (data: Buffer) => {
		console.log("Error: " + data.toString());
	});

	process.on("close", async () => {
		console.log("Build complete");
		const distFolderPath = path.join(__dirname, "output", "dist");
		const distFolderContents = fs.readdirSync(distFolderPath, {
			recursive: true,
		});

		for (const file of distFolderContents) {
			const filePath = path.join(
				distFolderPath,
				file as string
			);
			if (fs.lstatSync(filePath).isDirectory()) continue;

			console.log("Uploading to S3: ", file);
			const command = new PutObjectCommand({
				Bucket: "",
				Key: `__/outputs/${PROJECT_ID}/${file}`,
				Body: fs.createReadStream(filePath),
				ContentType: mime.lookup(filePath) || undefined,
			});

			await s3Client.send(command);
			console.log("Uploaded to S3: ", file);
		}
		console.log("Upload to S3 done!!");
	});
}

init();
