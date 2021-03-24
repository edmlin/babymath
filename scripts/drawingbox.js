function Canvas(width,height,css={})
{
  this.canvas=document.createElement("canvas");
  this.canvas.width=width;
  this.canvas.height=height;
  this.ctx=this.canvas.getContext("2d");
  this.ctx.strokeStyle = 'black';
  this.ctx.fillStyle = 'white';
  $(this.canvas).css(css);
  this.clearCanvas=function(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };
  this.fillCanvas=function(){
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  };
}
function DrawingCanvas(width,height,css={})
{
  Canvas.call(this,width,height,css);
  this.ctx.lineWidth = 1;
  this.ctx.lineJoin = 'round';
  this.ctx.lineCap = 'round';
  this.strokes=[];
  this.computeMousePos=function(e){
    var rect=this.canvas.getBoundingClientRect();
    var scaleX=this.canvas.width/rect.width;
    var scaleY=this.canvas.height/rect.height;
    return {
      x:(e.clientX-rect.left)*scaleX,
      y:(e.clientY-rect.top)*scaleY
    };
  };
  
  this.onMouseDown=function(e){
    this.isDrawing=true;
    this.addStroke(this.computeMousePos(e));
    this.drawStrokes();
  };
  this.onMouseMove=function(e){
    if(!this.isDrawing) return;
    this.addStrokePos(this.computeMousePos(e));
    this.drawStrokes();
  };
  this.onMouseUp=function(e){
    if(this.isDrawing)
    {
      this.isDrawing=false;
      if(typeof(this.onEndDrawing)=="function"){
        this.onEndDrawing(this.canvas);
      }
    }
  };
  this.addStroke=function(pos){
    this.strokes.push([pos]);
  };
  this.addStrokePos=function(pos){
    this.strokes[this.strokes.length-1].push(pos)
  };
  this.drawStrokes=function(){
    for(var i=0;i<this.strokes.length;i++){
      var points=this.strokes[i];
      this.ctx.beginPath();
      this.ctx.moveTo(points[0].x, points[0].y);
      for (var j = 1; j < points.length; j ++) {
        this.ctx.lineTo(points[j].x, points[j].y);
      }
      this.ctx.stroke();      
    }
  };
  this.clear=function(){
    this.clearCanvas();
    this.strokes=[];
    this.isDrawing=false;
    this.result=NaN;
  };
  $(this.canvas).on(" pointerdown",this.onMouseDown.bind(this));
  $(this.canvas).on(" pointermove",this.onMouseMove.bind(this));
  $(this.canvas).on(" pointerup",this.onMouseUp.bind(this));
  $(this.canvas).on(" pointerleave",this.onMouseUp.bind(this));
  $(this.canvas).on("touchstart",(e)=>e.preventDefault());
}
function DrawingBox(css={})
{
  DrawingCanvas.call(this,280,280,css)
  this.ctx.lineWidth = 10;
  this.result=NaN;
  this.onEndDrawing=function(canvas){
      this.result=process(this.classifier, this.canvas);
  };
  this.clear();
  this.fillCanvas();
}

function BoundingBox(width,height,css)
{
  Canvas.call(this,width,height,css);
  this.draw=function(canvas){
    var ctx=canvas.getContext("2d");
    var imageData=ctx.getImageData(0,0,canvas.width,canvas.height);
    var rect=computeBoundingRect(imageData);
    var scaleX=this.canvas.width/canvas.width;
    var scaleY=this.canvas.height/canvas.height;
    var x=rect.xmin*scaleX;
    var y=rect.ymin*scaleY;
    var width=rect.computeWidth()*scaleX;
    var height=rect.computeHeight()*scaleY;
    this.fillCanvas();
    this.ctx.drawImage(canvas,0,0,canvas.width,canvas.height,0,0,this.canvas.width,this.canvas.height);
    this.ctx.strokeStyle='red';
    this.ctx.strokeRect(x,y,width,height);
  };
  this.clearCanvas();
}
CroppedBox=function(width,height,css={}){
  Canvas.call(this,width,height,css);
  this.draw=function(canvas){
    var ctx=canvas.getContext("2d");
    var imageData=ctx.getImageData(0,0,canvas.width,canvas.height);
    var rect=computeBoundingRect(imageData);
    var rectWidth = rect.computeWidth();
    var rectHeight = rect.computeHeight();
    var scalingFactor = Math.min(this.canvas.width / rectWidth, this.canvas.height/rectHeight);
    this.croppedRectSize = {
    width: rectWidth * scalingFactor,
    height: rectHeight * scalingFactor,
    };
    this.fillCanvas();
    this.ctx.drawImage(canvas,rect.xmin,rect.ymin,rectWidth,rectHeight,0,0,this.croppedRectSize.width,this.croppedRectSize.height);
  };
  this.clearCanvas();
}
CenteredBox=function(width,height,css={}){
  Canvas.call(this,width,height,css);
  this.draw=function(canvas,croppedRectSize){
    if(croppedRectSize==undefined){
      var rect=computeBoundingRect(canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height));
      croppedRectSize={width: rect.computeWidth(), height: rect.computeHeight()};
    }
    this.fillCanvas();
    this.ctx.drawImage(canvas,(this.canvas.width-croppedRectSize.width)/2, (this.canvas.height-croppedRectSize.height)/2);
  };
}
NormalizedBox=function(width,height,css={}){
  Canvas.call(this,width,height,css);
  this.draw=function(canvas){
    this.fillCanvas();
    this.ctx.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  };
};

function process(classifier, canvas)
{
  var boundingBox=new BoundingBox(280,280);
  var croppedBox=new CroppedBox(200,200);
  var centeredBox=new CenteredBox(280,280);
  var normalizedBox=new NormalizedBox(28,28);
  boundingBox.draw(canvas);
  croppedBox.draw(canvas);
  centeredBox.draw(croppedBox.canvas);
  normalizedBox.draw(centeredBox.canvas);
  var result=predict(classifier, normalizedBox.canvas);
  return result;
}

function predict(classifier, canvas)
{
  var ctx=canvas.getContext("2d");
  imageData=ctx.getImageData(0,0,canvas.width,canvas.height);
  const dataGrayscale = convertToGrayscale(imageData);
  const dataTensor = tf.tensor(dataGrayscale, [1, 28, 28, 1]);
  const prediction = classifier.predict(dataTensor);
  return prediction;
}