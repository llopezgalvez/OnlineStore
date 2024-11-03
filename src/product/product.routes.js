'use strict'

import {Router} from 'express'
import { validateJwt, isAdmin  } from '../middlewares/validate-jwt.js'
import {addProduct, listProducts, searchProduct, updateProduct, deleteProduct, getProductSoldOut, listProductMostSold, searchProductForWord} from './product.controller.js'

const api = Router()

//ADMIN
api.post('/addProduct', [validateJwt, isAdmin] ,addProduct)
api.put('/updateProduct/:id', [validateJwt, isAdmin], updateProduct)
api.delete('/deleteProduct/:id', [validateJwt, isAdmin], deleteProduct)
api.get('/getProductSoldOut', [validateJwt, isAdmin], getProductSoldOut)
api.get('/listProductMostSold', [validateJwt, isAdmin], listProductMostSold)

//CLIENT
api.get('/listProducts', listProducts)
api.post('/searchProduct', searchProduct)
api.get('/searchForWord', searchProductForWord)


export default api