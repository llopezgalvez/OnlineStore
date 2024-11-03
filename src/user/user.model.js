import { Schema, model } from 'mongoose'

const userSchema = Schema({
    name: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        lowercase: true,
        unique: [true, 'The user name already exists']
    },
    mail: {
        type: String,
        required: true,
        unique: [true, 'Mail already exists']
    },
    password: {
        type: String,
        required: true,
        minLength: [8, 'Password must be 8 characteres']
    },
    role: {
        type: String,
        uppercase: true,
        enum: ['ADMIN', 'CLIENT'],
        default: 'CLIENT',
        required: true
    },
    shoppingCart: [{
        product: { type: Schema.ObjectId, ref: 'product' },
        price: Number,
        cantidad: Number
    }],
    total: {
        type: Number,
        default: 0
    }
}, {
    versionKey: false
})

export default model('user', userSchema)