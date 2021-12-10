module.exports = {
    eAdmin: function(req, res, next){
        //verificação por admin
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next();
        }

        req.flash("error_msg", "Você percisa ser um admin")
        res.redirect("/")
    }
}