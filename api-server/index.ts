import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs';
import * as dotenv from "dotenv";
import { Request, Response } from "express";
import { generateSlug } from 'random-word-slugs';
dotenv.config();
const express = require("express");

const app = express();
const PORT = 9000;

app.use(express.json());
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

const ecsClient = new ECSClient({
    region: AWS_REGION!,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY!,
        secretAccessKey: AWS_SECRET_ACCESS_KEY!,
    }
});

const config = {
    CLUSTER_ARN: process.env.CLUSTER_ARN,
    TASK_DEFINITION_ARN: process.env.TASK_DEFINITION_ARN
}

app.post('/project', async (req: Request, res: Response) => {
    const { gitUrl } = req.body;
    const projectSlug = generateSlug();

    // Spin the container using the API call
    const command = new RunTaskCommand({
        cluster: config.CLUSTER_ARN,
        taskDefinition: config.TASK_DEFINITION_ARN,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                subnets: ['subnet-0d25a30d27f777198', 'subnet-034783e9d059fb7a2', 'subnet-0e966c73222a0dc54'],
                securityGroups: ['sg-0ac28f6e00121c89f'],
                // assignPublicIp: 'ENABLED'
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: 'vercel-clone-image-uri',
                    environment: [
                        { name: 'GIT_REPOSITORY_URL', value: gitUrl },
                        { name: 'PROJECT_ID', value: projectSlug },
                        { name: 'AWS_REGION', value: 'ap-south-1' },
                        { name: 'AWS_S3_BUCKET', value: 'output-vercel-clone-bucket' },
                        { name: 'AWS_SECRET_ACCESS_KEY', value: process.env.AWS_SECRET_ACCESS_KEY },
                        { name: 'AWS_ACCESS_KEY', value: process.env.AWS_ACCESS_KEY },
                    ]
                }
            ]
        }
    })

    await ecsClient.send(command);

    return res.json({
        status: 'queued', data: {
            projectSlug,
            url: `http://${projectSlug}.localhost:8000`
        }
    });
})

app.listen(PORT, () => {
    console.log(`API Server is running on port ${PORT}`);
});