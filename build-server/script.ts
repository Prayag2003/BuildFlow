import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { exec } from "child_process";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as mime from 'mime-types';
import * as path from 'path';
dotenv.config();

const s3Client = new S3Client({
	region: process.env.AWS_REGION!,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
});

async function init() {
	console.log("🎯 Building server...");
	const outDirPath = path.join(__dirname, "output");

	console.log("🎯 Running npm install and build in output directory...");
	const command = `cd ${outDirPath} && npm install && npm run build`;
	const p = exec(command);

	p.stdout?.on("data", (data: Buffer) => {
		console.log("Data: ", data.toString());
	});

	p.stdout?.on("error", (data: Buffer) => {
		console.log("Error: " + data.toString());
	});

	p.on("close", async () => {
		console.log("✅ Build complete!!!");
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
				Bucket: process.env.AWS_S3_BUCKET!,
				Key: `__/outputs/${process.env.PROJECT_ID}/${file}`,
				Body: fs.createReadStream(filePath),
				ContentType: mime.lookup(filePath) || undefined,
			});

			await s3Client.send(command);
			console.log("Uploaded to S3: ", file);
		}
		console.log("✅ Upload to S3 done !!!");
	});
}

init();
