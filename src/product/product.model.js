import {Schema, model} from 'mongoose'

const productSchema = Schema({
    name: {
        type: String,
        required: [true, 'Ingrese el nombre del producto']
    },
    description: {
        type: String,
        required: [true, 'Ingrese la descripcion']
    },
    price: {
        type: Number,
        required: [true, 'Ingrese el precio del producto'],
        default: 0
    },
    stock: {
        type: Number,
        required: [true, 'Ingrese la cantidad que hay en stock'],
        default: 0
    },
    category: {
        type: Schema.ObjectId,
        ref: 'category',
        required: [true,'Ingrese de que categoria es el producto']
    },
    mostPurchased:{
        type: Number,
        default: 0
    }
},{
    versionKey: false
})

export default model('product', productSchema)