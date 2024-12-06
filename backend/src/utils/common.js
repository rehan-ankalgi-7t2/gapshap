import jwt from 'jsonwebtoken';
import path from 'path';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import request from 'request';
import logger from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const privateKey = await readFile('privateKey.key', 'utf8');
const publicKey = await readFile('publicKey.key', 'utf8');

const otpGenerate = () => {
    try {
        const otp = Math.random().toString().substring(2, 8);
        if (otp.length !== 6) {
            otpGenerate();
        } else {
            return otp;
        }
    } catch (error) {
        logger.error(`Error in common/otpGenerate${error.message}`);
    }
};

const generatePassword = () => {
    const length = Math.floor(Math.random() * 3) + 8; // Random length between 8 and 10
    const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const allChars = uppercaseLetters + lowercaseLetters + digits;

    let password = '';

    // Add an uppercase letter
    password += uppercaseLetters.charAt(Math.floor(Math.random() * uppercaseLetters.length));

    // Add a lowercase letter
    password += lowercaseLetters.charAt(Math.floor(Math.random() * lowercaseLetters.length));

    // Add an alphanumeric character
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));

    // Shuffle the characters (excluding first three characters)
    const shuffledChars = allChars
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');

    // Add the rest of the characters
    for (let i = 3; i < length; i++) {
        password += shuffledChars.charAt(Math.floor(Math.random() * shuffledChars.length));
    }

    return password;
};

const handleResponse = (
    data = null,
    isSuccess = false,
    statusCode = 500,
    errorMessage = null,
    warningMessage = null,
    totalRecords = null,
    totalPages = null,
    recordsPerPage = null
) => ({
    data,
    isSuccess,
    statusCode,
    warningMessage,
    errorMessage,
    totalRecords,
    totalPages,
    recordsPerPage
});

const pagination = async (model, page, pageSize, sortOption = null, selectionQuery = { updatedAt: 0 }, query = {}) => {
    try {
        const sortObject = {};
        if (sortOption && sortOption.field && sortOption.order) {
            sortObject[sortOption.field] = sortOption.order === 'desc' ? -1 : 1;
        }
        if (page) {
            const skip = (page - 1) * pageSize;
            const totalDocuments = await model.countDocuments(query);
            const totalPages = Math.ceil(totalDocuments / pageSize);

            const documents = await model.find(query, selectionQuery).sort(sortObject).skip(skip).limit(pageSize);

            return {
                success: true,
                data: documents,
                page,
                pageSize,
                totalPages,
                totalDocuments
            };
        }

        // else case
        const documents = await model.find(query, selectionQuery).sort(sortObject);

        return {
            success: true,
            data: documents,
            totalDocuments: documents.length
        };
    } catch (error) {
        return false;
    }
};

const aggregateWithPagination = async (model, pipeline, page, pageSize) => {
    try {
        if (!page) {
            const results = await model.aggregate(pipeline);
            return {
                success: true,
                data: results,
                totalDocuments: results.length
            };
        }

        const totalCount = await model.aggregate([...pipeline, { $count: 'totalCount' }]);
        const totalDocuments = totalCount.length > 0 ? totalCount[0].totalCount : 0;

        const paginatedPipeline = [...pipeline, { $skip: (page - 1) * pageSize }, { $limit: pageSize }];

        const results = await model.aggregate(paginatedPipeline);

        return {
            success: true,
            data: results,
            totalPages: Math.ceil(totalDocuments / pageSize),
            page,
            pageSize,
            totalDocuments
        };
    } catch (error) {
        return false;
    }
};

// Function to generate access token
const generateAccessToken = (data) => jwt.sign(data, privateKey, { algorithm: 'RS256', expiresIn: '1d' });

// Function to generate refresh token
const generateRefreshToken = (data) => jwt.sign(data, publicKey, { algorithm: 'RS256', expiresIn: '30d' });

const generateTransctionId = () => {
    const length = 12;
    let uniqueId = 'T';

    for (let i = 0; i < length; i++) {
        uniqueId += Math.floor(Math.random() * 10); // Random number between 0 and 9
    }

    return uniqueId;
};

// eslint-disable-next-line func-names
const curlCall = function (url, data, method = 'POST') {
    // eslint-disable-next-line global-require

    const options = {
        method,
        url,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },

        form: data
    };
    return new Promise((resolve, reject) => {
        request(options, (error, response) => {
            if (response) {
                const data = JSON.parse(response.body);
                return resolve(data);
            }
            return reject(error);
        });
    });
};

export {
    otpGenerate,
    generatePassword,
    handleResponse,
    pagination,
    generateAccessToken,
    generateRefreshToken,
    aggregateWithPagination,
    generateTransctionId,
    curlCall,
    __dirname
};