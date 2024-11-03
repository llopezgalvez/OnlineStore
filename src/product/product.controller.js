'use strict'

import Product from './product.model.js'
import Category from '../category/category.model.js'

export const addProduct = async (req, res) => {
    try {
        let data = req.body
        let category = await Category.findOne({ _id: data.category })
        if (!category) return res.status(404).send({ message: 'Category not found' }) 

        if (data.price < 0) {
            return res.status(400).send({ message: 'El precio no puede ser menor a 0' })
        } else if (data.stock < 0) {
            return res.status(400).send({ message: 'Ingresar numeros positivos en stock' })
        }

        let product = new Product(data)
        await product.save()
        return res.send({ message: 'Product saved successfully' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error saving product', error })
    }
}

export const searchProduct = async (req, res) => {
    try {
        let { search } = req.body
        let product = await Product.find({
            name: search
        })
        if (product.length == 0) return res.status(404).send({ message: 'Product not found' })
        return res.send({ message: 'Product found', product })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error searching product' })
    }
}

export const updateProduct = async (req, res) => {
    try {
        let { id } = req.params
        let data = req.body
        let updateP = await Product.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        )
        if (!updateP) return res.status(401).send({ message: 'Product not found and not updated' })
        return res.send({ message: 'Updated Product', updateP })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating account' })
    }
}

export const deleteProduct = async (req, res) => {
    try {
        let { id } = req.params
        let deleteProduct = await Product.deleteOne({ _id: id })
        if (deleteProduct.deletedCount == 0) return res.status(404).send({ message: 'Product not found and not deleted' })
        return res.send({ message: 'Delete product successfully' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error deleting product', error })
    }
}

export const listProducts = async (req, res) => {
    try {
        let products = await Product.find().populate({ path: 'category', select: 'name -_id' })
        if (products.length == 0) return res.status(404).send({ message: 'Not fount Products' })
        return res.send({ products })
    } catch (error) {
        console.error(error)
        return res.status(401).send({ message: 'Error getting products' })
    }
}

export const getProductSoldOut = async (req, res) => {
    try {
        let productSoldOut = await Product.find({ stock: 0 }).select('-_id').populate({ path: 'category', select: 'name -_id' })
        if (productSoldOut.length == 0) {
            return res.status(404).send({ message: 'No products out of stock' })
        }
        return res.send({ productSoldOut })
    } catch (error) {
        console.error(error)
        return res.send({ message: 'Error get list products sold out', error })
    }
}


export const listProductMostSold = async (req, res) => {
    try {
        let productsMostOld = await Product.find().select('-_id').populate({ path: 'category', select: 'name -_id' })
            .sort({ mostPurchased: -1 }) //Orden descendente
            .limit(5)

        if (!productsMostOld) return res.status(500).send({ message: 'Error al obtener los produvtos mas vendidos' })

        return res.status(200).send({ message: 'Productos mas vendidos', productsMostOld })

    } catch (error) {
        console.error(error)
        return res.status(500).sed({ message: 'Error getting list of products most old' })
    }
}

export const searchProductForWord = async (req, res) => {
    try {
        let { search } = req.body

        let product = await Product.find({ name: { $regex: new RegExp(search, 'i') } }).populate('category', ['name', 'description'])
        return res.send(product)
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error searching product' })
    }
}