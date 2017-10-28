var vm=new Vue({
  el: '#app',
  data: {
    metadata:null,
    fetching_lock:false
  },
  methods: {

    fetchJson:()=>{
      code="0479";
      UTILITY.ajax_fix_gpmf2json("GET","data/GPFR"+code+".MP4.json",{
        resolve:(data)=>{
          metadata=GPMD.extractIMUData(data);
          console.log(metadata);


          console.log(">>>",playerv360);
          playerv360[0].setOrientationData(metadata);
          playerv360[0].loadVideo("data/VIDEO_"+code+".mp4");
          playerv360[0].play();
        },
        reject:(data)=>{
          console.log(data);
          metadata=null;
        }
      })
    }
  },

  beforeCreated: function () {
    console.log('beforeCreated: ')
  },
  created: function () {
    // `this` points to the vm instance
    console.log('created: ')
  },
  beforeMount: function () {
    // `this` points to the vm instance
    console.log('beforeMount: ')
  },
  mounted: function () {
    // `this` points to the vm instance
    console.log('mounted: ')
    console.log(this)
  },
  beforeUpdate: function () {
    // `this` points to the vm instance
    console.log('beforeUpdate: ')
  },
  updated: function () {
    // `this` points to the vm instance
    console.log('updated: ')
  },
  beforeDestroy: function () {
    // `this` points to the vm instance
    console.log('beforeDestroy: ')
  } ,
  destroyed: function () {
    // `this` points to the vm instance
    console.log('destroyed: ')
  }
})


vm.$watch('message', function (newVal, oldVal) {
  console.log(newVal,"\n>",oldVal);
  // this callback will be called when `vm.a` changes
})
