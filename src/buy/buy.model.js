import {Schema, model} from 'mongoose'

const buySchema = new Schema({
    date: {
        type: Date,
        default: Date.now
    },
    hora:{
        type: String,
        default: () => {
            const now = new Date();
            // Obtenemos la hora local y la formateamos como una cadena de texto
            return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    },
    user:{
        type: String
    },
    products:[{
        product:{
            type: Schema.ObjectId,
            ref: 'product'
        },
        price: Number,
        cantidad: Number
    }],
    total:{
        type: Number
    }
},{
    versionKey: false
})


export default model('buy', buySchema)