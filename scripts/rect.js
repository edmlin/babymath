Rect=function(image){
    this.xmin = image.width;
    this.xmax = -1;
    this.ymin = image.height;
    this.ymax = -1;
    this.computeWidth=function(){
      return this.xmax-this.xmin+1;
    };
    this.computeHeight=function(){
      return this.ymax-this.ymin+1;
    };
}