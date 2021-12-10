//carregando modulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const admin = require('./routes/admin') //interage com app.use() lá em baixo
    const path = require('path') //trabalha com pastas, ajuda o app.use()
    const mongoose = require('mongoose')
    const session = require("express-session")
    const flash = require("connect-flash") //faz com que as mensagens de erro fiquem so ate recarregar a pagina
    require("./models/Postagem")
    const Postagem = mongoose.model("postagens")
    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")
    const usuarios = require("./routes/usuarios")//interage com app.use()
    const passport = require("passport")//passport
    require("./config/auth")(passport) //importando passport-local
    const db = require("./config/db")
const { errorMonitor } = require('events')//nao e tao importante eu acho!
//configurações
    // session
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    // middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg") //locals criar variavel(success_msg) global
            res.locals.error_msg = req.flash("error_msg") 
            res.locals.error = req.flash("error") // este trabalha com os erros de logim do passport-local
            res.locals.user = req.user || null;//adm
            next() //nunca esquecer
        })
    // body parse
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main', runtimeOptions: { //runtimeOptions: resolve problemas
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        }}))
        app.set('view engine', 'handlebars')
    // Mongoose
        mongoose.Promise = global.Promise //nao sei para que serve mais evita erros eu acho
        mongoose.connect(db.mongoURI).then(()=>{
            console.log("conectado ao mongo")
        }).catch((err)=>{
            console.log("erro ao se conectar"+err)
        })
    //public
        app.use(express.static(path.join(__dirname, "public"))) //configura a pasta public com pasta pricipal dos arquivos staticos

        //middleware
            app.use((req, res, next)=>{
                console.log("OI EU SOU UM MIDDLEWARE")
                next() //próximo, permite que o site nao pare no middleware
            })
//rotas
    app.get('/', (req, res)=>{
        Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens)=>{
            res.render("index", {postagens: postagens})
        }).catch((err)=>{
            req.flash("error_msg", "houve um erro interno")
            res.redirect("/404")
        })
    })

    app.get("/postagem/:slug", (req, res)=>{
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem)=>{ //console.log(postagem)
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else{
                req.flash("error_msg", "Esta postagem não existe")
                res.redirect("/")
            }
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })

    app.get("/categorias", (req, res)=>{
        Categoria.find().lean().then((categorias)=>{ //console.log(categorias)
            res.render("categorias/index", {categorias: categorias})
        }).catch((err)=>{ //console.log(err)
            req.flash("error_msg", "Houve um erro interno ao listar categorias")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req, res)=>{
        Categoria.findOne({slug: req.params.slug}).then((categoria)=>{
            if(categoria){
                Postagem.find({categoria: categoria._id}).then((postagens)=>{
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                }).catch((err)=>{
                    req.flash("error_msg", "Houve um erro ao listar os posts")
                    res.redirect("/")
                })
            }else{ //console.log("err 2")
                req.flash("error_msg", "Esta categoria não existe")
                res.redirect("/")
            }
        }).catch((err)=>{ console.log(err)
            req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria")
        })
    })

    app.get("/404", (req, res)=>{
        res.send("erro 404!")
    })

    app.get('/posts', (req, res)=>{
        res.send('Lista Posts')
    })

    app.use('/admin', admin) //app.use cria diretorio rais para admin
    app.use("/usuarios", usuarios)
//outros
const PORT = process.env.PORT || 8080
app.listen(PORT, function(){
    console.log("servidor: http://localhost:8080")
})
