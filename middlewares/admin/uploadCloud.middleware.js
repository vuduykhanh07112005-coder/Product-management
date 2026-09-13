const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

(async function () {

    // Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME || 'u2zblexn',
        api_key: process.env.CLOUD_KEY || '758544697532831',
        api_secret: process.env.CLOUD_SECRET || 'q8-EbF_QTlBNSmaS4iUBQfuiHfg' // Click 'View API Keys' above to copy your API secret
    });

    // Upload an image
    const uploadResult = await cloudinary.uploader
        .upload(
            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
                public_id: 'shoes',
            }
        )
        .catch((error) => {
            console.log(error);
        });

    console.log(uploadResult);

    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url('shoes', {
        fetch_format: 'auto',
        quality: 'auto'
    });

    console.log(optimizeUrl);

    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url('shoes', {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });

    console.log(autoCropUrl);
})();

module.exports.upload = (req, res, next) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result.secure_url);
            req.body[req.file.fieldname] = result.secure_url;
            next();
        }

        upload(req);
    } else {
        next();
    }

};