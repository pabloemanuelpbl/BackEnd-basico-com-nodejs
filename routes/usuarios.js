//express
const express = require('express')
const router = express.Router()
//
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require('passport')

router.get("/registro", (req, res)=>{
    res.render("usuarios/registro")
})

router.post("/registro", (req, res)=>{
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome Inválido"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "Email Inválido"})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha Inválido"})
    }

    if(req.body.senha.length < 4){
        erros.push({texto: "Senha muito curta"})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "As senhas são diferentes, tente novamente!"})
    }


    if(erros.length > 0){

        res.render("usuarios/registro", {erros: erros})

    }else{
        Usuario.findOne({email: req.body.email}).lean().then((usuario)=>{
            if(usuario){
                req.flash("error_msg", "Já existe uma conta com este e-mail no nosso sistema")
                res.redirect("/usuarios/registro")
            }else{
                
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                    //eAdmin: 1
                })

                //bcrypt gera um hash para ser armazendo no sistema com segurança
                bcrypt.genSalt(10, (erro, salt)=>{ //esta linha gera o 'salt' que aumenta a dificuldade do hash
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash)=>{
                            if(erro){
                                req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                                res.redirect("/")
                            }//pense
                            novoUsuario.senha = hash

                            novoUsuario.save().then(()=>{
                                req.flash("success_msg", "Usuario criado com sucesso!")
                                res.redirect("/")
                            }).catch((err)=>{
                                req.flash("error_msg", "Houve um erro ao criar o usuário, tente novamente!")
                                res.redirect("/usuarios/registro")
                            })
                            
                    } ) //esta linha gera o hash com o salt
                 })

            }
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro")
            res.redirect("/")
        })
    }
})

router.get("/login", (req, res)=>{
    res.render("usuarios/login")
})

router.post("/login", (req, res, next)=>{
    passport.authenticate("local", { //função para autenticar
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})

router.get("/logout", (req, res)=>{
    req.logout() //passport logout 
    req.flash("success_msg", "Deslogado com sucesso!")
    res.redirect("/")
})

module.exports = router