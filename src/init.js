const express = require('express');
const app = express();
const sql = require('mssql');
require('dotenv').config();

const port = process.env.PORT || 3000;

// Configuración de la conexión a SQL Server
const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    server: process.env.DB_SERVER,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // Para Azure SQL, establece en true
        trustServerCertificate: true // Para desarrollo local, establece en true
    }
};

// Middleware para parsear JSON
app.use(express.json());

// Ruta de ejemplo
app.get('/', (req, res) => {
    res.send('API funcionando');
});

// Ruta para obtener datos de la base de datos
app.get('/data', async (req, res) => {
    try {
        // Conexión a la base de datos
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request().query('SELECT * FROM Usuarios');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send({ message: `${err}` });
    }
});

app.post('/usuario/login', async (req, res) => {
    const {Nombre, Contraseña} = req.body
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('Nombre', sql.VarChar, Nombre)
            .query('SELECT * FROM Usuarios WHERE Nombre = @Nombre');

        if (result.recordset.length === 0) {
            return res.status(400).send({ message: 'Usuario no encontrado' });
        }

    

        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).send({message: `${err}`})
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
