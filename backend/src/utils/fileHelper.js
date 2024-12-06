import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import request from 'request';
import logger from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const saveFile = async (file, parentFolderName, subFolderName, fileName) => {
    // Ensure file is an array, if not, convert it to an array
    const files = Array.isArray(file) ? file : [file];

    const parentFolderPath = path.join(__dirname, '../fileuploads', parentFolderName);
    const subFolderPath = path.join(parentFolderPath, subFolderName);

    // Check if the parent directory exists, if not, create it
    if (!fs.existsSync(parentFolderPath)) {
        fs.mkdirSync(parentFolderPath, { recursive: true });
    }

    // Check if the subdirectory exists, if not, create it
    if (!fs.existsSync(subFolderPath)) {
        fs.mkdirSync(subFolderPath, { recursive: true });
    }

    // Get the list of files in the subfolder
    const existingFiles = fs.readdirSync(subFolderPath);

    // Calculate the next available suffix based on the number of existing files
    const suffix = existingFiles.length + 1;

    const filePaths = [];

    for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const fileBuffer = f.data;
        const fileExtension = path.extname(f.name); // Get file extension from filename

        // Modify the fileName with the next available suffix and file extension
        const finalFileName = `${path.basename(fileName, path.extname(fileName))}_${suffix + i}${fileExtension}`;

        const filePath = path.join(subFolderPath, finalFileName);

        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve, reject) => {
            fs.writeFile(filePath, fileBuffer, (err) => {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.error('Error writing file:', err);
                    reject(err);
                } else {
                    // eslint-disable-next-line no-console
                    console.log('File saved successfully at:', filePath);
                    filePaths.push(filePath);
                    resolve();
                }
            });
        });
    }

    return filePaths;
};

const readFileByPath = async (filePath) =>
    new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                // eslint-disable-next-line no-console
                console.error('Error reading file:', err);
                reject(err);
            } else {
                // eslint-disable-next-line no-console
                console.log('File read successfully from:', filePath);
                resolve(data);
            }
        });
    });

const deleteFileByPath = async (filePath) =>
    new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                reject(err);
            } else {
                // eslint-disable-next-line no-console
                console.log('File deleted successfully:', filePath);
                resolve(filePath);
            }
        });
    });

export { saveFile, readFileByPath, deleteFileByPath };