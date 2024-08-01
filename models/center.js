const db = require('./database');

class Center {
    // Crear un nuevo centro
    static create(centerData) {
        const { name, location, latitude, longitude, user_id } = centerData;
        
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO centers (name, location, latitude, longitude, user_id) VALUES (?, ?, ?, ?, ?)',
                [name, location, latitude, longitude, user_id],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            id: this.lastID,
                            name,
                            location,
                            latitude,
                            longitude,
                            user_id
                        });
                    }
                }
            );
        });
    }

    // Obtener todos los centros de un usuario
    static findByUserId(userId) {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM centers WHERE user_id = ? ORDER BY created_at DESC',
                [userId],
                (err, centers) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(centers);
                    }
                }
            );
        });
    }

    // Obtener un centro específico
    static findById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM centers WHERE id = ?',
                [id],
                (err, center) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(center);
                    }
                }
            );
        });
    }

    // Actualizar datos del centro
    static update(id, centerData) {
        const { name, location, latitude, longitude } = centerData;
        
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE centers SET name = ?, location = ?, latitude = ?, longitude = ? WHERE id = ?',
                [name, location, latitude, longitude, id],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            id,
                            name,
                            location,
                            latitude,
                            longitude
                        });
                    }
                }
            );
        });
    }

    // Eliminar un centro
    static delete(id) {
        return new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM centers WHERE id = ?',
                [id],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                }
            );
        });
    }

    // Obtener mediciones de un centro
    static getMeasurements(centerId) {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM measurements WHERE center_id = ? ORDER BY measurement_date ASC',
                [centerId],
                (err, measurements) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(measurements);
                    }
                }
            );
        });
    }

    // Agregar una nueva medición
    static addMeasurement(centerId, measurementData) {
        const { measurement_date, size } = measurementData;
        
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO measurements (center_id, measurement_date, size) VALUES (?, ?, ?)',
                [centerId, measurement_date, size],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            id: this.lastID,
                            center_id: centerId,
                            measurement_date,
                            size
                        });
                    }
                }
            );
        });
    }
}

module.exports = Center; 