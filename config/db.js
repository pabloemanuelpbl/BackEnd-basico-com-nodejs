//quando for ospedado
//quando estiver no heroku rode o DB do mlab
//se estiver rodando localmente use o DB local

if(process.env.NODE_ENV == "production"){ //serve para verificar se esta rodando em ambiente de produção
    module.exports = {mongoURI: "mongodb://usuario:senha@linkdoHeroku:47587/blablabla"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}
