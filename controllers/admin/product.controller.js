const Product = require('../../models/product.model');

const systemConfig = require('../../config/system');

const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");

//[GET] /admin/products
module.exports.index = async (req, res) => {
    // console.log(req.query.status);

    const filterStatus = filterStatusHelper(req.query);

    let find = {
        delete: false
    }

    if (req.query.status) {
        find.status = req.query.status;
    }

    const objectSearch = searchHelper(req.query);

    if (objectSearch.regex) {
        find.title = objectSearch.regex;
    }

    //Pagination: phan trang
    const countProducts = await Product.countDocuments(find);
    let objectPagination = paginationHelper({
            currentPage: 1,
            limitItems: 4
        },
        req.query,
        countProducts
    );

    //End Pagination

    const products = await Product.find(find)
        .sort({
            position: "desc"
        })
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);

    // console.log(products);

    res.render('admin/pages/products/index', {
        pageTitle: 'Danh sach san pham',
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}
//[PATCH] /admin/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    await Product.updateOne({
        _id: id
    }, {
        status: status
    });

    // res.redirect('..');
    // res.redirect("/admin/products");
    // res.send(`${status} - ${id}`);
    res.redirect(req.get("Referrer") || "/admin/products");
};
//[PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    switch (type) {
        case "active":
            await Product.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                status: "active"
            });
            req.flash('success', `Cập nhật trạng thái thành công ${ids.length} sản phẩm`);
            break;
        case "inactive":
            await Product.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                status: "inactive"
            });
            req.flash('success', `Cập nhật trạng thái thành công ${ids.length} sản phẩm`);
            break;
        case "delete-all":
            await Product.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                delete: true,
                deleteAt: new Date()
            });
            req.flash('success', `Xóa thành công ${ids.length} sản phẩm`);
            break;
        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-");
                position = parseInt(position);

                await Product.updateOne({
                    _id: id
                }, {
                    position: position
                });
                req.flash('success', `Cập nhật vị trí thành công ${ids.length} sản phẩm`);
            }
            break;
        default:
            break;
    }
    res.redirect(req.get("Referrer") || "/admin/products");
};
//[DELETE] /admin/products/delete/"id"
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    // await Product.deleteOne({
    //     _id: id
    // });
    await Product.updateOne({
        _id: id
    }, {
        delete: true,
        deleteAt: new Date()
    });
    req.flash('success', `Xóa thành công sản phẩm`);
    res.redirect(req.get("Referrer") || "/admin/products");
};

//[GET] /admin/products/create
module.exports.create = async (req, res) => {
    res.render('admin/pages/products/create', {
        pageTitle: 'Thêm mới sản phẩm'
    });
};

//[POST] /admin/products/createPost
module.exports.createPost = async (req, res) => {

    console.log(req.file);
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);

    if (req.body.position == "") {
        const countProducts = await Product.countDocuments();
        req.body.position = countProducts + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }

    const product = new Product(req.body);
    await product.save();
    req.flash('success', `Thêm mới sản phẩm thành công`);
    res.redirect(`${systemConfig.prefixAdmin}/products`);
};

//[GET] /admin/products/edit/:id
module.exports.edit = async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render('admin/pages/products/edit', {
        pageTitle: 'Chỉnh sửa sản phẩm',
        product: product
    });
};

//[PATCH] /admin/products/edit/:id
module.exports.editPatch = async (req, res) => {
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    req.body.position = parseInt(req.body.position);

    if (req.file) {
        req.body.thumbnail = `/uploads/${req.file.filename}`;
    }

    try {
        await Product.updateOne({
            _id: req.params.id
        }, req.body);
        req.flash('success', `Cập nhật sản phẩm thành công`);
    } catch (error) {
        req.flash('error', `Có lỗi xảy ra khi cập nhật sản phẩm`);
    }

    res.redirect(`${systemConfig.prefixAdmin}/products`);
};

//[GET] /admin/products/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const find = {
            delete: false,
            _id: req.params.id
        };

        const product = await Product.findOne(find);

        console.log(product);

        res.render('admin/pages/products/detail', {
            pageTitle: product.title,
            product: product
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
};