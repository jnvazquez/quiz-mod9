var models = require('../models/models.js');

// Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
  models.Quiz.find(quizId).then(
      function(quiz) {
        if (quiz) {
          req.quiz = quiz;
          next();
        } else { next(new Error('No existe quizId=' + quizId)); }
      }
    ).catch(function(error) {next(error);});
};

// GET /quizes
exports.index = function(req, res) {
  var searchStr = req.query.search;
  if (searchStr !== undefined) {
    models.Quiz.findAll({ 
        where : ['pregunta like ?', '%' + searchStr.replace(' ', '%') + '%'],
        order : [['pregunta', 'DESC']]
    })
      .then(function(quizes) {
        res.render('quizes/index.ejs', { quizes : quizes, errors : [] });
    });
  } else {
    models.Quiz.findAll().then(function(quizes) {
        res.render('quizes/index.ejs', { quizes : quizes, errors : [] });
    }); 
  }
};

// GET /quizes/:id
exports.show = function(req, res) {
  res.render('quizes/show', { quiz : req.quiz, errors : [] });
};

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
  var quiz = models.Quiz.build(req.body.quiz);

  quiz.validate().then(
    function(err){
      if (err) {
        res.render('quizes/new', {  quiz : quiz, errors : err.errors });
      } else {
          quiz.save({ fields : ["pregunta" , "respuesta", "categoria"]}).then( function () {
            res.redirect('/quizes');  
          });   // Redireccion a la lista de preguntas
      }
    })  
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz; // Autoload de instancia quiz
  res.render('quizes/edit', {quiz : quiz, errors : []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
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
        .save( {fields: ["pregunta", "respuesta", "categoria"]})
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