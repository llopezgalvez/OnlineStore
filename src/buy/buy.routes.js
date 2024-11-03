'use strict'

import {Router} from 'express'
import { addBuy ,ListarHistorialDeCompras} from './buy.controller.js'
import { isAdmin, validateJwt } from '../middlewares/validate-jwt.js'

const api = Router()

api.get('/getFactura', [validateJwt], addBuy)
api.get('/ListarHistorialDeCompras', [validateJwt], ListarHistorialDeCompras)

export default api