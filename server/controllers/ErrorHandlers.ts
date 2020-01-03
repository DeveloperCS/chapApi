import { Response } from 'express';

export const handleError: (error: Error, response: Response, status: number) => void = (error, response, status) => {
    response.status(status);
    response.json({
        error: error.message
    });
};