// server/controllers/productController.js
import { getDb } from '../database/db.js';
import { deleteImageFromCloudinary } from '../middleware/uploadCloudinary.js';

export const getAllProducts = async (req, res) => {
    try {
        const db = getDb();
        const products = await db.all('SELECT * FROM products');
        res.json(products);
    } catch (error) {
        console.error('SERVER XƏTASI (getAllProducts):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        res.status(500).json({ message: 'Məhsullar gətirilərkən server xətası baş verdi.' });
    }
};

export const addProduct = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        const imageUrl = req.file ? req.file.path : null;

        const stock = req.body.stock ? parseInt(req.body.stock) : 0; 

        if (!name || !price || !category) {
            return res.status(400).json({ message: 'Məhsul adı, qiymət və kateqoriya sahələri tələb olunur.' });
        }

        const db = getDb();
        const result = await db.run(
            'INSERT INTO products (name, description, price, category, imageUrl, stock) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, parseFloat(price), category, imageUrl, stock]
        );

        res.status(201).json({
            message: 'Məhsul uğurla əlavə edildi.',
            productId: result.lastID,
            product: { id: result.lastID, name, description, price: parseFloat(price), category, imageUrl, stock }
        });
    } catch (error) {
        console.error('SERVER XƏTASI (addProduct):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        res.status(500).json({ message: 'Məhsul əlavə edilərkən server xətası baş verdi.' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, stock, clearImage } = req.body;
        const db = getDb();

        const existingProduct = await db.get('SELECT imageUrl FROM products WHERE id = ?', [id]);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Məhsul tapılmadı.' });
        }

        let updateFields = [];
        let updateValues = [];
        let newImageUrl = existingProduct.imageUrl;

        if (req.file) {
            if (existingProduct.imageUrl) {
                await deleteImageFromCloudinary(existingProduct.imageUrl);
            }
            newImageUrl = req.file.path;
        } else if (clearImage === 'true') {
            if (existingProduct.imageUrl) {
                await deleteImageFromCloudinary(existingProduct.imageUrl);
            }
            newImageUrl = null;
        }

        if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
        if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
        if (price !== undefined) { updateFields.push('price = ?'); updateValues.push(parseFloat(price)); }
        if (category !== undefined) { updateFields.push('category = ?'); updateValues.push(category); }
        if (stock !== undefined) { updateFields.push('stock = ?'); updateValues.push(parseInt(stock)); }
        
        if (newImageUrl !== existingProduct.imageUrl) {
            updateFields.push('imageUrl = ?');
            updateValues.push(newImageUrl);
        }

        if (updateFields.length === 0) {
            const updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', [id]);
            return res.status(200).json({ 
                message: 'Yeniləmə üçün heç bir sahə təmin edilməyib və ya məlumatlarda dəyişiklik yoxdur.', 
                product: updatedProduct 
            });
        }

        const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
        updateValues.push(id);

        const result = await db.run(query, updateValues);

        if (result.changes === 0) {
            const updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', [id]);
            return res.status(200).json({ 
                message: 'Məhsul tapıldı, lakin məlumatlarda dəyişiklik olmadığı üçün yenilənmədi.', 
                product: updatedProduct 
            });
        }

        const updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', [id]);
        res.status(200).json({ 
            message: 'Məhsul uğurla yeniləndi.', 
            product: updatedProduct 
        });

    } catch (error) {
        console.error('SERVER XƏTASI (updateProduct):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        res.status(500).json({ message: 'Məhsul yenilənərkən server xətası baş verdi.' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDb();

        const product = await db.get('SELECT imageUrl FROM products WHERE id = ?', [id]);
        if (!product) {
            return res.status(404).json({ message: 'Məhsul tapılmadı.' });
        }

        const result = await db.run('DELETE FROM products WHERE id = ?', [id]);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Məhsul tapılmadı və ya silinə bilmədi.' });
        }

        if (product.imageUrl) {
            await deleteImageFromCloudinary(product.imageUrl);
        }

        res.status(200).json({ message: 'Məhsul uğurla silindi.' });
    } catch (error) {
        console.error('SERVER XƏTASI (deleteProduct):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        res.status(500).json({ message: 'Məhsul silinərkən server xətası baş verdi.' });
    }
};

export const getSingleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDb();
        const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);

        if (!product) {
            return res.status(404).json({ message: 'Məhsul tapılmadı.' });
        }

        res.json(product);
    } catch (error) {
        console.error('SERVER XƏTASI (getSingleProduct):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        res.status(500).json({ message: 'Məhsul gətirilərkən server xətası baş verdi.' });
    }
};

export const getSearchResults = async (req, res) => {
    try {
        const { q } = req.query;
        const db = getDb();
        const products = await db.all(
            `SELECT * FROM products WHERE name LIKE ? COLLATE NOCASE OR description LIKE ? COLLATE NOCASE OR category LIKE ? COLLATE NOCASE`,
            [`%${q}%`, `%${q}%`, `%${q}%`]
        );
        res.json(products);
    } catch (error) {
        console.error('SERVER XƏTASI (getSearchResults):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        res.status(500).json({ message: 'Məhsul axtarılarkən server xətası baş verdi.' });
    }
};
