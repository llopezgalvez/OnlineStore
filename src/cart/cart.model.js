import {Schema, model} from 'mongoose'

const cartSchema = new Schema({
    user:{
        type: Schema.ObjectId,
        ref: 'user',
        required: true
    },
    products:[{
        product:{
            type: Schema.ObjectId,
            ref: 'product'
        },
        price: Number,
        cantidad: Number
    }],
    subTotal:{
        type: Number,
        default: 0
    }
},{
    versionKey: false
})

export default model('cart', cartSchema)