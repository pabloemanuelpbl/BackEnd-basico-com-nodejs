//express
    const express = require('express')
    const router = express.Router()
//model de forma externa
    const mongoose = require("mongoose")
    require("../models/Categoria")
    const Categoria = mongoose.model("categorias")
    //postagem
    require('../models/Postagem')
    const Postagem = mongoose.model("postagens")
//helpers
    const { eAdmin } = require("../helpers/eAdmin")//esta linha chama a função eAdmin de dentro de ../helpers/eAdmin, e cria variavel eAdmin

//rotas
router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
})

router.get('/post', eAdmin, (req, res) => {
    res.send('Pagina post')
})

router.get('/categorias', eAdmin, (req, res) => { 
    Categoria.find().sort({date:'desc'}).lean().then((categorias)=>{ console.log(categorias['nome'])
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg", "ouve um erro ao listar")
        res.redirect("/admin")
    })
})

router.post("/categorias/nova", eAdmin, ((req, res)=>{

    // validação de dados e evitar erros
    var erros = []

    if(!req.body.nome || typeof req.body.nome == "undefinide" || req.body.nome == null){
        erros.push({texto: "nome invalido"})
    }

    if(!req.body.slug || typeof req.body.slug == "undefinide" || req.body.slug == null){
        erros.push({texto: "slug invalido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria muito pequeno"})
    }

    if(erros.length > 0){
        res.render("admin/categorias", {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(()=>{
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((erro)=>{
            req.flash("error_msg", "houve um erro ao salvar a categoria, tente novamente")
            res.redirect("/admin/categorias")
            console.log(erro)
        })
    }
}))

router.get("/categorias/edit/:id", eAdmin, (req, res)=>{  //carregar dados da categoria
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render("admin/editecategoria", {categoria: categoria})
    }).catch((err)=>{
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect("/admin/categorias")
    })
    /// 
})

//validar categoria
router.post("/categorias/edit/", eAdmin, (req, res)=>{ 
    Categoria.findOne({_id: req.body.id}).then((categoria)=>{
    
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(()=>{
            req.flash("editado com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err)=>{  console.log(err)
            req.flash("error_msg", "houve um erro interno ao salvar a categoria")
            res.redirect("/admin/categorias")
        })

    }).catch((err)=>{
        req.flash("error_msg", "id nao encontrado")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/deletar", eAdmin, (req, res)=>{
    Categoria.remove({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err)=>{
        req.flash("error_msg", "houve um erro ao deletar categoria")
        res.redirect("/admin/categorias")
    })
})

router.get('/categorias/add', eAdmin, (req, res) => { //depois dar uma olhada que era para redirecionar para /admin/categorias
    res.render('admin/addcategorias')
})

router.get("/postagens", eAdmin, (req, res)=> {
    Postagem.find().populate("categoria").lean().sort({data: "desc"}).then((postagens)=>{
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao listar as postagens"+err)
        res.redirect("/admin")
    })
})

router.get("/postagens/add", eAdmin, (req, res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg", "houve um erro: "+err)
        res.redirect("/admin")
    })
})

router.post("/postagens/nova", eAdmin, (req, res)=>{

    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto: "categoria inválida, registre uma categoria"})
    }

    if(erros.length > 0){
        res.render("admin/addpostagem", {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(()=>{
            req.flash("success_msg", "Postagem criada com suceso")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao salvar a Postagem")
            res.redirect("/admin/postagens")
        })
    }

})

router.get("/postagens/edit/:id", eAdmin, (req, res)=>{  /////// duas pesquisas ao mesmo tempo [!!!!!!!!]
    Postagem.findOne({_id: req.params.id}).then((postagem)=>{ console.log(postagem)
    
        Categoria.find().lean().then((categorias)=>{ console.log(categorias)
            res.render("admin/editepostagens", {categorias: categorias, postagem: postagem})
        }).catch((err)=>{
            req.flash("error_msg", "erro ao listar categorias")
        })
        

    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao carregar o formulario de edicao"+err)
        res.redirect("/admin/postagens")
    })
    
})

router.post("/postagem/edit", eAdmin, (req, res)=>{
    //validação opicional
    Postagem.findOne({_id: req.body.id}).then((postagem)=>{

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg", "erro interno"+err)
            res.redirect("/admin/postagens")
        })

    }).catch((err)=>{
        req.flash("error_msg", "houve um erro ao salvar edição"+err)
        res.redirect("/admin/postagens")
    })

})

router.get("/postagens/deletar/:id", eAdmin, (req, res)=>{
    Postagem.remove({_id: req.params.id}).then(()=>{
        res.redirect("/admin/postagens")
    })
})
module.exports = router