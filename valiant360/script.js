var vm=new Vue({
  el: '#fileinput',
  data: {
    metadata:null,
    fetching_lock:false
  },
  methods: {
    fetchJson:(e)=>{
      var files = e.target.files
      var json_path = null;
      var mp4_path = null;
      for (var i = 0; i < files.length; ++i){
        if (files[i].name.match(/json/i) != null) {
          var json_path = "data/" + files[i].name;
          console.log(json_path);
        }
        else if (files[i].name.match(/META/i) != null) {
          var meta_path = "data/" + files[i].name;
          console.log(meta_path);
        }
        else {
          var mp4_path = "data/" + files[i].name;
          console.log(mp4_path);
        }
      }

      UTILITY.ajax_fix_gpmf2json("GET", json_path,{
        resolve:(data)=>{
          UTILITY.fetch_txt("GET", meta_path, {
            resolve:(data)=>{
              let sensorData;
              sensorData = UTILITY.parseSensorData(data);
              playerv360[0].setSensorOrientation(sensorData);
            }
          });
          metadata=GPMD.extractIMUData(data);
          console.log(metadata);

          console.log(">>>",playerv360);
          playerv360[0].setOrientationData(metadata);
          playerv360[0].loadVideo(mp4_path);
          playerv360[0].play();
        },
        reject:(data)=>{
          console.log(data);
          metadata=null;
        }
      });
    }
  },

  beforeCreated: function () {
    // console.log('beforeCreated: ')
  },
  created: function () {
    // `this` points to the vm instance
    // console.log('created: ')
  },
  beforeMount: function () {
    // `this` points to the vm instance
    // console.log('beforeMount: ')
  },
  mounted: function () {
    // `this` points to the vm instance
    // console.log('mounted: ')
    // console.log(this)
  },
  beforeUpdate: function () {
    // `this` points to the vm instance
    // console.log('beforeUpdate: ')
  },
  updated: function () {
    // `this` points to the vm instance
    // console.log('updated: ')
  },
  beforeDestroy: function () {
    // `this` points to the vm instance
    // console.log('beforeDestroy: ')
  } ,
  destroyed: function () {
    // `this` points to the vm instance
    // console.log('destroyed: ')
  }
})


vm.$watch('message', function (newVal, oldVal) {
  // console.log(newVal,"\n>",oldVal);
  // this callback will be called when `vm.a` changes
})
