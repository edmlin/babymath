Classifier=function(){
  this.loadModel=async function(json){
    this.model=await tf.loadLayersModel(json);
  };
  this.predict=function(dataTensor) {
    return tf.tidy(() => {
      const output = this.model.predict(dataTensor);

      const axis = 1;
      const predictions = Array.from(output.argMax(axis).dataSync());

      return predictions[0];
    });
  }
}