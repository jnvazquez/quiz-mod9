// Definicion del modelo de Quiz

module.exports = function(sequlize, DataTypes) {
    return sequlize.define('Quiz',
        {   pregunta : {
                type        : DataTypes.STRING,
                validate    : {notEmpty : {  msg : "-> Falta pregunta"   }}
            },
            respuesta :  {
                type        : DataTypes.STRING,
                validate    : {notEmpty : {  msg : "-> Falta respuesta"   }}
            },
            categoria :  {
                type        : DataTypes.STRING,
                validate    : {notEmpty : {  msg : "-> Falta categoría"   }}
            },
         });
}