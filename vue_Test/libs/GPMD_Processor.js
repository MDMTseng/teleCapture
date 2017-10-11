var GPMD={
  func1:()=>{
    quat1 = new THREE.Quaternion();
    console.log(quat1)
  },

  extractIMUData:(gpmf_json)=>{

  }


}


var UTILITY={

  ajax:(METHOD,URL,promise)=>{
    var xhr = new XMLHttpRequest();
    xhr.open(METHOD, URL);
    xhr.onload = function() {
        if (xhr.status === 200) {
            var obj=JSON.parse(xhr.responseText);
            promise.resolve(obj);
        }
        else {
            promise.reject(xhr);
        }
    };
    xhr.send();
  }



}
