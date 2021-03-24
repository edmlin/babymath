//var drawingBox=new DrawingBox({width: 100, height: 100});

function generateEquations(count,classifier){
  var equations=[];
  for(var i=0;i<10;i++){
    var operator=Math.random()>0.5?"+":"-";
    var operand1,operand2,equation;
    do{
      do{
        operand1=Math.floor(Math.random()*10);
      } while(operand1==0)
      do{
        operand2=Math.floor(Math.random()*10);
      }while(operand2==0)
      equation=new Equation(operand1,operand2,operator);
    }while(equation.inArray(equations));
    equation.setClassifier(classifier);
    equation.setSize(100);
    equations[i]=equation;
  }
  return equations;
}
function showEquations(equations){
  $("#sheet").empty();
  $("#sheet").data("equations",equations);
  for(var i=0;i<5;i++)
  {
    var row=$("<div/>",{class:"row justify-content-between"});
    var col1=$("<div/>",{class:"col-auto"});
    var col2=$("<div/>",{class:"col-auto"});
    col1.append(equations[i*2].div);
    col2.append(equations[i*2+1].div);
    row.append(col1).append(col2);
    $("#sheet").append(row);
  }
}
$(function(){
  $.blockUI({message:"Loading..."});
  var classifier=new Classifier();
  classifier.loadModel("classifiers/model.json").then(()=>$.unblockUI());
  
  showEquations(generateEquations(10,classifier));
  $("#validate").on("click",function(){
    var score=0;
    $("#sheet").data("equations").forEach(e=>e.validate()&&(score++));
    if(score==10){
      $(".score").html($("<img src='images/100.svg' width=50 height=50/><i>!</i> <img src='images/smiley.svg' width=25 height=25 style='margin-top: -20px' />"));
    }
    backgroundCanvas.clear();
  });
  $("#refresh").on("click",function(){
    showEquations(generateEquations(10,classifier));
    $(".score").empty();
    backgroundCanvas.clear();
  });

  var backgroundCanvas=new DrawingCanvas(window.innerWidth,window.innerHeight,{width:"100%",height:"100%",position:"absolute","z-index":10,margin:0,top:0,left:0});
  $("body").append(backgroundCanvas.canvas);
});
