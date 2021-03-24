
function countDigits(number)
{
  var i=1;
  while(Math.floor(number/10)>0)
  {
    i++;
    number=Math.floor(number/10);
  }
  return i;
}
function Equation(operand1, operand2, operator){
  this.operand1=operand1;
  this.operand2=operand2;
  this.operator=operator;
  this.result=0;
  switch(this.operator)
  {
    case "+":
      this.result=this.operand1+this.operand2;
      break;
    case "-":
      if(this.operand1<this.operand2){
        var tmp=this.operand1;
        this.operand1=this.operand2;
        this.operand2=tmp;
      }
      this.result=this.operand1-this.operand2;
      break;
    case "x":
      this.result=this.operand1*this.operand2;
      break;
  }

  this.isSame=function(equ){
    return this.operand1==equ.operand1 &&
           this.operand2==equ.operand2 &&
           this.operator==equ.operator;
  };
  this.inArray=function(equs){
    for(var i=0;i<equs.length;i++){
      if(this.isSame(equs[i])){
        return true;
      }
    }
    return false;
  }
  this.setClassifier=function(c){
    this.classifier=c;
  };

  this.setSize=function(size){
    var div=$("<div/>", {class: "equation"});
    div.css('height',size);
    div.css('font-size', size);
    div.text(this.operand1+this.operator+this.operand2+"=")
    this.resultBoxes=[];
    for(var i=0;i<countDigits(this.result);i++)
    {
      this.resultBoxes[i]=new DrawingBox({height: size*.7, width: size*.7,"z-index":100});
      this.resultBoxes[i].classifier=this.classifier;
      div.append(this.resultBoxes[i].canvas)
    }
    var img=$("<img/>",{class:"eraser", height:size/2, height:size/2});
    img.attr("src","images/eraser.svg");
    img.on("click",()=>this.resultBoxes.forEach(i=>i.clear()));
    div.append(img);
    div.append($("<div/>",{class:"validate"}).css({height:size, width: size/2,"min-width": size/2}));
    this.div=div;
  };
  this.validate=function(){
    var answer=0;
    this.resultBoxes.forEach(i=>answer=answer*10+i.result);
    if(this.result==answer){
      this.div.children(".validate").empty().append($("<img/>",{width:50,height:50}).attr("src","images/red_check.svg"));
      return true;
    }
    else {
      this.div.children(".validate").empty();
      return false;
    }
  };
}