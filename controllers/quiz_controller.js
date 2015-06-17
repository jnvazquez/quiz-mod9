var models = require('../models/models.js');

// MW que permite acciones solamente si el quiz objeto pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next){
    var objQuizOwner = req.quiz.UserId;
    var logUser = req.session.user.id;
    var isAdmin = req.session.user.isAdmin;

    if (isAdmin || objQuizOwner === logUser) {
        next();
    } else {
        res.redirect('/');
    }
};

// Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
            where: {
                id: Number(quizId)
            },
            include: [{
                model: models.Comment
            }]
        }).then(function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else{next(new Error('No existe quizId=' + quizId))}
    }
  ).catch(function(error){next(error)});
};

// GET /quizes
// GET /users/:userId/quizes
exports.index = function(req, res) {  
  var options = {};
  if(req.user){
    options.where = {UserId: req.user.id};
  }
  
  models.Quiz.findAll(options).then(
    function(quizes) {
      res.render('quizes/index.ejs', {quizes: quizes, errors: []});
    }
  );
};

// GET /quizes/:id
exports.show = function(req, res) {
  res.render('quizes/show', { quiz: req.quiz, errors: []});
};            // req.quiz: instancia de quiz cargada con autoload

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta.toLowerCase() === req.quiz.respuesta.toLowerCase()) {
    resultado = 'Correcto';
  }
  res.render('quizes/answer',
            { quiz : req.quiz, respuesta : resultado, errors : [] });
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build( // Crea el objeto Quiz
      { pregunta : "Pregunta", respuesta : "Respuesta", categoria : "categoria"}
    );
  
  res.render('quizes/new', { quiz : quiz, errors : [] });
};

// POST /quizes/create
exports.create = function(req, res) {
  req.body.quiz.UserId = req.session.user.id;
 
  if(req.files.image){
    req.body.quiz.image = req.files.image.name;
  }
  
  var quiz = models.Quiz.build(req.body.quiz);

  quiz.validate().then(
    function(err){
      if (err) {
        res.render('quizes/new', {  quiz : quiz, errors : err.errors });
      } else {
          quiz.save({ fields : ["pregunta" , "respuesta", "categoria", "UserId", "image"]}).then( function () {
            res.redirect('/quizes');  
          });   // Redireccion a la lista de preguntas
      }
    });
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz; // Autoload de instancia quiz
  res.render('quizes/edit', {quiz : quiz, errors : []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  if(req.files.image){
    req.quiz.image = req.files.image.name;
  }
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.categoria = req.body.quiz.categoria;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta, respuesta y categoria en DB
        .save( {fields: ["pregunta", "respuesta", "categoria", "image"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  );
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  });
};

// GET /author
exports.author = function(req, res) {
    var data = [];
    var autor = new Object;
    autor['nombre'] = 'Jorge Navarro';
    autor['imagen'] = '/images/author_1.png';
    data.push(autor);
    res.render('author', {autores: data, errors : []});
};