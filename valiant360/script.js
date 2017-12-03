var vm=new Vue({
  el: '#app',
  data: {
    metadata:null,
    fetching_lock:false,
    directorCut_config:"{}"
  },
  methods: {
    fetchJson:(e)=>{
      var files = e.target.files
      var json_path = null;
      var directorCut_path = null;
      var mp4_path = null;
      for (var i = 0; i < files.length; ++i){
        if (files[i].name.match(/GPFR/i) != null) {
          var json_path = URL.createObjectURL(files[i]);
          console.log(json_path);
          UTILITY.ajax_fix_gpmf2json("GET", json_path,{
            resolve:(data)=>{

              console.log(data);
              let MetaPack=GPMD.extractIMUData(data);
              console.log(MetaPack);

              console.log(">>>",playerv360);
              playerv360[0].setOrientationData(MetaPack.IMU_DATA,MetaPack.frameRate);

            },
            reject:(data)=>{
              console.log(data);
              metadata=null;
            }
          });
        }
        else if (files[i].name.match(/META/i) != null) {
          var meta_path = URL.createObjectURL(files[i]);
          console.log(files[i].name);
        }
        else if (files[i].name.match(/GPDC/i) != null) {
          var directorCut_path = URL.createObjectURL(files[i]);
          UTILITY.ajax("GET", directorCut_path, {
            resolve:(data)=>{
              playerv360[0].setDirectorCut_config(data);
              UI_Bridge.Set_directorCut_config(data);
            }
          });
          console.log(files[i].name);
        }
        else {
          var fileURL = URL.createObjectURL(files[i])
          var mp4_path = fileURL;
          console.log(files[i].name);
          playerv360[0].loadVideo(mp4_path);
          playerv360[0].play();
        }
      }



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

let UI_directorCutLatch=false;
vm.$watch('directorCut_config', function (newVal, oldVal) {
  if(UI_directorCutLatch == true)
  {
    UI_directorCutLatch=false;
    return;
  }

  playerv360[0].setDirectorCut_config(JSON.parse(newVal));
})

let UI_Bridge={
  Set_directorCut_config:(dirC_conf)=>{
    let str=JSON.stringify(dirC_conf);
    var newline = String.fromCharCode(13, 10);
    str=str.replace(/,\{/g,'\n,{');
    console.log(str);
    UI_directorCutLatch=true;
    vm.$set(vm, 'directorCut_config', str);
  }
}
