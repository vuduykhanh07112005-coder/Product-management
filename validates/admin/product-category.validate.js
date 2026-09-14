module.exports.createPost = (req, res, next) => {
    if (!req.body.title) {
        req.flash('error', `Vui lòng nhập tên sản phẩm`);
        res.redirect(req.get("Referrer") || "/admin/products/create");
        return;
    }
    next();
}

module.exports.editPatch = (req, res, next) => {
    if (!req.body.title) {
        req.flash('error', `Vui lòng nhập tên sản phẩm`);
        res.redirect(req.get("Referrer") || "/admin/products/edit/" + req.params.id);
        return;
    }
    next();
}