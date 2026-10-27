const { S3Client, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

const s3 = new S3Client({
    region: "ap-south-1",
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


async function downloadEBooks(bookName) {
    const bucket = process.env.AWS_BOOKS_BUCKET;
    const prefix = `${process.env.AWS_BOOKS_PATH}/${bookName}/`;
    const distPath = path.join(__dirname, '../EBooks', 'dist');
    try {
        if (fs.existsSync(distPath)) {
            fs.rmSync(distPath, { recursive: true, force: true });
        }

        // Step 1: List files
        const listCommand = new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix
        });
        const listResponse = await s3.send(listCommand);
        if (!listResponse.Contents?.some(file => file.Key && !file.Key.endsWith("/"))) {
            const error = new Error(`No files found for book "${bookName}"`);
            error.code = "BOOK_NOT_FOUND";
            throw error;
        }

        fs.mkdirSync(distPath, { recursive: true });

        // Step 2: Download each file
        for (const file of listResponse.Contents) {
            const key = file.Key;
            if (key.endsWith("/")) {
                continue;
            }
            const getCommand = new GetObjectCommand({
                Bucket: bucket,
                Key: key
            });
            const response = await s3.send(getCommand);
            const buffer = await streamToBuffer(response.Body);
            const relativePath = key.slice(prefix.length);
            const savePath = path.resolve(distPath, relativePath);
            if (!savePath.startsWith(`${distPath}${path.sep}`)) {
                throw new Error(`Invalid e-book asset path: ${key}`);
            }
            fs.mkdirSync(path.dirname(savePath), { recursive: true });
            fs.writeFileSync(savePath, buffer);
            console.log(`Downloaded ${key}`);
        }
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = downloadEBooks;