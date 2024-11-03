'use strict'

import Cart from './cart.model.js'
import User from '../user/user.model.js'
import Product from '../product/product.model.js'

export const addProductsCart = async (req, res) => {
    try {
        let userID = req.user.id
        let { id } = req.params //Id del propietario del carrito

        if (userID == id) {
            let user = await User.findById(userID) //Busco al usuario en la DB por su ID
            if (!user) { //Verifico si existe o no el usuario 
                return res.status(404).send({ message: 'User not found' })
            }

            let { idProduct, cant } = req.body //Obtengo los datos ingresados

            if(!(cant - Math.floor(cant) == 0)){
                return res.status(404).send({message: 'Ingresar una cantidad valida'})
            }

            let existsProduct = await Product.findById(idProduct) //Busco en la DB el producto
            if (!existsProduct) { //Verifico si el producto existe o no
                return res.status(404).send({ message: 'Product not found' })
            }

            //Verifico si la cantidad ingresada es menor a 0
            if (cant <= 0) {
                return res.status(400).send({ message: 'Invalid quantity, cant > 0' })
            }

            //Verifico si en stock existen aun el producto o se ha acabado
            let verifyStock = await Product.findOne({ _id: idProduct })
            if (verifyStock.stock <= 0) {
                return res.status(404).send({ message: 'Product out of stock' })
            }

            //Verificar que la cantidad que pidan no sea mayor a la que existe en el stock
            if (cant > verifyStock.stock) {
                return res.status(500).send({ message: `Sorry, only ${verifyStock.stock} ${verifyStock.name} available` })
            }

            // Verificar si el producto ya existe en el carrito del usuario
            let productExistsInCart = false
            let productIndexInCart = -1
            for (let i = 0; i < user.shoppingCart.length; i++) {
                if (user.shoppingCart[i].product.toString() === idProduct.toString()) {
                    // El producto ya existe en el carrito
                    productExistsInCart = true
                    productIndexInCart = i //Posicion del producto
                    break
                }
            }

            //Indicar que sucede si es true o false la busqueda del producto en el carrito
            if (productExistsInCart) {
                // Si el producto ya existe en el carrito, simplemente suma la cantidad adicional
                user.shoppingCart[productIndexInCart].cantidad += parseInt(cant)

                //Actualizamos el stock del producto
                let infoProduct = await Product.findOne({ _id: idProduct })
                infoProduct.stock -= cant

                // Actualizamos la cantidad de veces que lo han comprado
                infoProduct.mostPurchased += parseInt(cant)

                await infoProduct.save()
            } else {
                // Si el producto no existe en el carrito, se agrega con la cantidad
                user.shoppingCart.push({ product: idProduct, cantidad: parseInt(cant) })
                let infoProduct = await Product.findOne({ _id: idProduct })
                infoProduct.mostPurchased += parseInt(cant)
                infoProduct.stock -= cant

                await infoProduct.save()
            }



            //Guardar la informacion en la entidad de CART -> Hacer una copia basicamente
            //Busco un carrito de compras con el ID del usuario
            let cart = await Cart.findOne({ user: userID })
            let priceProduct = await Product.findOne({ _id: idProduct }) //No sirve para obtener el precio

            if (cart) {
                let productInCart = null
                //Iterar en cada elemento del carrito
                for (let i = 0; i < cart.products.length; i++) {
                    //Verificamos si que tengan el mismo ID
                    if (cart.products[i].product.toString() === idProduct.toString()) {
                        //Lo agregamos al arreglo
                        productInCart = cart.products[i]
                        break
                    }
                }

                // El producto ya existe, solo se le suma la nueva cantidad
                if (productInCart) {
                    productInCart.cantidad += parseInt(cant)
                } else {
                    // El producto no existe, se crea
                    cart.products.push({ product: idProduct, price: priceProduct.price, cantidad: parseInt(cant) })
                }

                await cart.save()
            } else {
                // Se crea un nuevo carrito para el usuario
                cart = new Cart({ user: userID, products: [{ product: idProduct, cantidad: parseInt(cant) }] })
                await cart.save()
            }
            await user.save()


            // Calcular el total
            let total = 0
            //Iteramos cada uno de los elementos del carrito del usuario
            for (let item of user.shoppingCart) {
                //Buscamos el producto atraves de su ID
                let product = await Product.findById(item.product)
                //Multiplicamos el precio por la cantidad que adquirio
                let subtotalForProduct = product.price * item.cantidad
                //Sumamos todos los subtotales de cada producto
                total += subtotalForProduct

                cart.subTotal = total
                await cart.save()
            }
            user.total = total
            // Guardar los cambios en el carrito y el usuario
            await user.save()

            // Enviar la respuesta al cliente con el total
            return res.status(200).send({ message: 'Product added to cart' })
        } else {
            return res.status(403).send({ message: 'You cannot add products to other users carts' })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error adding products to cart', error })
    }
}

export const listProductsInCart = async (req, res) => {
    try {
        let userID = req.user.id

        if (!userID) {
            return res.status(400).send({ message: 'No id provided' })
        }

        let user = await User.findById(userID)
        if (!user) {
            return res.status(404).send({ message: 'User not found' })
        }

        let cartProducts = []
        let total = 0
        for (let i = 0; i < user.shoppingCart.length; i++) {
            let product = await Product.findById(user.shoppingCart[i].product)
            if (product) {
                let subtotal = product.price * user.shoppingCart[i].cantidad
                total += subtotal // Sumamos el subtotal al total
                cartProducts.push({
                    name: product.name,
                    price: product.price,
                    quantity: user.shoppingCart[i].cantidad,
                    subtotal: subtotal
                })
            }
        }

        // Agregamos el total al objeto de respuesta
        let responseObj = {
            message: 'Lista de productos en el carrito: ',
            cartProducts: cartProducts,
            total: total // Agregamos el total al objeto de respuesta
        }

        return res.status(200).send(responseObj)
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error getting products' })
    }
}

export const listUserAndCarts = async (req, res) => {
    try {
        let usersCarts = await Cart.find()
        if (usersCarts.length == 0) return res.status(404).send({ message: 'No shopping carts' })

        return res.send({ usersCarts })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error getting shopping carts with your users' })
    }
}

export const deleteProductCart = async (req, res) => {
    try {
        let userID = req.user.id // Id obtenido desde el token
        let { id } = req.params // Id del usuario del carrito
        let { idProductoToDelete } = req.body

        if (id == userID) {
            // Buscar en la base de datos
            let user = await User.findById(userID)
            if (!user) {
                return res.status(404).send({ message: 'User not found' })
            }

            // Verificar si el carrito pertenece al usuario
            let userCart = await Cart.findOne({ user: userID })
            if (!userCart) return res.status(404).send({ message: 'Shopping cart not found for this user' })

            // Verificar si el producto está en el carrito
            let exists = false
            let deletedProduct
            for (let i = 0; i < user.shoppingCart.length; i++) {
                if (user.shoppingCart[i]._id.toString() === idProductoToDelete) {
                    exists = true
                    deletedProduct = user.shoppingCart[i]
                    user.shoppingCart.splice(i, 1) // Elimina un solo elemento en la posición i
                    break
                }
            }

            if (!exists) return res.status(404).send({ message: 'Product in the cart not found' })

            // Obtener la información del producto antes de eliminarlo
            let productToDelete = await Product.findById(deletedProduct.product)

            // Sumar la cantidad eliminada al stock
            productToDelete.stock += deletedProduct.cantidad
            await productToDelete.save()

            await user.save()

            return res.status(200).send({ message: 'Product removed from cart successfully' })
        } else {
            return res.status(403).send({ message: 'You do not have permission to delete another user\'s shopping cart' })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error deleting product from cart' })
    }
}