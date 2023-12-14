
let preguntas= new Map();
preguntas.set("0","Es una plataforma que contribuye en la ayuda de los perros callejeros");
preguntas.set("1","Nos ubicamos en Las Palmas de Gran Canaria");
preguntas.set("2", "Habilitaremos una zona de donación, pero mientras si te interesa ven a visitarnos");

function cambioSelect(){
    var questions = document.getElementsByName("questions")
    var respuesta = document.getElementById("respuestap")
    var num = questions[0].selectedIndex;
    respuesta.innerHTML = preguntas.get(''+num)
}

