var vm=new Vue({
  el: '#app',
  data: {
    metadata:null,
    fetching_lock:false
  },
  methods: {
    fetchJson:()=>{
      UTILITY.ajax_fix_gpmf2json("GET","data/GPFR0142.MP4.json",{
        resolve:(data)=>{
          metadata=GPMD.extractIMUData(data);
          console.log(metadata);
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
