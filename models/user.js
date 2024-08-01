const db = require('./database');
const bcrypt = require('bcrypt');

class User {
    // Crear un nuevo usuario
    static async create(userData) {
        const { name, email, password } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            id: this.lastID,
                            name,
                            email
                        });
                    }
                }
            );
        });
    }

    // Buscar usuario por email
    static findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM users WHERE email = ?',
                [email],
                (err, user) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(user);
                    }
                }
            );
        });
    }

    // Validar credenciales de usuario
    static async validateCredentials(email, password) {
        const user = await this.findByEmail(email);
        if (!user) {
            return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return null;
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email
        };
    }

    // Obtener usuario por ID
    static findById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT id, name, email, created_at FROM users WHERE id = ?',
                [id],
                (err, user) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(user);
                    }
                }
            );
        });
    }

    // Actualizar datos del usuario
    static update(id, userData) {
        const { name, email } = userData;
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET name = ?, email = ? WHERE id = ?',
                [name, email, id],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            id,
                            name,
                            email
                        });
                    }
                }
            );
        });
    }
}

module.exports = User; 