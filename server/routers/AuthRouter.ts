import express from 'express';
const router = express.Router();
import AuthController, { TokenPayload } from '../controllers/AuthController';
import { handleError } from '../controllers/ErrorHandlers';
import * as jwt from 'jsonwebtoken';
import { UserType } from '../models/User';

const authController = new AuthController();

// Agrega error handling

router.post('/signup', (req, res) => {
    const {password, key} = req.body;
    authController.signUp(authController.getBaseUserFromRequest(req), password, key).then((data) => {
        return res.json(data);
    }).catch(error => {
        handleError(error, res, 403);
    });
});

router.post('/signin', (req, res) => {
    const password = req.body.password;
    const email = req.body.email;
    authController.signIn(email, password).then((data) => {
        return res.json(data);
    }).catch(error => {
        handleError(error, res, 403);
    });
});

router.get('/', authController.checkClientToken, (req, res) => {
    authController.getTokenFromRequest(req).then((token) => {
        const decoded = jwt.decode(token) as TokenPayload;
        return authController.get(decoded.id, decoded.type);
    }).then((user) => {
        res.json(user);
    }).catch(error => {
        handleError(error, res, 403);
    });
});

router.get('/:id', (req, res) => {
    authController.verifyIfTokenIsValidForIdAndType(req, req.params.id, [UserType.superadmin, UserType.admin, UserType.client]).then(() => {
        return authController.getTokenFromRequest(req);
    }).then((token) => {
        const decoded = jwt.decode(token) as TokenPayload;
        return authController.get(decoded.id, decoded.type);
    }).then((user) => {
        res.json(user);
    }).catch(error => {
        handleError(error, res, 403);
    });
});

router.get('/refreshtoken', authController.checkClientToken, (req, res) => {
    authController.getRefreshTokenFromRequest(req).then((token) => {
        return authController.verifyRefreshToken(token);
    }).then((token) => {
        const decoded = jwt.decode(token) as TokenPayload;
        res.json({
            refreshToken: authController.generateToken(decoded.email, decoded.type, decoded.id)
        });
    }).catch(error => {
        handleError(error, res, 403);
    });
});

router.get('/token', authController.checkClientToken, (req, res) => {
    authController.getRefreshTokenFromRequest(req).then((token) => {
        return authController.verifyRefreshToken(token);
    }).then((token) => {
        const decoded = jwt.decode(token) as TokenPayload;
        res.json({
            token: authController.generateToken(decoded.email, decoded.type, decoded.id)
        });
    }).catch(error => {
        handleError(error, res, 403);
    });
});

export default router;
