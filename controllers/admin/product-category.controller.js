//[GET] /admin/products-category
module.exports.index = async (req, res) => {

    res.render('admin/pages/products-category/index', {
        pageTitle: 'Danh sach danh muc san pham',
        
    });
}