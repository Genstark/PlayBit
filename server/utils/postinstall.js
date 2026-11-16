const { S3Client, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
require('dotenv').config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_PAGE_ACCESS_KEY,
        secretAccessKey: process.env.AWS_PAGE_SCREATE_KEY,
    },
});

async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", chunk => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
}


async function downloaddistfolder() {
    // check if dist folder already exists
    if (fs.existsSync(path.join(__dirname, '../dist'))) {
        console.log("folder already exists, skipping download");
        return;
    }
    const bucket = process.env.AWS_BUCKET_NAME;
    const prefix = "dist/";
    try {
        // Step 1: List files
        const listCommand = new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix
        });
        const listResponse = await s3.send(listCommand);
        if (!listResponse.Contents) {
            console.log("No files found");
            return;
        }

        // Step 2: Download each file
        console.log("Starting download data");
        for (const file of listResponse.Contents) {
            const key = file.Key;
            if (key.endsWith("/")) {
                continue;
            }
            const getCommand = new GetObjectCommand({
                Bucket: bucket,
                Key: key
            });
            console.log("Downloading:", key);
            const response = await s3.send(getCommand);
            const buffer = await streamToBuffer(response.Body);
            const savePath = path.join(key);
            fs.mkdirSync(path.dirname(savePath), { recursive: true });
            fs.writeFileSync(savePath, buffer);
        }
        console.log("✅ Process Complete: All files downloaded successfully");
    }
    catch (err) {
        console.error(err);
    }
}

downloaddistfolder();