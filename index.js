const express = require('express')
const app = express()
const port = 3000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const shortid = require('shortid')

// Con esto preparamos la base de datos
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)
db.defaults({ users: [] })
  .write()
// Sin esto no podriamos obtener los parametros POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

// Esto es necesario para poder renderear html
app.engine('html', require('ejs').renderFile);

app.get('/', function (req, res) {
  // Tengan en cuenta que esta ruta empieza en la carpeta views
  // Osea, esto es equivalente a rendererar views/index.html
  // cuando se visita http://localhost:3000/
  res.render('index.html')
})

// Esta ruta es para el formulario de login
app.get('/ingresar', function (req, res) {
  res.render('ingresar.html')
})

// De forma similar, esta ruta maneja el form de registro
app.get('/registro', function (req, res) {
  res.render('registro.html')
})

// Y esta ruta maneja lo que se envia desde el form de registro
app.post('/registro', function (req, res) {
  // Esta linea guarda el usuario en nuestra base de datos
  db.get('users')
    .push({
      id: shortid.generate(), // Nos genera un id unico para ese usuario
      email: req.body.email,
      // Aca estamos guardando la clave sin encriptar, se animan a encriptarla?
      // ESTO NO SE TIENE QUE HACER EN LA VIDA REAL, MUERE UN GATITO CADA VEZ QUE SE GUARDAN CLAVES SIN ENCRIPTAR
      // Podes probar
      // const bcrypt = require('bcrypt');
      // const hash = bcrypt.hashSync('la password', 10);
      password: req.body.password,
      name: req.body.name
    }).write()
  res.send("Registrado!")
})

// Esta ruta maneja lo que el formulario envio
// Atentos que si bien el nombre es el mismo,
// El anterior se envia usando GET y este usando POST
app.post('/ingresar', function (req, res) {
  const user = db.get('users').find({
    email: req.body.email,
    // Si hubieramos encriptado la clave,
    // No habria que usar la password aca, solo el email (mas adelante lo explico)
    password: req.body.password
  }).value()
  if(typeof(user) === 'undefined') {
    // Si el usuario esta como undefined
    // Entonces es que la combinacion email/password no existe en nuestra DB
    // Aca deberiamos enviarlo a una pagina de error
    // Para enviarlo a esa pagina podes usar res.render('esa-pagina.html') o res.redirect('/la-ruta-que-te-guste')
    // No te olvides de crear el archivo o la ruta que vayas a usar!
  } else {
    // En cambio, si llego aca el usuario existe con esa password
    // Aca podemos enviarlo a una pagina de exito por haberse logueado
    // Y tambien tenemos que firmar su token de jwt y guardarlo en algun lado
    // Podes utilizar cookies para guardarlo, por ej. res.cookie('userToken', 'lo que devolvio jwt.sign').send('Cookie lista!')
    // ¿Por que necesitamos guardar eso? Porque si tiene ese token y es valido, podemos confiar en que es el y no otro user
    // Te aconsejo guardar esta estructura
    // {
    //   userId: user.id
    // }
    // Podes consultar la docu de JWT en https://github.com/auth0/node-jsonwebtoken

    // NOTA: Tene en cuenta que si seguiste los pasos para encriptar la password
    // En este punto no estas seguro si la clave es correcta, solo sabes que existe un usuario con ese email
    // Para validar la password tendras que hacer esto:
    /*
      bcrypt.compare(req.body.password, user.password, function(_err, valid) {
        // Si valid === true, entonces la password es correcta
        // Caso contrario, esta equivocado y le tenemos que dar un chancletazo http://bit.ly/2ym5w5L
      });
    */
  }
})

app.get('/importante', function(req, res){
  // Aca toca agarrar la pala!
  // http://bit.ly/2y0s0Nl
  // Nuestro objetivo es que se renderize el archivo importante.html
  // Solo cuando el usuario ingreso correctamente, caso contrario lo enviaremos a /ingresar
  // Podes usar req.cookies para leer las cookies
  // Recorda que no solo necesitas verificar que el token exista, sino que tambien tenes que validarlo
  // Podes consultar la docu de JWT en https://github.com/auth0/node-jsonwebtoken

  console.log(req.cookies)
})

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`)
})
