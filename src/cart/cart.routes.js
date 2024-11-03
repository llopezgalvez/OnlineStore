'use strict'

import {Router} from 'express'
import {addProductsCart, listProductsInCart, listUserAndCarts, deleteProductCart } from './cart.controller.js'
import { isAdmin, validateJwt } from '../middlewares/validate-jwt.js'

const api = Router()

//ADMIN
api.get('/listUserAndCarts', [validateJwt, isAdmin], listUserAndCarts)

//CLIENT
api.post('/addProductsCart/:id', [validateJwt], addProductsCart)
api.get('/listProductsInCart', [validateJwt], listProductsInCart)
api.delete('/deleteProductCart/:id', [validateJwt], deleteProductCart)

export default api