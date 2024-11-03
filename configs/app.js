import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import {config} from 'dotenv'
import userRoutes from '../src/user/user.routes.js'
import categoryRoutes from '../src/category/category.routes.js'
import productRoutes from '../src/product/product.routes.js'
import cartRoutes from '../src/cart/cart.routes.js'
import Category from '../src/category/category.model.js'
import buyRoutes from '../src/buy/buy.routes.js'
import User from '../src/user/user.model.js'
import { encrypt } from '../src/utils/validator.js'

const app = express()
config()
const port = process.env.PORT || 3200

let createDefaultCategory = async () => {
    try {
        let existingDefaultCategory = await Category.findOne({ name: 'Otros' })

        if (!existingDefaultCategory) {
            let defaultCategory = new Category({
                name: 'Otros',
                description: 'Default category for products that do not have an assigned category'
            })

            await defaultCategory.save()
            console.log('Default category created')
        }
    } catch (error) {
        return null
    }
}

let createAdminDefault = async () =>{
    try {
        let existsAdmin = await User.findOne({ role: 'ADMIN'})
        if(!existsAdmin){
            let newAdmin = new User({
                name: 'Josue',
                lastName: 'Noj',
                mail: 'jnoj-2022065@kinal.edu.gt',
                username: 'jnoj',
                password: '12345678',
                role: 'ADMIN'
            })

            newAdmin.password = await encrypt(newAdmin.password)
            await newAdmin.save()
            console.log('Admin created')
        }
    } catch (error) {
        console.error(error)
    }
}

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(morgan())

app.use('/user', userRoutes)
app.use('/category', categoryRoutes)
app.use('/product', productRoutes)
app.use('/cart', cartRoutes)
app.use('/buy', buyRoutes)

export const initServer = async () => {
    createAdminDefault()
    await createDefaultCategory()
    app.listen(port, () => {
        console.log(`Server HTTP running in port ${port}`)
    })
}