'use strict'

import Buy from './buy.model.js'
import User from '../user/user.model.js'
import Cart from '../cart/cart.model.js'
import Product from '../product/product.model.js'

export const addBuy = async (req, res) => {
    try {
        let userID = req.user.id
        let user = await User.findOne({ _id: userID })
        let usuario = user.username

        if (!user) return res.status(404).send({ message: 'User not found' })

        let cart = await Cart.findOne({ user: userID })
        if (!cart) return res.status(404).send({ message: 'Cart not found' })

        let total = cart.subTotal
        let productsCart = cart.products

        // Creamos un array para almacenar los productos en el carrito
        let productDetails = []

        // Iteramos sobre cada producto en el carrito
        for (let product of productsCart) {
            // Aquí, usamos populate para obtener los detalles del producto, incluyendo su nombre y precio
            let productDetail = await Product.findById(product.product).select('name price')

            // Verificamos si el producto existe
            if (!productDetail) {
                console.log(`Product with ID ${product.product} not found`)
                continue
            }

            // Creamos un objeto con los detalles del producto
            let productInfo = {
                name: productDetail.name,
                price: productDetail.price,
                cantidad: product.cantidad
            };

            // Agregamos los detalles del producto al array de detalles de productos
            productDetails.push(productInfo)
        }

        // Creamos la compra con los detalles de los productos
        let compra = new Buy({ user: usuario, total, products: productDetails })

        // Guardamos la compra
        await compra.save()

        // Limpiar el carrito del usuario eliminando todos los productos
        cart.products = []
        await cart.save()

        // Limpiar el carrito del usuario eliminando todos los productos
        user.shoppingCart = []
        await user.save()

        return res.send({ message: 'Se ha creado con éxito la factura', compra })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error create factura' })
    }
}


export const ListarHistorialDeCompras = async (req, res) => {
    try {
        let userID = req.user.username

        let compras = await Buy.findOne({ user: userID }).populate('products.product', 'name price')
        if (!compras) return res.status(404).send({ message: 'No se ha encontrado facturas' })

        return res.send({ message: 'Facturas encontradas', compras })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error al obtener' })
    }
}