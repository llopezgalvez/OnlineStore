import {Schema, model} from 'mongoose'

const categorySchema = Schema({
    name: {
        type: String,
        required: [true, 'Ingresar el nombre del producto']
    },
    description: {
        type: String,
        required: [true, 'Ingresar la descripción de la categoria']
    }
},{
    versionKey: false
})

export default model('category', categorySchema)