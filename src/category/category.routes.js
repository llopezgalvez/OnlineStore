'use strict'

import {Router} from 'express'
import {validateJwt, isAdmin} from '../middlewares/validate-jwt.js'
import {addCategory, updateCategory, deleteCategory, searchCategory, listCategories} from './category.controller.js'

const api = Router()

//ADMIN
api.post('/addCategory', [validateJwt, isAdmin], addCategory)
api.delete('/deleteCategory/:id', [validateJwt, isAdmin], deleteCategory)
api.put('/updateCategory/:id', [validateJwt, isAdmin], updateCategory)

//CLIENT
api.get('/listCategories', listCategories)
api.post('/searchCategory', searchCategory)

export default api