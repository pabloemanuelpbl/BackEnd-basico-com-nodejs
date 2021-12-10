const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Categoria = new Schema({ //cria tipo de tabela
    nome: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now() //default define um valor padrão
    }
})

mongoose.model("categorias", Categoria) //cria tabela categoria e(ou) adiciona Categorias