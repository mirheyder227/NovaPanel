
 
// server/controllers/productController.js
import { getDb } from '../database/db.js';
import { deleteImageFromCloudinary } from '../middleware/uploadCloudinary.js';

export const getAllProducts = async (req, res) => {
    try {
        const db = getDb();
        const products = await db.all('SELECT * FROM products');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching products' });
    }
};

export const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        const imageUrl = req.file ? req.file.path : null;

        if (!name || !price || !category) {
            return res.status(400).json({ message: 'Məhsul adı, qiymət və kateqoriya tələb olunur.' });
        }

        const db = getDb();
        const result = await db.run(
            'INSERT INTO products (name, description, price, category, imageUrl, stock) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, parseFloat(price), category, imageUrl, parseInt(stock) || 0]
        );

        res.status(201).json({
            message: 'Məhsul uğurla əlavə edildi',
            productId: result.lastID,
            product: { id: result.lastID, name, description, price, category, imageUrl, stock: parseInt(stock) || 0 }
        });
    } catch (error) {
        res.status(500).json({ message: 'Məhsul əlavə edilərkən server xətası.' });
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
            return res.status(400).json({ message: 'Yeniləmə üçün heç bir sahə təmin edilməyib.' });
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
            message: 'Məhsul uğurla yeniləndi', 
            product: updatedProduct 
        });

    } catch (error) {
        res.status(500).json({ message: 'Məhsul yenilənərkən server xətası.' });
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
            return res.status(404).json({ message: 'Məhsul tapılmadı.' });
        }

        if (product.imageUrl) {
            await deleteImageFromCloudinary(product.imageUrl);
        }

        res.status(200).json({ message: 'Məhsul uğurla silindi' });
    } catch (error) {
        res.status(500).json({ message: 'Məhsul silinərkən server xətası.' });
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
        res.status(500).json({ message: 'Məhsul çəkilərkən server xətası.' });
    }
};

export const getSearchResults = async (req, res) => {
    try {
        const { q } = req.query;
        const db = getDb();
        const products = await db.all(
            `SELECT * FROM products WHERE name LIKE ? OR description LIKE ? OR category LIKE ?`,
            [`%${q}%`, `%${q}%`, `%${q}%`]
        );
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Məhsul axtarılarkən server xətası.' });
    }
};