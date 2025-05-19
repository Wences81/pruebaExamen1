const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();

app.use(cors());  // Permitir CORS para todas las solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const mydb = "Simulacro";
const url = "mongodb://127.0.0.1:27017/";

async function connectToMongo() {
    const client = new MongoClient(url);
    await client.connect();
    return client;
}

//Creacion de una BD 
async function crearBaseDeDatos() {
    const client = await connectToMongo();
    const db = client.db(mydb);
    console.log(`Base de datos '${mydb}' creada o conectada.`);
    await client.close();
}

//Creacion de una coleccion dentro de una BD
async function crearColeccion(coleccion) {
    const client = await connectToMongo();
    const db = client.db(mydb);
    await db.createCollection(coleccion);
    console.log(`Colección '${coleccion}' creada.`);
    await client.close();
}



//Insertar dentro de una coleccion de una BD
async function insertarDocumento(coleccion, documento) {
    const client = await connectToMongo();
    const db = client.db(mydb);
    const collection = db.collection(coleccion);
    const resultado = await collection.insertOne(documento);
    console.log(`Documento insertado con ID: ${resultado.insertedId}`);
    await client.close();
}

// Query simple
async function querySimple(coleccion, query) {
    const client = await connectToMongo();
    try {
        const db = client.db(mydb);
        const collection = db.collection(coleccion);
        const result = await collection.find(query).toArray();
        console.log(result);
        return result;
    } finally {
        await client.close();
    }
}


//Actualizar
async function actualizarDocumento(coleccion, filtro, actualizacion) {
    const client = await connectToMongo();
    const db = client.db(mydb);
    const collection = db.collection(coleccion);
    const resultado = await collection.updateOne(filtro, { $set: actualizacion });
    console.log(`${resultado.modifiedCount} documento(s) actualizado(s).`);
    await client.close();
}


//Borrar  
async function borrarDocumento(coleccion, filtro) {
    const client = await connectToMongo();
    const db = client.db(mydb);
    const collection = db.collection(coleccion);
    const resultado = await collection.deleteOne(filtro);
    console.log(`${resultado.deletedCount} documento(s) borrado(s).`);
    await client.close();
}

// Endpoint GET
app.get('/', (req, res) => {
    crearBaseDeDatos();
    crearColeccion("Usuarios");
    res.send('Peticion get para el home');
});

// Endpoint POST para el registro
app.post('/register', (req, res) => {
    //comprobacion de que me llega la informacion.
    
    insertarDocumento("Usuarios", { user: req.body.user, pass: req.body.pass });
    res.send('Se ha registrado el usuario correcto');
});

// Endpoint POST para el login
app.post('/login', async (req, res) => {
    let result = await querySimple("Usuarios", { user: req.body.user, pass: req.body.pass });
    if (result.length == 0) {
        res.send('Usuario y/o contraseña incorrectos');
    } else {
        res.send('Login correcto');
    }
});


// Endpoint PATCH
app.patch('/actualizar', async (req, res) => {
  
    await actualizarDocumento(
        "Usuarios",
        { user: req.body.user },
        { pass: req.body.nuevoPass }
    );

    res.send('Datos actualizado correcto');
});


// Endpoint DELETE
app.delete('/borrar', async (req, res) => {

    await borrarDocumento("Usuarios", { user: req.body.user });


    res.send('Soy un endpoint DELETE');
});




// Iniciar el servidor en el puerto 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
